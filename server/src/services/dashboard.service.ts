/**
 * services/dashboard.service.ts
 * Aggregate stats for the dashboard.
 */
import { query } from '../db/pool';
import { DashboardStats } from '../types/db.types';
import { getFinancialOverview } from './financial.service';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Run all stat queries in parallel
  const [
    assetCounts,
    byCategory,
    byStatus,
    recentAssignments,
    recentAudit,
    financials,
  ] = await Promise.all([
    // Total + per-status counts
    query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) AS count
        FROM assets
       GROUP BY status
    `),
    // Assets per category
    query<{ category: string; count: string }>(`
      SELECT COALESCE(c.name, 'Uncategorized') AS category, COUNT(*) AS count
        FROM assets a
        LEFT JOIN categories c ON c.id = a.category_id
       GROUP BY c.name
       ORDER BY count DESC
       LIMIT 10
    `),
    // Just to have by-status for chart
    query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) AS count FROM assets GROUP BY status
    `),
    // Assignments in the last 30 days
    query<{ count: string }>(`
      SELECT COUNT(*) AS count FROM assignments
       WHERE assigned_at >= NOW() - INTERVAL '30 days'
    `),
    // Audit events in last 7 days
    query<{ count: string }>(`
      SELECT COUNT(*) AS count FROM audit_logs
       WHERE created_at >= NOW() - INTERVAL '7 days'
    `),
    // Financial overview
    getFinancialOverview(),
  ]);

  // Build status map
  const statusMap: Record<string, number> = {};
  assetCounts.rows.forEach((r) => { statusMap[r.status] = parseInt(r.count, 10); });
  const total_assets      = Object.values(statusMap).reduce((s, v) => s + v, 0);

  return {
    total_assets,
    available_assets:  statusMap['available']         ?? 0,
    assigned_assets:   statusMap['assigned']          ?? 0,
    under_maintenance: statusMap['under_maintenance'] ?? 0,
    retired_assets:    statusMap['retired']           ?? 0,
    assets_by_category: byCategory.rows.map((r) => ({
      category: r.category,
      count:    parseInt(r.count, 10),
    })),
    assets_by_status: byStatus.rows.map((r) => ({
      status: r.status as DashboardStats['assets_by_status'][0]['status'],
      count:  parseInt(r.count, 10),
    })),
    recent_assignments:  parseInt(recentAssignments.rows[0]?.count ?? '0', 10),
    recent_audit_events: parseInt(recentAudit.rows[0]?.count ?? '0', 10),
    // Financial fields
    total_purchase_cost:       financials.total_purchase_cost,
    total_current_book_value:  financials.total_current_book_value,
    total_depreciation:        financials.total_depreciation,
  };
};

