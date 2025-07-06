import axios from 'axios';
import { authStore } from '@/store/authStore';
import { handleApiError } from '@/lib/error-handler';

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
    
    // Lista de rotas públicas
    const publicRoutes = ['/auth/login', '/auth/register', '/empresas/com-owner'];
    const isPublicRoute = publicRoutes.some(route => 
      error.config?.url?.includes(route)
    );
    
    // Só redireciona para login se for 401 e não for rota pública
    // E não for um erro de conflito (409) ou validação (400)
    if (
      error.response?.status === 401 && 
      !isPublicRoute &&
      error.config?.url !== '/auth/refresh'
    ) {
      console.log('Token expirado ou inválido, redirecionando para login...');
      authStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Para outros erros, usar o handler
    return Promise.reject(error);
  }
);