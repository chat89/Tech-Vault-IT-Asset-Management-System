/**
 * api/analytics.api.ts
 * Analytics and Smart Procurement Forecasting client
 */
import apiClient from './client';
import type { ForecastingOverview } from '../types';

export const analyticsApi = {
  getForecasting: () =>
    apiClient.get<{ success: boolean; data: { forecast: ForecastingOverview } }>('/analytics/forecasting'),
};

