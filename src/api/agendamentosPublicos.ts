// src/api/agendamentosPublicos.ts - Corrigido para reduzir logs
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const isDev = import.meta.env.DEV; // Usar import.meta.env ao invés de process.env

// Cliente público sem autenticação
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para garantir que NUNCA seja enviado token para APIs públicas
publicApiClient.interceptors.request.use(
  (config) => {
    // IMPORTANTE: Remover qualquer header Authorization que possa existir
    delete config.headers.Authorization;
    
    // Log apenas em desenvolvimento
    if (isDev) {
      console.log('Public Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

publicApiClient.interceptors.response.use(
  (response) => {
    // Log apenas em desenvolvimento
    if (isDev) {
      console.log('Public Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    // Log de erro sempre importante
    console.error('Public API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);