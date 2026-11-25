import api from './client';
import type { ApiResponse, AssetRequest, RequestPriority, RequestStatus } from '../types';

export const requestsApi = {
  list: (params?: { status?: string; user_id?: string }) =>
    api.get<ApiResponse<{ requests: AssetRequest[] }>>('/requests', { params }),
  get: (id: string) =>
    api.get<ApiResponse<{ request: AssetRequest }>>(`/requests/${id}`),
  create: (data: { category_id?: string; asset_type: string; priority: RequestPriority; reason: string }) =>
    api.post<ApiResponse<{ request: AssetRequest }>>('/requests', data),
  updateStatus: (id: string, data: { status: RequestStatus; admin_notes?: string; asset_id?: string }) =>
    api.patch<ApiResponse<{ request: AssetRequest }>>(`/requests/${id}/status`, data),
};

