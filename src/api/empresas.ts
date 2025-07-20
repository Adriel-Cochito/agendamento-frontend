// src/api/empresas.ts - Atualizado
import { apiClient } from './client';
import { CreateEmpresaWithOwnerRequest } from '@/types/empresa';

export interface EmpresaResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const empresasApi = {
  createWithOwner: async (data: CreateEmpresaWithOwnerRequest): Promise<any> => {
    const response = await apiClient.post('/empresas/com-owner', data);
    return response.data;
  },

  getById: async (id: number): Promise<EmpresaResponse> => {
    const response = await apiClient.get(`/empresas/${id}`);
    return response.data;
  },

  // Para uso futuro - listar empresas (caso seja necessário)
  getAll: async (): Promise<EmpresaResponse[]> => {
    const response = await apiClient.get('/empresas');
    return response.data;
  },

  // Para uso futuro - atualizar empresa
  update: async (id: number, data: Partial<CreateEmpresaWithOwnerRequest>): Promise<EmpresaResponse> => {
    const response = await apiClient.put(`/empresas/${id}`, data);
    return response.data;
  },
};