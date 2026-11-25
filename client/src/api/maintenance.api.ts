import api from './client';
import type { ApiResponse, MaintenanceRecord } from '../types';

export const maintenanceApi = {
  list:   (assetId?: string) => api.get<ApiResponse<{ records: MaintenanceRecord[] }>>('/maintenance', { params: assetId ? { asset_id: assetId } : {} }),
  get:    (id: string) => api.get<ApiResponse<{ record: MaintenanceRecord }>>(`/maintenance/${id}`),
  create: (data: Partial<MaintenanceRecord>) => api.post<ApiResponse<{ record: MaintenanceRecord }>>('/maintenance', data),
  update: (id: string, data: Partial<MaintenanceRecord>) => api.patch<ApiResponse<{ record: MaintenanceRecord }>>(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
};

