import { Disponibilidade } from '@/types/disponibilidade';
import { Agendamento } from '@/types/agendamento';
import { HorarioDisponivel } from '@/types/agendamento';
import { dateUtils } from './dateUtils';


export function calcularHorariosDisponiveis(
  disponibilidades: Disponibilidade[],
  agendamentos: Agendamento[],
  dataConsulta: string,
  duracaoServico: number // em minutos
): HorarioDisponivel[] {
  const horarios: HorarioDisponivel[] = [];
  const data = new Date(dataConsulta);
  const diaSemana = data.getDay();

  // Primeiro, coletamos todos os períodos disponíveis
  const periodosDisponiveis: Array<{ inicio: Date; fim: Date }> = [];
  const periodosBloqueados: Array<{ inicio: Date; fim: Date }> = [];

  disponibilidades.forEach(disp => {
    if (disp.tipo === 'GRADE') {
      // Verifica se o dia da semana está na grade
      if (disp.diasSemana.includes(diaSemana) && disp.horaInicio && disp.horaFim) {
        const inicio = new Date(`${dataConsulta}T${disp.horaInicio}`);
        const fim = new Date(`${dataConsulta}T${disp.horaFim}`);
        periodosDisponiveis.push({ inicio, fim });
      }
    } else if (disp.tipo === 'LIBERADO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = new Date(disp.dataHoraInicio);
      const fimDisp = new Date(disp.dataHoraFim);
      const dataConsultaDate = new Date(dataConsulta);
      
      // Verifica se é no mesmo dia
      if (inicioDisp.toDateString() === dataConsultaDate.toDateString()) {
        periodosDisponiveis.push({ inicio: inicioDisp, fim: fimDisp });
      }
    } else if (disp.tipo === 'BLOQUEIO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = new Date(disp.dataHoraInicio);
      const fimDisp = new Date(disp.dataHoraFim);
      const dataConsultaDate = new Date(dataConsulta);
      
      // Verifica se é no mesmo dia
      if (inicioDisp.toDateString() === dataConsultaDate.toDateString()) {
        periodosBloqueados.push({ inicio: inicioDisp, fim: fimDisp });
      }
    }
  });

  // Adiciona agendamentos existentes como períodos bloqueados
  agendamentos.forEach(agendamento => {
    const inicioAgendamento = new Date(agendamento.dataHora);
    // Assumindo que cada agendamento tem duração do serviço
    const fimAgendamento = new Date(inicioAgendamento.getTime() + duracaoServico * 60000);
    periodosBloqueados.push({ inicio: inicioAgendamento, fim: fimAgendamento });
  });

  // Se não há períodos disponíveis, retorna vazio
  if (periodosDisponiveis.length === 0) {
    return horarios;
  }

  // Mescla períodos disponíveis sobrepostos
  const periodosUnificados = unificarPeriodos(periodosDisponiveis);

  // Para cada período disponível, gera slots de horário
  periodosUnificados.forEach(periodo => {
    const slots = gerarSlots(periodo.inicio, periodo.fim, duracaoServico);
    
    slots.forEach(slot => {
      const fimSlot = new Date(slot.getTime() + duracaoServico * 60000);
      
      // Verifica se o slot não conflita com períodos bloqueados
      const temConflito = periodosBloqueados.some(bloqueio => {
        return (slot < bloqueio.fim && fimSlot > bloqueio.inicio);
      });

      horarios.push({
        hora: slot.toTimeString().slice(0, 5), // HH:mm
        disponivel: !temConflito,
        motivo: temConflito ? 'ocupado' : undefined
      });
    });
  });

  // Ordena por horário e remove duplicatas
  return horarios
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .filter((horario, index, array) => 
      index === 0 || horario.hora !== array[index - 1].hora
    );
}

function unificarPeriodos(periodos: Array<{ inicio: Date; fim: Date }>): Array<{ inicio: Date; fim: Date }> {
  if (periodos.length === 0) return [];
  
  // Ordena por início
  const ordenados = periodos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  
  const unificados: Array<{ inicio: Date; fim: Date }> = [ordenados[0]];
  
  for (let i = 1; i < ordenados.length; i++) {
    const atual = ordenados[i];
    const ultimo = unificados[unificados.length - 1];
    
    // Se há sobreposição ou adjacência, unifica
    if (atual.inicio <= ultimo.fim) {
      ultimo.fim = new Date(Math.max(ultimo.fim.getTime(), atual.fim.getTime()));
    } else {
      unificados.push(atual);
    }
  }
  
  return unificados;
}

function gerarSlots(inicio: Date, fim: Date, duracaoMinutos: number): Date[] {
  const slots: Date[] = [];
  const intervaloMs = duracaoMinutos * 60000;
  
  let horaAtual = new Date(inicio);
  
  while (horaAtual.getTime() + intervaloMs <= fim.getTime()) {
    slots.push(new Date(horaAtual));
    horaAtual = new Date(horaAtual.getTime() + intervaloMs);
  }
  
  return slots;
}

export function formatarHorario(horario: string): string {
  return horario.slice(0, 5); // Remove segundos se existirem
}

export function criarDataHora(data: string, horario: string): string {
  const dataLocal = dateUtils.createFromTimeString(new Date(data), horario);
  return dateUtils.toUTC(dataLocal);
}