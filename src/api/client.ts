import axios from 'axios';
import { authStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Não redirecionar se for uma rota de criação de profissional
    const isSignupRoute = error.config?.url?.includes('/profissionais') && error.config?.method === 'post';
    
    if (error.response?.status === 401 && !isSignupRoute) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);