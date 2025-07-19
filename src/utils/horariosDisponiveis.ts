import { Disponibilidade } from '@/types/disponibilidade';
import { Agendamento } from '@/types/agendamento';
import { HorarioDisponivel } from '@/types/agendamento';
import { dateUtils } from './dateUtils';

export function calcularHorariosDisponiveisPorProfissional(
  disponibilidades: Disponibilidade[],
  agendamentos: Agendamento[],
  dataConsulta: string,
  duracaoServico: number // em minutos
): HorarioDisponivel[] {
  const horarios: HorarioDisponivel[] = [];
  const data = new Date(dataConsulta + 'T00:00:00');
  const diaSemana = data.getDay();

  // Coletamos todos os períodos disponíveis e bloqueados
  const periodosDisponiveis: Array<{ inicio: Date; fim: Date; tipo: string }> = [];
  const periodosBloqueados: Array<{ inicio: Date; fim: Date; motivo: string }> = [];

  // Processar disponibilidades
  disponibilidades.forEach(disp => {
    if (disp.tipo === 'GRADE') {
      // Verifica se o dia da semana está na grade
      if (disp.diasSemana.includes(diaSemana) && disp.horaInicio && disp.horaFim) {
        const inicio = new Date(`${dataConsulta}T${disp.horaInicio}`);
        const fim = new Date(`${dataConsulta}T${disp.horaFim}`);
        periodosDisponiveis.push({ inicio, fim, tipo: 'GRADE' });
      }
    } else if (disp.tipo === 'LIBERADO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = dateUtils.fromISOString(disp.dataHoraInicio);
      const fimDisp = dateUtils.fromISOString(disp.dataHoraFim);
      
      // Verifica se é no mesmo dia
      if (dateUtils.extractDateString(disp.dataHoraInicio) === dataConsulta) {
        periodosDisponiveis.push({ inicio: inicioDisp, fim: fimDisp, tipo: 'LIBERADO' });
      }
    } else if (disp.tipo === 'BLOQUEIO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = dateUtils.fromISOString(disp.dataHoraInicio);
      const fimDisp = dateUtils.fromISOString(disp.dataHoraFim);
      
      // Verifica se é no mesmo dia
      if (dateUtils.extractDateString(disp.dataHoraInicio) === dataConsulta) {
        periodosBloqueados.push({ inicio: inicioDisp, fim: fimDisp, motivo: 'bloqueado' });
      }
    }
  });

  // Adicionar agendamentos existentes como períodos bloqueados
  agendamentos.forEach(agendamento => {
    const inicioAgendamento = dateUtils.fromISOString(agendamento.dataHora);
    const fimAgendamento = new Date(inicioAgendamento.getTime() + duracaoServico * 60000);
    periodosBloqueados.push({ 
      inicio: inicioAgendamento, 
      fim: fimAgendamento, 
      motivo: 'ocupado' 
    });
  });

  // Se não há períodos disponíveis, retorna vazio
  if (periodosDisponiveis.length === 0) {
    return horarios;
  }

  // Mesclar períodos disponíveis sobrepostos
  const periodosUnificados = unificarPeriodos(periodosDisponiveis);

  // Para cada período disponível, gerar slots de horário
  periodosUnificados.forEach(periodo => {
    const slots = gerarSlots(periodo.inicio, periodo.fim, duracaoServico);
    
    slots.forEach(slot => {
      const fimSlot = new Date(slot.getTime() + duracaoServico * 60000);
      
      // Verificar se o slot não conflita com períodos bloqueados
      const conflito = periodosBloqueados.find(bloqueio => {
        return (slot < bloqueio.fim && fimSlot > bloqueio.inicio);
      });

      horarios.push({
        hora: slot.toTimeString().slice(0, 5), // HH:mm
        disponivel: !conflito,
        motivo: conflito?.motivo
      });
    });
  });

  // Ordenar por horário e remover duplicatas
  return horarios
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .filter((horario, index, array) => 
      index === 0 || horario.hora !== array[index - 1].hora
    );
}

export function calcularRangeHorarioGeral(
  todosProfissionais: Array<{
    profissional: any;
    disponibilidades: Disponibilidade[];
  }>,
  data: string
): { horaMinima: string; horaMaxima: string } | null {
  const diaSemana = new Date(data + 'T00:00:00').getDay();
  let horaMinima: Date | null = null;
  let horaMaxima: Date | null = null;

  todosProfissionais.forEach(({ disponibilidades }) => {
    disponibilidades.forEach(disp => {
      if (disp.tipo === 'GRADE' && disp.diasSemana.includes(diaSemana)) {
        if (disp.horaInicio && disp.horaFim) {
          const inicio = new Date(`${data}T${disp.horaInicio}`);
          const fim = new Date(`${data}T${disp.horaFim}`);
          
          if (!horaMinima || inicio < horaMinima) horaMinima = inicio;
          if (!horaMaxima || fim > horaMaxima) horaMaxima = fim;
        }
      } else if (disp.tipo === 'LIBERADO' && disp.dataHoraInicio && disp.dataHoraFim) {
        if (dateUtils.extractDateString(disp.dataHoraInicio) === data) {
          const inicio = dateUtils.fromISOString(disp.dataHoraInicio);
          const fim = dateUtils.fromISOString(disp.dataHoraFim);
          
          if (!horaMinima || inicio < horaMinima) horaMinima = inicio;
          if (!horaMaxima || fim > horaMaxima) horaMaxima = fim;
        }
      }
    });
  });

  if (!horaMinima || !horaMaxima) return null;

  return {
    horaMinima: horaMinima.toTimeString().slice(0, 5),
    horaMaxima: horaMaxima.toTimeString().slice(0, 5)
  };
}

function unificarPeriodos(periodos: Array<{ inicio: Date; fim: Date; tipo: string }>): Array<{ inicio: Date; fim: Date }> {
  if (periodos.length === 0) return [];
  
  // Ordenar por início
  const ordenados = periodos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  
  const unificados: Array<{ inicio: Date; fim: Date }> = [
    { inicio: ordenados[0].inicio, fim: ordenados[0].fim }
  ];
  
  for (let i = 1; i < ordenados.length; i++) {
    const atual = ordenados[i];
    const ultimo = unificados[unificados.length - 1];
    
    // Se há sobreposição ou adjacência, unificar
    if (atual.inicio <= ultimo.fim) {
      ultimo.fim = new Date(Math.max(ultimo.fim.getTime(), atual.fim.getTime()));
    } else {
      unificados.push({ inicio: atual.inicio, fim: atual.fim });
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

// Manter funções originais para compatibilidade
export function calcularHorariosDisponiveis(
  disponibilidades: Disponibilidade[],
  agendamentos: Agendamento[],
  dataConsulta: string,
  duracaoServico: number
): HorarioDisponivel[] {
  return calcularHorariosDisponiveisPorProfissional(
    disponibilidades,
    agendamentos,
    dataConsulta,
    duracaoServico
  );
}

export function formatarHorario(horario: string): string {
  return horario.slice(0, 5);
}

export function criarDataHora(data: string, horario: string): string {
  const dataLocal = dateUtils.createFromTimeString(new Date(data + 'T00:00:00'), horario);
  return dateUtils.toISOString(dataLocal);
}