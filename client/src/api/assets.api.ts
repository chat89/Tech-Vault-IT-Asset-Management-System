import api from './client';
import type { ApiResponse, Asset, AssetsResponse } from '../types';

export const assetsApi = {
  list: (params?: { status?: string; category_id?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<AssetsResponse>>('/assets', { params }),
  get:    (id: string) => api.get<ApiResponse<{ asset: Asset }>>(`/assets/${id}`),
  create: (data: Partial<Asset>) => api.post<ApiResponse<{ asset: Asset }>>('/assets', data),
  update: (id: string, data: Partial<Asset>) => api.patch<ApiResponse<{ asset: Asset }>>(`/assets/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<ApiResponse<{ asset: Asset }>>(`/assets/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

