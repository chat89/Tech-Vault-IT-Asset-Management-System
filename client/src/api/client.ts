import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor — attach JWT ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tv_token');
      localStorage.removeItem('tv_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

