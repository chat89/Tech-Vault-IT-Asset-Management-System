import api from './client';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  list:   () => api.get<ApiResponse<{ categories: Category[] }>>('/categories'),
  get:    (id: string) => api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`),
  create: (data: { name: string; description?: string }) => api.post<ApiResponse<{ category: Category }>>('/categories', data),
  update: (id: string, data: { name?: string; description?: string }) => api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

