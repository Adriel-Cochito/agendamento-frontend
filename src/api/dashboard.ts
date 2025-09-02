// src/api/dashboard.ts
import { apiClient } from './client';

// Tipos do Dashboard
export interface AgendamentosHojeData {
  total: number;
  porStatus: Record<string, number>;
}

export interface MetricasPrincipaisData {
  agendamentosHoje: AgendamentosHojeData;
  proximosSeteDias: number;
  taxaOcupacaoHoje: number;
}

export interface IndicadoresGestaoData {
  profissionaisAtivos: number;
  servicosOferecidos: number;
}

export interface AgendamentoPorDiaData {
  data: string;
  quantidade: number;
}

export interface ServicoRankingData {
  servicoId: number;
  servicoTitulo: string;
  quantidade: number;
}

export interface ProfissionalRankingData {
  profissionalId: number;
  profissionalNome: string;
  quantidade: number;
}

export interface GraficosData {
  agendamentosPorDia: AgendamentoPorDiaData[];
  servicosMaisProcurados: ServicoRankingData[];
  profissionaisMaisOcupados: ProfissionalRankingData[];
  statusAgendamentos: Record<string, number>;
}

export interface ProfissionalSemAgendaData {
  profissionalId: number;
  profissionalNome: string;
}

export interface AlertasData {
  agendamentosParaConfirmar: number;
  conflitosHorario: number;
  profissionaisSemAgenda: ProfissionalSemAgendaData[];
}

export interface DashboardData {
  metricas: MetricasPrincipaisData;
  indicadores: IndicadoresGestaoData;
  graficos: GraficosData;
  alertas: AlertasData;
}

// API do Dashboard
export const dashboardApi = {
  // Endpoint principal - busca todas as métricas
  getResumo: async (empresaId: number): Promise<DashboardData> => {
    const response = await apiClient.get(`/dash?empresaId=${empresaId}`);
    return response.data;
  },

  // Endpoints específicos (opcionais)
  getMetricas: async (empresaId: number): Promise<MetricasPrincipaisData> => {
    const response = await apiClient.get(`/dash/metricas?empresaId=${empresaId}`);
    return response.data;
  },

  getIndicadores: async (empresaId: number): Promise<IndicadoresGestaoData> => {
    const response = await apiClient.get(`/dash/indicadores?empresaId=${empresaId}`);
    return response.data;
  },

  getGraficos: async (empresaId: number): Promise<GraficosData> => {
    const response = await apiClient.get(`/dash/graficos?empresaId=${empresaId}`);
    return response.data;
  },

  getAlertas: async (empresaId: number): Promise<AlertasData> => {
    const response = await apiClient.get(`/dash/alertas?empresaId=${empresaId}`);
    return response.data;
  },
};