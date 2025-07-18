import { Servico } from './servico';
import { Profissional } from './profissional';
import { Empresa } from './empresa';

// Status corrigidos para coincidir com o backend
export type StatusAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO';

export interface Agendamento {
  id: number;
  nomeCliente: string;
  telefoneCliente: string;
  dataHora: string;
  status: StatusAgendamento;
  profissionalId?: number; // Opcional pois pode vir como objeto
  profissionalNome: string;
  servicoId?: number; // Opcional pois pode vir como objeto
  servicoTitulo: string;
  // Campos que podem vir da API
  profissional?: { id: number; nome: string };
  servico?: { id: number; titulo: string };
  empresa?: { id: number; nome: string };
}

export interface CreateAgendamentoRequest {
  nomeCliente: string;
  telefoneCliente: string;
  dataHora: string;
  status: StatusAgendamento;
  empresa: { id: number };
  servico: { id: number };
  profissional: { id: number };
}

export interface UpdateAgendamentoRequest {
  nomeCliente?: string;
  telefoneCliente?: string;
  dataHora?: string;
  status?: StatusAgendamento;
  servico?: { id: number };
  profissional?: { id: number };
}

export interface AgendamentoFilters {
  empresaId?: number;
  servicoId?: number;
  profissionalId?: number;
  data?: string;
  status?: StatusAgendamento;
}

export interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
  motivo?: string; // 'ocupado', 'bloqueado', 'fora_grade', etc.
}