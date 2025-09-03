import axios from 'axios';
import { authStore } from '@/store/authStore';
import { handleApiError } from '@/lib/error-handler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('API Base URL:', API_BASE_URL); // Ajuda a verificar no console se a variável está carregando

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor para adicionar token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    const publicRoutes = ['/auth/login', '/auth/register', '/empresas/com-owner'];
    const isPublicRoute = publicRoutes.some(route =>
      error.config?.url?.includes(route)
    );

    const status = error.response?.status;
    const code = error.response?.data?.errors?.[0]?.code;

    if (
      status === 401 &&
      !isPublicRoute &&
      error.config?.url &&
      !error.config.url.includes('/auth/refresh')
    ) {
      console.warn('Token expirado ou inválido. Redirecionando para login...');
      authStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
