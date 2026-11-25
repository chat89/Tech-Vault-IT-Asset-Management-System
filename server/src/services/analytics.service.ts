/**
 * services/analytics.service.ts
 * Procurement Forecasting & Inventory Runway Engine.
 * Calculates category-level burn rate, available stock, runway days,
 * lead times, safety stocks, reorder points, and reorder projections.
 */
import { query } from '../db/pool';

export type ForecastingRiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY';

// Category-specific procurement lead times (days)
const CATEGORY_LEAD_TIMES: Record<string, number> = {
  Server: 30,
  Network: 21,
  Laptop: 14,
  Monitor: 10,
  'Mobile Device': 14,
  Storage: 21,
  Peripherals: 7,
  Printer: 14,
  Desktop: 14,
};

const DEFAULT_LEAD_TIME_DAYS = 14;
const DEFAULT_SAFETY_BUFFER_DAYS = 30; // 30 days of safety stock

export interface CategoryForecast {
  category_id: string;
  category_name: string;
  total_assets: number;
  available_stock: number;
  assigned_stock: number;
  maintenance_stock: number;
  pending_requests: number;
  monthly_burn_rate: number;
  daily_burn_rate: number;
  runway_days: number | null;
  risk_level: ForecastingRiskLevel;
  projected_stockout_date: string | null;
  lead_time_days: number;
  safety_stock_units: number;
  reorder_point: number;
  suggested_reorder_qty: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
}

export interface ForecastingOverview {
  critical_categories_count: number;
  warning_categories_count: number;
  healthy_categories_count: number;
  total_recommended_reorder_units: number;
  model_parameters: {
    safety_buffer_days: number;
    calculation_date: string;
    target_inventory_horizon_days: number;
  };
  categories: CategoryForecast[];
}

export const getProcurementForecast = async (): Promise<ForecastingOverview> => {
  // 1. Category assets breakdown
  const assetsRes = await query<{
    category_id: string;
    category_name: string;
    total_assets: string;
    available_stock: string;
    assigned_stock: string;
    maintenance_stock: string;
  }>(`
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      COUNT(a.id) AS total_assets,
      COUNT(CASE WHEN a.status = 'available' THEN 1 END) AS available_stock,
      COUNT(CASE WHEN a.status = 'assigned' THEN 1 END) AS assigned_stock,
      COUNT(CASE WHEN a.status = 'under_maintenance' THEN 1 END) AS maintenance_stock
    FROM categories c
    LEFT JOIN assets a ON a.category_id = c.id AND a.status != 'disposed'
    GROUP BY c.id, c.name
    HAVING COUNT(a.id) > 0
    ORDER BY c.name ASC
  `);

  // 2. Assignment historical data (scaled to 30 days)
  const assignmentsRes = await query<{
    category_id: string;
    count: string;
    span_days: string;
  }>(`
    SELECT
      a.category_id,
      COUNT(asgn.id) AS count,
      GREATEST(30, EXTRACT(EPOCH FROM (MAX(asgn.assigned_at) - MIN(asgn.assigned_at))) / 86400) AS span_days
    FROM assignments asgn
    JOIN assets a ON a.id = asgn.asset_id
    WHERE a.category_id IS NOT NULL
    GROUP BY a.category_id
  `);

  const assignmentsMap = new Map<string, { count: number; spanDays: number }>();
  assignmentsRes.rows.forEach((r) => {
    assignmentsMap.set(r.category_id, {
      count: parseInt(r.count, 10),
      spanDays: Math.max(30, parseFloat(r.span_days)),
    });
  });

  // 3. Pending/approved asset requests per category
  const requestsRes = await query<{ category_id: string; pending_count: string }>(`
    SELECT
      category_id,
      COUNT(*) AS pending_count
    FROM asset_requests
    WHERE status IN ('pending', 'approved') AND category_id IS NOT NULL
    GROUP BY category_id
  `);

  const requestsMap = new Map<string, number>();
  requestsRes.rows.forEach((r) => {
    requestsMap.set(r.category_id, parseInt(r.pending_count, 10));
  });

  // 4. Calculate forecast metrics per category
  const forecasts: CategoryForecast[] = assetsRes.rows.map((row) => {
    const totalAssets      = parseInt(row.total_assets, 10);
    const availableStock   = parseInt(row.available_stock, 10);
    const assignedStock    = parseInt(row.assigned_stock, 10);
    const maintenanceStock = parseInt(row.maintenance_stock, 10);
    const pendingRequests  = requestsMap.get(row.category_id) ?? 0;

    const asgnData = assignmentsMap.get(row.category_id);
    let monthlyBurn = 0;
    let confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED' = 'ESTIMATED';

    if (asgnData && asgnData.count > 0) {
      const rawMonthly = asgnData.count / (asgnData.spanDays / 30);
      monthlyBurn = Math.max(0.5, Math.round(rawMonthly * 10) / 10);
      confidence = asgnData.count >= 3 ? 'HIGH' : 'MEDIUM';
    } else if (assignedStock > 0) {
      monthlyBurn = Math.max(0.3, Math.round((assignedStock * 0.15) * 10) / 10);
      confidence = 'MEDIUM';
    } else {
      monthlyBurn = 0.2;
      confidence = 'ESTIMATED';
    }

    const dailyBurn = monthlyBurn / 30;
    const leadTimeDays = CATEGORY_LEAD_TIMES[row.category_name] ?? DEFAULT_LEAD_TIME_DAYS;
    const safetyStock = Math.ceil(dailyBurn * DEFAULT_SAFETY_BUFFER_DAYS);
    const reorderPoint = Math.ceil((dailyBurn * leadTimeDays) + safetyStock);

    // Runway calculation (days until stockout)
    let runwayDays: number | null = null;
    let riskLevel: ForecastingRiskLevel = 'HEALTHY';
    let projectedStockoutDate: string | null = null;

    const netAvailable = Math.max(0, availableStock - pendingRequests);

    if (availableStock <= 0 || netAvailable === 0) {
      runwayDays = 0;
      riskLevel = 'CRITICAL';
      projectedStockoutDate = new Date().toISOString();
    } else if (dailyBurn > 0) {
      runwayDays = Math.round(netAvailable / dailyBurn);

      if (runwayDays <= leadTimeDays || netAvailable === 0) {
        riskLevel = 'CRITICAL';
      } else if (runwayDays <= leadTimeDays + DEFAULT_SAFETY_BUFFER_DAYS) {
        riskLevel = 'WARNING';
      } else {
        riskLevel = 'HEALTHY';
      }

      const projected = new Date();
      projected.setDate(projected.getDate() + runwayDays);
      projectedStockoutDate = projected.toISOString();
    }

    // Suggested replenishment quantity: brings inventory up to 90-day target + covers backorders
    const targetBuffer = Math.ceil(monthlyBurn * 3);
    const suggestedReorder = Math.max(
      0,
      targetBuffer + pendingRequests - availableStock
    );

    return {
      category_id:             row.category_id,
      category_name:           row.category_name,
      total_assets:            totalAssets,
      available_stock:         availableStock,
      assigned_stock:          assignedStock,
      maintenance_stock:       maintenanceStock,
      pending_requests:        pendingRequests,
      monthly_burn_rate:       monthlyBurn,
      daily_burn_rate:         Math.round(dailyBurn * 100) / 100,
      runway_days:             runwayDays,
      risk_level:              riskLevel,
      projected_stockout_date: projectedStockoutDate,
      lead_time_days:          leadTimeDays,
      safety_stock_units:      safetyStock,
      reorder_point:           reorderPoint,
      suggested_reorder_qty:   suggestedReorder,
      confidence_level:        confidence,
    };
  });

  // Sort critical first, then warning, then healthy
  const riskPriority: Record<ForecastingRiskLevel, number> = {
    CRITICAL: 1,
    WARNING:  2,
    HEALTHY:  3,
  };
  forecasts.sort((a, b) => {
    if (riskPriority[a.risk_level] !== riskPriority[b.risk_level]) {
      return riskPriority[a.risk_level] - riskPriority[b.risk_level];
    }
    return (a.runway_days ?? 999) - (b.runway_days ?? 999);
  });

  const criticalCount = forecasts.filter((f) => f.risk_level === 'CRITICAL').length;
  const warningCount  = forecasts.filter((f) => f.risk_level === 'WARNING').length;
  const healthyCount  = forecasts.filter((f) => f.risk_level === 'HEALTHY').length;
  const totalReorder  = forecasts.reduce((sum, f) => sum + f.suggested_reorder_qty, 0);

  return {
    critical_categories_count: criticalCount,
    warning_categories_count:  warningCount,
    healthy_categories_count:  healthyCount,
    total_recommended_reorder_units: totalReorder,
    model_parameters: {
      safety_buffer_days: DEFAULT_SAFETY_BUFFER_DAYS,
      calculation_date: new Date().toISOString(),
      target_inventory_horizon_days: 90,
    },
    categories: forecasts,
  };
};
