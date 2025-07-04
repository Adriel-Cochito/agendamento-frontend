import { apiClient } from './client';
import { LoginCredentials, AuthResponse } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      senha: credentials.password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Se houver endpoint de logout
    // await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};