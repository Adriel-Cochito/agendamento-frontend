import { apiClient } from './client';
import { CreateProfissionalRequest, Profissional } from '@/types/profissional';

export const profissionaisApi = {
  create: async (data: CreateProfissionalRequest): Promise<Profissional> => {
    const response = await apiClient.post('/profissionais', data, {
      params: { empresaId: data.empresaId }
    });
    return response.data;
  },

  getAll: async (empresaId: number): Promise<Profissional[]> => {
    const response = await apiClient.get('/profissionais', {
      params: { empresaId }
    });
    return response.data;
  },

  getById: async (id: number): Promise<Profissional> => {
    const response = await apiClient.get(`/profissionais/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<Profissional>): Promise<Profissional> => {
    const response = await apiClient.put(`/profissionais/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/profissionais/${id}`);
  },
};