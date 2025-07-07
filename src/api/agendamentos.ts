import { apiClient } from './client';
import { 
  Agendamento, 
  CreateAgendamentoRequest, 
  UpdateAgendamentoRequest,
  AgendamentoFilters 
} from '@/types/agendamento';

export const agendamentosApi = {
  getAll: async (filters?: AgendamentoFilters): Promise<Agendamento[]> => {
    const params = new URLSearchParams();
    
    if (filters?.empresaId) {
      params.append('empresaId', filters.empresaId.toString());
    }
    if (filters?.servicoId) {
      params.append('servicoId', filters.servicoId.toString());
    }
    if (filters?.profissionalId) {
      params.append('profissionalId', filters.profissionalId.toString());
    }
    if (filters?.data) {
      params.append('data', filters.data);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const response = await apiClient.get(`/agendas?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Agendamento> => {
    const response = await apiClient.get(`/agendas/${id}`);
    return response.data;
  },

  getByData: async (filters: {
    empresaId: number;
    servicoId: number;
    profissionalId: number;
    data: string;
  }): Promise<Agendamento[]> => {
    const response = await apiClient.get('/agendas/admin/data', {
      params: filters
    });
    return response.data;
  },

  create: async (data: CreateAgendamentoRequest, empresaId: number): Promise<Agendamento> => {
    const response = await apiClient.post('/agendas', data, {
      params: { empresaId }
    });
    return response.data;
  },

  update: async (id: number, data: UpdateAgendamentoRequest, empresaId: number): Promise<Agendamento> => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    const response = await apiClient.put(`/agendas/${id}`, cleanData, {
      params: { empresaId }
    });
    return response.data;
  },

  delete: async (id: number, empresaId: number): Promise<void> => {
    await apiClient.delete(`/agendas/${id}`, {
      params: { empresaId }
    });
  },
};