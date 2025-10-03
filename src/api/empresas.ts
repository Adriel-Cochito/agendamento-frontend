// src/api/empresas.ts (atualizada)
import { apiClient } from './client';
import { CreateEmpresaWithOwnerRequest } from '@/types/empresa';

export interface EmpresaResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  nomeUnico: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// Interface para update da empresa
export interface UpdateEmpresaRequest {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  nomeUnico: string;
  ativo: boolean;
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

  // ATUALIZADO: Função para atualizar empresa
  update: async (id: number, data: UpdateEmpresaRequest): Promise<EmpresaResponse> => {
    // Formatação para o backend conforme CURL
    const payload = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone, // enviado como string limpa (sem máscara)
      cnpj: data.cnpj, // enviado como string limpa (sem máscara)
      nomeUnico: data.nomeUnico,
      ativo: data.ativo
    };
    
    console.log('Enviando payload para API:', payload);
    
    const response = await apiClient.put(`/empresas/${id}`, payload);
    return response.data;
  },

  // Verificar se nome único está disponível
  verificarNomeUnicoDisponivel: async (nomeUnico: string): Promise<{ disponivel: boolean }> => {
    const response = await apiClient.get(`/empresas/verificar-nome-unico/${nomeUnico}`);
    return response.data;
  },

  // Buscar empresa por nome único
  getByNomeUnico: async (nomeUnico: string): Promise<EmpresaResponse> => {
    const response = await apiClient.get(`/empresas/nome-unico/${nomeUnico}`);
    return response.data;
  },
};