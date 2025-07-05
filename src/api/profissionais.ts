import { apiClient } from './client';
import { Profissional, CreateProfissionalRequest, UpdateProfissionalRequest } from '@/types/profissional';

export const profissionaisApi = {
  getAll: async (empresaId?: number): Promise<Profissional[]> => {
    const params = empresaId ? { empresaId } : {};
    const response = await apiClient.get('/profissionais', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Profissional> => {
    const response = await apiClient.get(`/profissionais/${id}`);
    return response.data;
  },

  create: async (data: CreateProfissionalRequest): Promise<Profissional> => {
    const response = await apiClient.post('/profissionais', data, {
      params: { empresaId: data.empresaId }
    });
    return response.data;
  },

  update: async (id: number, data: UpdateProfissionalRequest): Promise<Profissional> => {
    const response = await apiClient.put(`/profissionais/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/profissionais/${id}`);
  },
};