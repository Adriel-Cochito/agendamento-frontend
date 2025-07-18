import { Agendamento } from '@/types/agendamento';

// Interface para o response da API (como vem do backend)
interface AgendamentoApiResponse {
  id: number;
  nomeCliente: string;
  telefoneCliente: string;
  empresa: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cnpj: string;
    ativo: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
  profissional: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
    empresaId: number;
    ativo: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
  servico: {
    id: number;
    titulo: string;
    descricao: string;
    preco: number;
    duracao: number;
    empresaId: number;
    profissionais: any[];
    ativo: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
  dataHora: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

// Mapper para converter response da API para o tipo Agendamento do frontend
export function mapAgendamentoFromApi(apiResponse: AgendamentoApiResponse): Agendamento {
  return {
    id: apiResponse.id,
    nomeCliente: apiResponse.nomeCliente,
    telefoneCliente: apiResponse.telefoneCliente,
    dataHora: apiResponse.dataHora, // Manter como vem da API (com ou sem Z)
    status: apiResponse.status as any,
    
    // IDs extraídos dos objetos
    profissionalId: apiResponse.profissional.id,
    servicoId: apiResponse.servico.id,
    
    // Campos que o frontend espera
    profissionalNome: apiResponse.profissional.nome,
    servicoTitulo: apiResponse.servico.titulo,
    
    // Objetos completos (compatibilidade)
    profissional: {
      id: apiResponse.profissional.id,
      nome: apiResponse.profissional.nome
    },
    servico: {
      id: apiResponse.servico.id,
      titulo: apiResponse.servico.titulo
    },
    empresa: {
      id: apiResponse.empresa.id,
      nome: apiResponse.empresa.nome
    }
  };
}

// Mapper para array de agendamentos
export function mapAgendamentosFromApi(apiResponse: AgendamentoApiResponse[]): Agendamento[] {
  return apiResponse.map(mapAgendamentoFromApi);
}