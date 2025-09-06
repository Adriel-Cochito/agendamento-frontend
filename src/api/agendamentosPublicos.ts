// src/api/agendamentosPublicos.ts - Corrigido para usar rotas exatas do backend
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agendasim.onrender.com';
const isDev = import.meta.env.DEV;

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

// Interfaces necessárias
export interface EmpresaPublica {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj?: string;
  endereco?: string;
  logo?: string;
  ativo: boolean;
}

export interface ServicoPublico {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  duracao: number;
  empresaId: number;
  ativo: boolean;
  profissionais?: Array<{
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
    empresaId: number;
  }>;
}

export interface AgendaPublica {
  data: string;
  horarios: Array<{
    hora: string;
    disponivel: boolean;
    profissionais: Array<{
      id: number;
      nome: string;
    }>;
  }>;
}

// API pública para agendamentos - usando rotas exatas do AgendamentoController
export const agendamentosPublicosApi = {
  // Buscar empresa pelo ID
  getEmpresa: async (empresaId: number): Promise<EmpresaPublica> => {
    const response = await publicApiClient.get(`/empresas/${empresaId}`);
    return response.data;
  },

  // Buscar serviços - EXATO: /agendamentos/servicos?empresaId=1
  getServicos: async (empresaId: number): Promise<ServicoPublico[]> => {
    const response = await publicApiClient.get(`/agendamentos/servicos?empresaId=${empresaId}`);
    return response.data;
  },

  // Buscar disponibilidade por serviço e data
  getDisponibilidade: async (
    empresaId: number, 
    servicoId: number, 
    data: string, 
    profissionais?: number[]
  ): Promise<AgendaPublica> => {
    // Se não tem profissionais especificados, buscar do serviço primeiro
    if (!profissionais || profissionais.length === 0) {
      const servicos = await agendamentosPublicosApi.getServicos(empresaId);
      const servico = servicos.find(s => s.id === servicoId);
      if (!servico?.profissionais?.length) {
        return { data, horarios: [] };
      }
      profissionais = servico.profissionais.map(p => p.id);
    }

    // Usar o primeiro profissional para buscar agenda
    const agenda = await agendamentosPublicosApi.getAgenda(
      empresaId,
      servicoId,
      profissionais[0],
      data
    );

    // Converter formato para compatibilidade
    const horarios = agenda.map((item: any) => ({
      hora: item.horario,
      disponivel: item.disponivel,
      profissionais: [{
        id: item.profissional.id,
        nome: item.profissional.nome
      }]
    }));

    return { data, horarios };
  },

  // Buscar agenda - EXATO: /agendamentos/agenda?empresaId=1&servicoId=1&profissionalId=1&data=2025-06-23
  getAgenda: async (
    empresaId: number, 
    servicoId: number, 
    profissionalId: number, 
    data: string
  ) => {
    const response = await publicApiClient.get(
      `/agendamentos/agenda?empresaId=${empresaId}&servicoId=${servicoId}&profissionalId=${profissionalId}&data=${data}`
    );
    return response.data;
  },

  // Criar agendamento - EXATO: /agendamentos?empresaId=1 (mas SEM Authorization)
  createAgendamento: async (empresaId: number, data: any) => {
    const response = await publicApiClient.post(
      `/agendamentos?empresaId=${empresaId}`, 
      data
    );
    return response.data;
  },

  // Verificar se um agendamento existe
  verificarAgendamento: async (token: string) => {
    const response = await publicApiClient.get(
      `/agendamentos/publico/verificar/${token}`
    );
    return response.data;
  },

  // Cancelar um agendamento pelo token
  cancelarAgendamento: async (token: string) => {
    const response = await publicApiClient.post(
      `/agendamentos/publico/cancelar/${token}`
    );
    return response.data;
  }
};