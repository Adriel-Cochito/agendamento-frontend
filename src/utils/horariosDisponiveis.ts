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

  console.log(`🔄 Calculando horários para ${dataConsulta}, dia da semana: ${diaSemana}`);
  console.log(`📋 Disponibilidades recebidas: ${disponibilidades.length}`);

  // Coletamos todos os períodos disponíveis e bloqueados
  const periodosDisponiveis: Array<{ inicio: Date; fim: Date; tipo: string }> = [];
  const periodosBloqueados: Array<{ inicio: Date; fim: Date; motivo: string }> = [];

  // Processar disponibilidades
  disponibilidades.forEach((disp, index) => {
    console.log(`📋 Processando disponibilidade ${index + 1}/${disponibilidades.length}: ${disp.tipo} - ${disp.observacao}`);
    
    if (disp.tipo === 'GRADE') {
      // Verifica se o dia da semana está na grade
      if (disp.diasSemana.includes(diaSemana) && disp.horaInicio && disp.horaFim) {
        const inicio = new Date(`${dataConsulta}T${disp.horaInicio}`);
        const fim = new Date(`${dataConsulta}T${disp.horaFim}`);
        periodosDisponiveis.push({ inicio, fim, tipo: 'GRADE' });
        console.log(`  ✅ GRADE adicionada: ${disp.horaInicio} - ${disp.horaFim}`);
      }
    } else if (disp.tipo === 'LIBERADO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = dateUtils.fromISOString(disp.dataHoraInicio);
      const fimDisp = dateUtils.fromISOString(disp.dataHoraFim);
      
      // CORREÇÃO: Verificar se a data consultada está dentro do intervalo de liberação
      const dataInicioStr = dateUtils.extractDateString(disp.dataHoraInicio);
      const dataFimStr = dateUtils.extractDateString(disp.dataHoraFim);
      
      console.log(`  🔓 LIBERADO: ${dataInicioStr} até ${dataFimStr}, consultando: ${dataConsulta}`);
      
      if (dataConsulta >= dataInicioStr && dataConsulta <= dataFimStr) {
        // Para liberações, precisamos ajustar as datas para o dia sendo consultado
        let inicioAjustado: Date;
        let fimAjustado: Date;
        
        if (dataInicioStr === dataConsulta && dataFimStr === dataConsulta) {
          // Liberação no mesmo dia - usar horários originais
          inicioAjustado = inicioDisp;
          fimAjustado = fimDisp;
        } else if (dataInicioStr === dataConsulta) {
          // Primeiro dia da liberação - usar horário de início até fim do dia
          inicioAjustado = inicioDisp;
          fimAjustado = new Date(`${dataConsulta}T23:59:59`);
        } else if (dataFimStr === dataConsulta) {
          // Último dia da liberação - usar início do dia até horário de fim
          inicioAjustado = new Date(`${dataConsulta}T00:00:00`);
          fimAjustado = fimDisp;
        } else {
          // Dia no meio da liberação - dia todo liberado
          inicioAjustado = new Date(`${dataConsulta}T00:00:00`);
          fimAjustado = new Date(`${dataConsulta}T23:59:59`);
        }
        
        periodosDisponiveis.push({ inicio: inicioAjustado, fim: fimAjustado, tipo: 'LIBERADO' });
        console.log(`  ✅ LIBERADO adicionado: ${inicioAjustado.toTimeString().slice(0,5)} - ${fimAjustado.toTimeString().slice(0,5)}`);
      }
    } else if (disp.tipo === 'BLOQUEIO' && disp.dataHoraInicio && disp.dataHoraFim) {
      const inicioDisp = dateUtils.fromISOString(disp.dataHoraInicio);
      const fimDisp = dateUtils.fromISOString(disp.dataHoraFim);
      
      // CORREÇÃO: Verificar se a data consultada está dentro do intervalo de bloqueio
      const dataInicioStr = dateUtils.extractDateString(disp.dataHoraInicio);
      const dataFimStr = dateUtils.extractDateString(disp.dataHoraFim);
      
      console.log(`  🚫 BLOQUEIO: ${dataInicioStr} até ${dataFimStr}, consultando: ${dataConsulta}`);
      
      if (dataConsulta >= dataInicioStr && dataConsulta <= dataFimStr) {
        // Para bloqueios, precisamos ajustar as datas para o dia sendo consultado
        let inicioAjustado: Date;
        let fimAjustado: Date;
        
        if (dataInicioStr === dataConsulta && dataFimStr === dataConsulta) {
          // Bloqueio no mesmo dia - usar horários originais
          inicioAjustado = inicioDisp;
          fimAjustado = fimDisp;
        } else if (dataInicioStr === dataConsulta) {
          // Primeiro dia do bloqueio - usar horário de início até fim do dia
          inicioAjustado = inicioDisp;
          fimAjustado = new Date(`${dataConsulta}T23:59:59`);
        } else if (dataFimStr === dataConsulta) {
          // Último dia do bloqueio - usar início do dia até horário de fim
          inicioAjustado = new Date(`${dataConsulta}T00:00:00`);
          fimAjustado = fimDisp;
        } else {
          // Dia no meio do bloqueio - dia todo bloqueado
          inicioAjustado = new Date(`${dataConsulta}T00:00:00`);
          fimAjustado = new Date(`${dataConsulta}T23:59:59`);
        }
        
        periodosBloqueados.push({ inicio: inicioAjustado, fim: fimAjustado, motivo: 'bloqueado' });
        console.log(`  🚫 BLOQUEIO adicionado: ${inicioAjustado.toTimeString().slice(0,5)} - ${fimAjustado.toTimeString().slice(0,5)}`);
      }
    }
  });

  console.log(`📊 Períodos disponíveis encontrados: ${periodosDisponiveis.length}`);
  console.log(`🚫 Períodos bloqueados encontrados: ${periodosBloqueados.length}`);

  // Adicionar agendamentos existentes como períodos bloqueados
  agendamentos.forEach(agendamento => {
    const inicioAgendamento = dateUtils.fromISOString(agendamento.dataHora);
    const fimAgendamento = new Date(inicioAgendamento.getTime() + duracaoServico * 60000);
    periodosBloqueados.push({ 
      inicio: inicioAgendamento, 
      fim: fimAgendamento, 
      motivo: 'ocupado' 
    });
    console.log(`  📅 Agendamento bloqueado: ${inicioAgendamento.toTimeString().slice(0,5)} - ${fimAgendamento.toTimeString().slice(0,5)}`);
  });

  // Se não há períodos disponíveis, retorna vazio
  if (periodosDisponiveis.length === 0) {
    console.log('⚠️ Nenhum período disponível encontrado');
    return horarios;
  }

  // Mesclar períodos disponíveis sobrepostos
  const periodosUnificados = unificarPeriodos(periodosDisponiveis);
  console.log(`🔧 Períodos unificados: ${periodosUnificados.length}`);

  // Para cada período disponível, gerar slots de horário
  periodosUnificados.forEach((periodo, index) => {
    console.log(`🔧 Processando período ${index + 1}: ${periodo.inicio.toTimeString().slice(0,5)} - ${periodo.fim.toTimeString().slice(0,5)}`);
    
    const slots = gerarSlots(periodo.inicio, periodo.fim, duracaoServico);
    console.log(`  📋 Slots gerados: ${slots.length}`);
    
    slots.forEach(slot => {
      const fimSlot = new Date(slot.getTime() + duracaoServico * 60000);
      
      // Verificar se o slot não conflita com períodos bloqueados
      const conflito = periodosBloqueados.find(bloqueio => {
        const temConflito = (slot < bloqueio.fim && fimSlot > bloqueio.inicio);
        if (temConflito) {
          console.log(`    ❌ Conflito no slot ${slot.toTimeString().slice(0,5)}: ${bloqueio.motivo}`);
        }
        return temConflito;
      });

      horarios.push({
        hora: slot.toTimeString().slice(0, 5), // HH:mm
        disponivel: !conflito,
        motivo: conflito?.motivo
      });
    });
  });

  console.log(`✅ Total de slots calculados: ${horarios.length}`);
  console.log(`✅ Slots disponíveis: ${horarios.filter(h => h.disponivel).length}`);
  console.log(`❌ Slots bloqueados: ${horarios.filter(h => !h.disponivel).length}`);

  // Ordenar por horário e remover duplicatas
  const horariosFinais = horarios
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .filter((horario, index, array) => 
      index === 0 || horario.hora !== array[index - 1].hora
    );

  console.log(`🎯 Horários finais: ${horariosFinais.length}`);
  
  return horariosFinais;
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

  console.log('🔍 Calculando range de horários para:', { data, diaSemana, profissionais: todosProfissionais.length });

  todosProfissionais.forEach(({ profissional, disponibilidades }) => {
    console.log(`👤 Analisando profissional: ${profissional.nome} (${disponibilidades.length} disponibilidades)`);
    
    disponibilidades.forEach(disp => {
      if (disp.tipo === 'GRADE' && disp.diasSemana && disp.diasSemana.includes(diaSemana) && disp.horaInicio && disp.horaFim) {
        const inicioHora = new Date(`${data}T${disp.horaInicio}`);
        const fimHora = new Date(`${data}T${disp.horaFim}`);
        
        if (!horaMinima || inicioHora < horaMinima) {
          horaMinima = inicioHora;
        }
        if (!horaMaxima || fimHora > horaMaxima) {
          horaMaxima = fimHora;
        }
        
        console.log(`  📅 GRADE ${disp.horaInicio}-${disp.horaFim}: expandiu range`);
      } else if ((disp.tipo === 'LIBERADO' || disp.tipo === 'BLOQUEIO') && disp.dataHoraInicio && disp.dataHoraFim) {
        // CORREÇÃO: Considerar liberações/bloqueios que abrangem a data consultada
        const dataInicioStr = dateUtils.extractDateString(disp.dataHoraInicio);
        const dataFimStr = dateUtils.extractDateString(disp.dataHoraFim);
        
        if (data >= dataInicioStr && data <= dataFimStr) {
          let inicioHora: Date;
          let fimHora: Date;
          
          if (dataInicioStr === data && dataFimStr === data) {
            // Mesmo dia - usar horários originais
            inicioHora = dateUtils.fromISOString(disp.dataHoraInicio);
            fimHora = dateUtils.fromISOString(disp.dataHoraFim);
          } else if (dataInicioStr === data) {
            // Primeiro dia - usar horário de início
            inicioHora = dateUtils.fromISOString(disp.dataHoraInicio);
            fimHora = new Date(`${data}T23:59:59`);
          } else if (dataFimStr === data) {
            // Último dia - usar horário de fim
            inicioHora = new Date(`${data}T00:00:00`);
            fimHora = dateUtils.fromISOString(disp.dataHoraFim);
          } else {
            // Dia no meio - dia todo
            inicioHora = new Date(`${data}T00:00:00`);
            fimHora = new Date(`${data}T23:59:59`);
          }
          
          if (!horaMinima || inicioHora < horaMinima) {
            horaMinima = inicioHora;
          }
          if (!horaMaxima || fimHora > horaMaxima) {
            horaMaxima = fimHora;
          }
          
          // CORREÇÃO AQUI - Garantir que inicioHora e fimHora são Dates válidas
          const inicioFormatado = inicioHora ? inicioHora.toTimeString().slice(0,5) : '00:00';
          const fimFormatado = fimHora ? fimHora.toTimeString().slice(0,5) : '00:00';          console.log(`  🔓 ${disp.tipo} ${inicioFormatado}-${fimFormatado}: expandiu range`);
        }
      }
    });
  });

  if (!horaMinima || !horaMaxima) {
    console.log('⚠️ Nenhum horário encontrado, usando padrão');
    return {
      horaMinima: '09:00',
      horaMaxima: '18:00'
    };
  }

  // CORREÇÃO AQUI - Garantir que horaMinima e horaMaxima não são null
  const resultado = {
    horaMinima: horaMinima ? (horaMinima as Date).toTimeString().slice(0, 5) : '09:00',
    horaMaxima: horaMaxima ? (horaMaxima as Date).toTimeString().slice(0, 5) : '18:00'  };

  console.log('✨ Range final calculado:', resultado);
  return resultado;
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