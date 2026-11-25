import api from './client';
import type { ApiResponse, Assignment } from '../types';

export const assignmentsApi = {
  list:          (active?: boolean) => api.get<ApiResponse<{ assignments: Assignment[] }>>('/assignments', { params: active ? { active: 'true' } : {} }),
  assetHistory:  (assetId: string)  => api.get<ApiResponse<{ history: Assignment[] }>>(`/assignments/asset/${assetId}`),
  userHistory:   (userId: string)   => api.get<ApiResponse<{ assignments: Assignment[] }>>(`/assignments/user/${userId}`),
  assign:        (data: { asset_id: string; assigned_to: string; condition_out?: string; notes?: string }) =>
    api.post<ApiResponse<{ assignment: Assignment }>>('/assignments', data),
  return:        (id: string, data: { condition_in?: string; return_notes?: string }) =>
    api.patch<ApiResponse<unknown>>(`/assignments/${id}/return`, data),
};

