import { apiClient } from './client';
import { 
  Disponibilidade, 
  CreateDisponibilidadeRequest, 
  UpdateDisponibilidadeRequest,
  DisponibilidadeFilters 
} from '@/types/disponibilidade';

export const disponibilidadesApi = {
  getAll: async (filters?: DisponibilidadeFilters): Promise<Disponibilidade[]> => {
    const params = new URLSearchParams();
    
    if (filters?.empresaId) {
      params.append('empresaId', filters.empresaId.toString());
    }
    if (filters?.profissionalId) {
      params.append('profissionalId', filters.profissionalId.toString());
    }
    if (filters?.tipo) {
      params.append('tipo', filters.tipo);
    }
    if (filters?.data) {
      params.append('data', filters.data);
    }

    const response = await apiClient.get(`/disponibilidades?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Disponibilidade> => {
    const response = await apiClient.get(`/disponibilidades/${id}`);
    return response.data;
  },

  getByProfissional: async (empresaId: number, profissionalId: number): Promise<Disponibilidade[]> => {
    const response = await apiClient.get('/disponibilidades/profissional/data', {
      params: { empresaId, profissionalId }
    });
    return response.data;
  },

  create: async (data: CreateDisponibilidadeRequest): Promise<Disponibilidade> => {
    const response = await apiClient.post('/disponibilidades', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDisponibilidadeRequest): Promise<Disponibilidade> => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    const response = await apiClient.put(`/disponibilidades/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/disponibilidades/${id}`);
  },
};