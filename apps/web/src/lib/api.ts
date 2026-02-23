import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

function extractErrorMessage(input: unknown): string {
  if (!input) return "Noma'lum xato";

  if (typeof input === 'string') return input;

  if (Array.isArray(input)) {
    const arr = input
      .map((item) => extractErrorMessage(item))
      .filter(Boolean);
    return arr.join('\n');
  }

  if (typeof input === 'object') {
    const obj = input as Record<string, any>;

    // Nest ValidationError format: { property, children, constraints }
    if (obj.constraints && typeof obj.constraints === 'object') {
      const values = Object.values(obj.constraints).filter((v) => typeof v === 'string');
      if (values.length) return values.join(', ');
    }

    if (obj.message) return extractErrorMessage(obj.message);
    if (obj.error) return extractErrorMessage(obj.error);

    // fallback
    try {
      return JSON.stringify(obj);
    } catch {
      return "Noma'lum xato";
    }
  }

  return String(input);
}

export function getApiErrorMessage(error: unknown, fallback = "So'rov bajarilmadi"): string {
  const axiosErr = error as AxiosError<any>;
  const data = axiosErr?.response?.data;
  const msg = extractErrorMessage(data?.message || data?.error || axiosErr?.message);
  return msg || fallback;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // refresh/logout cookie ishlashi uchun muhim
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const msg = getApiErrorMessage(error);

    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (!path.includes('/login')) {
        window.location.href = path.startsWith('/guardian') ? '/guardian/login' : '/staff/login';
      }
    } else if (status === 403) {
      toast.error("Ruxsat yo'q", { description: msg });
    } else if (status === 404) {
      toast.error("Topilmadi", { description: msg || "So'ralgan ma'lumot topilmadi" });
    } else if (status && status >= 500) {
      toast.error("Server xatosi", { description: "Iltimos, keyinroq qayta urinib ko'ring" });
    } else if (!error.response) {
      toast.error("Tarmoq xatosi", { description: "Server bilan aloqa o'rnatib bo'lmadi" });
    }

    return Promise.reject(error);
  }
);

export default api;