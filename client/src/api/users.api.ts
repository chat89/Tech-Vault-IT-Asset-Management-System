import api from './client';
import type { ApiResponse, User, Role } from '../types';

export const usersApi = {
  list:       () => api.get<ApiResponse<{ users: User[] }>>('/users'),
  roles:      () => api.get<ApiResponse<{ roles: Role[] }>>('/users/roles'),
  get:        (id: string) => api.get<ApiResponse<{ user: User }>>(`/users/${id}`),
  create:     (data: { full_name: string; email: string; password: string; role_id: string }) =>
    api.post<ApiResponse<{ user: User }>>('/users', data),
  update:     (id: string, data: Partial<User & { password?: string }>) =>
    api.patch<ApiResponse<{ user: User }>>(`/users/${id}`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
};

