/**
 * api/financial.api.ts
 * Financial Lifecycle & Depreciation endpoints
 */
import apiClient from './client';

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

export const financialApi = {
  overview: () =>
    apiClient.get<{ success: boolean; data: { overview: FinancialOverview } }>('/financial/overview'),
  assets: () =>
    apiClient.get<{ success: boolean; data: { assets: AssetFinancialDetail[] } }>('/financial/assets'),
};

