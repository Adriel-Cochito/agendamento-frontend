// src/api/agendamentosPublicos.ts - Corrigido para reduzir logs
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    if (process.env.NODE_ENV === 'development') {
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
    if (process.env.NODE_ENV === 'development') {
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

// Cache simples para evitar múltiplas chamadas desnecessárias
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCacheKey(method: string, url: string): string {
  return `${method}:${url}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export const agendamentosPublicosApi = {
  // Buscar dados da empresa com cache
  getEmpresa: async (empresaId: number): Promise<EmpresaPublica> => {
    const cacheKey = getCacheKey('GET', `/agendamentos/empresa/${empresaId}`);
    const cached = getFromCache<EmpresaPublica>(cacheKey);
    
    if (cached) {
      console.log('📋 Empresa carregada do cache');
      return cached;
    }

    const response = await publicApiClient.get(`/agendamentos/empresa/${empresaId}`);
    setCache(cacheKey, response.data);
    return response.data;
  },

  // Buscar serviços disponíveis para a empresa com cache
  getServicos: async (empresaId: number): Promise<ServicoPublico[]> => {
    const cacheKey = getCacheKey('GET', `/agendamentos/servicos?empresaId=${empresaId}`);
    const cached = getFromCache<ServicoPublico[]>(cacheKey);
    
    if (cached) {
      console.log('📋 Serviços carregados do cache');
      return cached;
    }

    const response = await publicApiClient.get(`/agendamentos/servicos?empresaId=${empresaId}`);
    setCache(cacheKey, response.data);
    return response.data;
  },

  // Buscar disponibilidades de um profissional em uma data
  getDisponibilidades: async (
    empresaId: number, 
    profissionalId: number, 
    data: string
  ): Promise<DisponibilidadePublica[]> => {
    // Não fazer cache de disponibilidades pois podem mudar frequentemente
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
    // Não fazer cache de agenda pois muda frequentemente
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
    
    // Limpar cache relacionado após criação
    const keysToDelete = Array.from(cache.keys()).filter(key => 
      key.includes('agenda') || key.includes('disponibilidade')
    );
    keysToDelete.forEach(key => cache.delete(key));
    
    return response.data;
  },

  // Função para limpar cache manualmente se necessário
  clearCache: () => {
    cache.clear();
    console.log('🗑️ Cache da API pública limpo');
  }
};