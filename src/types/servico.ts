import { Profissional } from './profissional';

export interface Servico {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  duracao: number;
  empresaId: number;
  profissionais?: Profissional[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServicoRequest {
  titulo: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  duracao: number;
  empresaId: number;
  profissionais: { id: number }[];
}

export interface UpdateServicoRequest {
  titulo?: string;
  descricao?: string;
  preco?: number;
  ativo?: boolean;
  empresaId?: number;
  duracao?: number;
  profissionais?: { id: number }[];
}