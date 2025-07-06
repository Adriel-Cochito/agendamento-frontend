import { apiClient } from './client';
import { Servico, CreateServicoRequest, UpdateServicoRequest } from '@/types/servico';

export const servicosApi = {
  getAll: async (empresaId?: number): Promise<Servico[]> => {
    const params = empresaId ? { empresaId } : {};
    const response = await apiClient.get('/servicos', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Servico> => {
    const response = await apiClient.get(`/servicos/${id}`);
    return response.data;
  },

  create: async (data: CreateServicoRequest): Promise<Servico> => {
    const response = await apiClient.post('/servicos', data, {
      params: { empresaId: data.empresaId }
    });
    return response.data;
  },

  update: async (id: number, data: UpdateServicoRequest): Promise<Servico> => {
    // Remover campos undefined/null
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    const response = await apiClient.put(`/servicos/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/servicos/${id}`);
  },
};