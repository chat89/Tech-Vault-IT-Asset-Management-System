import api from './client';
import type { ApiResponse, AuditLogsResponse } from '../types';

export const auditApi = {
  list: (params?: { action?: string; user_id?: string; entity_type?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<AuditLogsResponse>>('/audit-logs', { params }),
};

