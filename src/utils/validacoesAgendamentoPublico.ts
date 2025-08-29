// src/utils/validacoesAgendamentoPublico.ts
import { dateUtils } from './dateUtils';

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

export interface DadosAgendamento {
  nomeCliente: string;
  telefoneCliente: string;
  data?: string;
  horario?: string;
}

export function validarDadosAgendamento(dados: DadosAgendamento): ErroValidacao[] {
  const erros: ErroValidacao[] = [];

  // Validar nome
  if (!dados.nomeCliente || dados.nomeCliente.trim().length < 3) {
    erros.push({
      campo: 'nomeCliente',
      mensagem: 'Nome deve ter pelo menos 3 caracteres'
    });
  }

  // Validar telefone
  if (!dados.telefoneCliente) {
    erros.push({
      campo: 'telefoneCliente',
      mensagem: 'Telefone é obrigatório'
    });
  } else {
    const telefoneRegex = /^\+55\s\d{2}\s\d{5}-\d{4}$/;
    if (!telefoneRegex.test(dados.telefoneCliente)) {
      erros.push({
        campo: 'telefoneCliente',
        mensagem: 'Formato de telefone inválido. Use: +55 31 99999-8888'
      });
    }
  }

  // Validar horário se fornecido
  if (dados.horario) {
    const horarioRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(dados.horario)) {
      erros.push({
        campo: 'horario',
        mensagem: 'Formato de horário inválido'
      });
    }

    // Se data é hoje, validar se horário não é no passado
    if (dados.data) {
      const hoje = dateUtils.toDateString(new Date());
      if (dados.data === hoje) {
        const [hora, minuto] = dados.horario.split(':').map(Number);
        const agora = new Date();
        const horarioAgendamento = new Date();
        horarioAgendamento.setHours(hora, minuto, 0, 0);
        
        if (horarioAgendamento <= agora) {
          erros.push({
            campo: 'horario',
            mensagem: 'Não é possível agendar para horários que já passaram'
          });
        }
      }
    }
  }

  return erros;
}

export function formatarErrosValidacao(erros: ErroValidacao[]): string {
  if (erros.length === 0) return '';
  if (erros.length === 1) return erros[0].mensagem;
  
  return `Corrija os seguintes erros:\n${erros.map(e => `• ${e.mensagem}`).join('\n')}`;
}

// Função para verificar se horário ainda está disponível
export async function verificarDisponibilidadeHorario(
  empresaId: number,
  servicoId: number,
  profissionalId: number,
  data: string,
  horario: string
): Promise<boolean> {
  try {
    // Simular verificação - na implementação real, chamaria a API
    // para verificar se o horário ainda está disponível
    const response = await fetch(
      `/api/agendamentos/verificar-disponibilidade?empresaId=${empresaId}&servicoId=${servicoId}&profissionalId=${profissionalId}&data=${data}&horario=${horario}`
    );
    
    if (response.ok) {
      const resultado = await response.json();
      return resultado.disponivel;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}

// Utilitários para formatação
export const formatUtils = {
  aplicarMascaraTelefone: (value: string): string => {
    const cleaned = value.replace(/[^\d\s+]/g, '');
    
    let masked = cleaned;
    if (!masked.startsWith('+')) {
      masked = '+55 ' + masked.replace(/\+/g, '');
    }
    
    masked = masked
      .replace(/^(\+\d{2})\s*(\d)/, '$1 $2')
      .replace(/^(\+\d{2}\s\d{2})\s*(\d)/, '$1 $2')
      .replace(/^(\+\d{2}\s\d{2}\s\d{5})(\d)/, '$1-$2');
    
    return masked.substring(0, 17);
  },

  // CORRIGIDO: Usar função sem timezone
  formatarDataExibicao: (data: string): string => {
    return dateUtils.formatDateForDisplay(data);
  },

  formatarPreco: (preco: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  },

  criarDataHoraISO: (data: string, horario: string): string => {
    return `${data}T${horario}:00Z`;
  }
};