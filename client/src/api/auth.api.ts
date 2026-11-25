import api from './client';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  login:    (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),
  register: (data: { full_name: string; email: string; password: string; role_id?: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
  logout:   () => api.post('/auth/logout'),
  me:       () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

