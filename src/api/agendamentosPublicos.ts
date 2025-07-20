// src/api/agendamentosPublicos.ts - Atualizado com dados da empresa
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Cliente público sem autenticação
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs (sem token)
publicApiClient.interceptors.request.use(
  (config) => {
    console.log('Public Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

publicApiClient.interceptors.response.use(
  (response) => {
    console.log('Public Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Public API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export interface EmpresaPublica {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj?: string;
  ativo: boolean;
}

export interface ServicoPublico {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  duracao: number;
  empresaId: number;
  profissionais: Array<{
    id: number;
    nome: string;
    email: string;
    perfil: string;
    empresaId: number;
    ativo: boolean;
  }>;
  ativo: boolean;
}

export interface DisponibilidadePublica {
  id: number;
  tipo: 'GRADE' | 'LIBERADO' | 'BLOQUEIO';
  dataHoraInicio: string | null;
  dataHoraFim: string | null;
  diasSemana: number[];
  horaInicio: string | null;
  horaFim: string | null;
  profissional: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    empresaId: number;
    ativo: boolean;
  };
  empresa: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cnpj: string;
    ativo: boolean;
  };
  observacao: string;
  pontoValido: boolean;
  gradeValida: boolean;
}

export interface AgendaPublica {
  dataHora: string;
  duracao: number;
}

export interface CreateAgendamentoPublico {
  nomeCliente: string;
  telefoneCliente: string;
  dataHora: string;
  status: 'AGENDADO';
  empresa: { id: number };
  servico: { id: number };
  profissional: { id: number };
}

export const agendamentosPublicosApi = {
  // Buscar dados da empresa
  getEmpresa: async (empresaId: number): Promise<EmpresaPublica> => {
    const response = await publicApiClient.get(`/agendamentos/empresa/${empresaId}`);
    return response.data;
  },

  // Buscar serviços disponíveis para a empresa
  getServicos: async (empresaId: number): Promise<ServicoPublico[]> => {
    const response = await publicApiClient.get(`/agendamentos/servicos?empresaId=${empresaId}`);
    return response.data;
  },

  // Buscar disponibilidades de um profissional em uma data
  getDisponibilidades: async (
    empresaId: number, 
    profissionalId: number, 
    data: string
  ): Promise<DisponibilidadePublica[]> => {
    const response = await publicApiClient.get(
      `/agendamentos/disponibilidade/profissional/data?empresaId=${empresaId}&profissionalId=${profissionalId}&data=${data}`
    );
    return response.data;
  },

  // Buscar horários disponíveis
  getAgenda: async (
    empresaId: number,
    servicoId: number,
    profissionalId: number,
    data: string
  ): Promise<AgendaPublica[]> => {
    const response = await publicApiClient.get(
      `/agendamentos/agenda?empresaId=${empresaId}&servicoId=${servicoId}&profissionalId=${profissionalId}&data=${data}`
    );
    return response.data;
  },

  // Criar agendamento público (sem autenticação)
  createAgendamento: async (
    empresaId: number,
    data: CreateAgendamentoPublico
  ): Promise<any> => {
    const response = await publicApiClient.post(`/agendamentos?empresaId=${empresaId}`, data);
    return response.data;
  },
};