import { Profissional } from './profissional';
import { Empresa } from './empresa';

export type TipoDisponibilidade = 'GRADE' | 'LIBERADO' | 'BLOQUEIO';

export interface Disponibilidade {
  id: number;
  tipo: TipoDisponibilidade;
  dataHoraInicio: string | null;
  dataHoraFim: string | null;
  diasSemana: number[];
  horaInicio: string | null;
  horaFim: string | null;
  profissional: Profissional;
  empresa: Empresa;
  observacao: string;
  createdAt: string;
  updatedAt: string | null;
  pontoValido: boolean;
  gradeValida: boolean;
}

export interface CreateDisponibilidadeRequest {
  tipo: TipoDisponibilidade;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  diasSemana?: number[];
  horaInicio?: string;
  horaFim?: string;
  profissional: { id: number };
  empresa: { id: number };
  observacao: string;
}

export interface UpdateDisponibilidadeRequest {
  tipo?: TipoDisponibilidade;
  dataHoraInicio?: string | null;
  dataHoraFim?: string | null;
  diasSemana?: number[];
  horaInicio?: string | null;
  horaFim?: string | null;
  profissional?: { id: number };
  observacao?: string;
}

export interface DisponibilidadeFilters {
  empresaId?: number;
  profissionalId?: number;
  tipo?: TipoDisponibilidade;
  data?: string;
}