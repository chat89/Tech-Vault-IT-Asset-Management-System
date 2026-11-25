import api from './client';
import type { ApiResponse, DashboardStats } from '../types';

export const dashboardApi = {
  stats: () => api.get<ApiResponse<{ stats: DashboardStats }>>('/dashboard/stats'),
};

