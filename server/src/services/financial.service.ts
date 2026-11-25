/**
 * services/financial.service.ts
 * Financial Lifecycle & Depreciation Engine.
 * Computes real-time book values via the asset_financials view and pure utility helpers.
 */
import { query } from '../db/pool';
import { AssetFinancialRow } from '../types/db.types';

export interface DepreciationCalculationInput {
  purchaseCost: number;
  purchaseDate: Date | string;
  salvageValue?: number;
  usefulLifeYears?: number;
  depreciationModel?: 'STRAIGHT_LINE' | 'DOUBLE_DECLINING';
  asOfDate?: Date | string;
  isDisposed?: boolean;
}

export interface DepreciationCalculationResult {
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationModel: 'STRAIGHT_LINE' | 'DOUBLE_DECLINING';
  ageYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  depreciatedPercentage: number;
  isFullyDepreciated: boolean;
}

/**
 * Pure calculation function for single-asset depreciation.
 * Supports Straight-Line and Double-Declining Balance models,
 * enforced salvage floors, and non-negative bounds.
 */
export const calculateDepreciation = (
  input: DepreciationCalculationInput
): DepreciationCalculationResult => {
  const purchaseCost = Math.max(0, Number(input.purchaseCost) || 0);
  const salvageValue = Math.min(purchaseCost, Math.max(0, Number(input.salvageValue) || 0));
  const usefulLifeYears = Math.max(1, Math.round(Number(input.usefulLifeYears) || 3));
  const model = input.depreciationModel || 'STRAIGHT_LINE';

  const purchaseTime = new Date(input.purchaseDate).getTime();
  const asOfTime = input.asOfDate ? new Date(input.asOfDate).getTime() : Date.now();
  const ageYears = Math.max(0, (asOfTime - purchaseTime) / (365.25 * 86400 * 1000));

  if (purchaseCost === 0 || input.isDisposed) {
    return {
      purchaseCost,
      salvageValue,
      usefulLifeYears,
      depreciationModel: model,
      ageYears: Math.round(ageYears * 100) / 100,
      annualDepreciation: 0,
      accumulatedDepreciation: purchaseCost - salvageValue,
      currentBookValue: salvageValue,
      depreciatedPercentage: 100,
      isFullyDepreciated: true,
    };
  }

  const effectiveAge = Math.min(ageYears, usefulLifeYears);
  const depreciableBase = Math.max(0, purchaseCost - salvageValue);

  let currentBookValue: number;
  let annualDepreciation: number;

  if (model === 'DOUBLE_DECLINING') {
    const rate = Math.min(1.0, 2.0 / usefulLifeYears);
    const bookBeforeSalvage = purchaseCost * Math.pow(1 - rate, effectiveAge);
    currentBookValue = Math.max(salvageValue, bookBeforeSalvage);
    annualDepreciation = currentBookValue * rate;
  } else {
    // STRAIGHT_LINE
    annualDepreciation = depreciableBase / usefulLifeYears;
    const accumulated = annualDepreciation * effectiveAge;
    currentBookValue = Math.max(salvageValue, purchaseCost - accumulated);
  }

  const accumulatedDepreciation = Math.max(0, purchaseCost - currentBookValue);
  const isFullyDepreciated = currentBookValue <= salvageValue || effectiveAge >= usefulLifeYears;
  const depreciatedPercentage =
    depreciableBase > 0
      ? Math.min(100, Math.round((accumulatedDepreciation / depreciableBase) * 1000) / 10)
      : 100;

  return {
    purchaseCost,
    salvageValue,
    usefulLifeYears,
    depreciationModel: model,
    ageYears: Math.round(ageYears * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
    currentBookValue: Math.round(currentBookValue * 100) / 100,
    depreciatedPercentage,
    isFullyDepreciated,
  };
};

export interface FinancialOverview {
  total_purchase_cost: number;
  total_current_book_value: number;
  total_depreciation: number;
  depreciation_pct: number;
  asset_count: number;
}

export interface AssetFinancialDetail {
  id: string;
  asset_tag: string;
  name: string;
  purchase_cost: number | null;
  salvage_value: number | null;
  useful_life_years: number | null;
  depreciation_model: string | null;
  age_years: number | null;
  annual_depreciation: number | null;
  current_book_value: number | null;
  status: string;
}

// ── Get summary financial overview ──────────────────────────
export const getFinancialOverview = async (): Promise<FinancialOverview> => {
  const { rows } = await query<{
    total_purchase_cost: string;
    total_current_book_value: string;
    asset_count: string;
  }>(`
    SELECT
      COALESCE(SUM(purchase_cost), 0)::text       AS total_purchase_cost,
      COALESCE(SUM(current_book_value), 0)::text  AS total_current_book_value,
      COUNT(*)::text                               AS asset_count
    FROM asset_financials
    WHERE status != 'disposed'
  `);

  const totalCost  = parseFloat(rows[0]?.total_purchase_cost  ?? '0');
  const totalBook  = parseFloat(rows[0]?.total_current_book_value ?? '0');
  const count      = parseInt(rows[0]?.asset_count ?? '0', 10);
  const depr       = Math.max(0, totalCost - totalBook);
  const deprPct    = totalCost > 0 ? (depr / totalCost) * 100 : 0;

  return {
    total_purchase_cost: Math.round(totalCost * 100) / 100,
    total_current_book_value: Math.round(totalBook * 100) / 100,
    total_depreciation: Math.round(depr * 100) / 100,
    depreciation_pct: Math.round(deprPct * 10) / 10,
    asset_count: count,
  };
};

// ── Get per-asset financial details ─────────────────────────
export const getAssetFinancials = async (): Promise<AssetFinancialDetail[]> => {
  const { rows } = await query<AssetFinancialRow>(`
    SELECT * FROM asset_financials
    ORDER BY current_book_value DESC NULLS LAST
    LIMIT 100
  `);

  return rows.map((r) => ({
    id:                  r.id,
    asset_tag:           r.asset_tag,
    name:                r.name,
    purchase_cost:       r.purchase_cost ? parseFloat(r.purchase_cost) : null,
    salvage_value:       r.salvage_value ? parseFloat(r.salvage_value) : null,
    useful_life_years:   r.useful_life_years ?? null,
    depreciation_model:  r.depreciation_mdl ?? null,
    age_years:           r.age_years ? parseFloat(r.age_years) : null,
    annual_depreciation: r.annual_depreciation ? parseFloat(r.annual_depreciation) : null,
    current_book_value:  r.current_book_value ? parseFloat(r.current_book_value) : null,
    status:              r.status,
  }));
};
