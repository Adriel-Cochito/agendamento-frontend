import { Agendamento } from '@/types/agendamento';

export interface CalendarioData {
  date: Date;
  agendamentos: Agendamento[];
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isWeekend?: boolean;
}

export type TipoVisualizacao = 'mensal' | 'semanal' | 'diaria';

export function gerarDiasDoMes(ano: number, mes: number): CalendarioData[] {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const primeiroDiaSemana = primeiroDia.getDay(); // 0 = domingo
  const diasNoMes = ultimoDia.getDate();
  
  const dias: CalendarioData[] = [];
  const hoje = new Date();
  
  // Adicionar dias do mês anterior para completar a primeira semana
  const diasMesAnterior = new Date(ano, mes, 0).getDate();
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const data = new Date(ano, mes - 1, diasMesAnterior - i);
    dias.push({
      date: data,
      agendamentos: [],
      isCurrentMonth: false,
      isToday: isSameDay(data, hoje),
      isWeekend: data.getDay() === 0 || data.getDay() === 6,
    });
  }
  
  // Adicionar dias do mês atual
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(ano, mes, dia);
    dias.push({
      date: data,
      agendamentos: [],
      isCurrentMonth: true,
      isToday: isSameDay(data, hoje),
      isWeekend: data.getDay() === 0 || data.getDay() === 6,
    });
  }
  
  // Adicionar dias do próximo mês para completar a última semana
  const totalDias = dias.length;
  const diasParaCompletar = 42 - totalDias; // 6 semanas * 7 dias
  for (let dia = 1; dia <= diasParaCompletar; dia++) {
    const data = new Date(ano, mes + 1, dia);
    dias.push({
      date: data,
      agendamentos: [],
      isCurrentMonth: false,
      isToday: isSameDay(data, hoje),
      isWeekend: data.getDay() === 0 || data.getDay() === 6,
    });
  }
  
  return dias;
}

export function gerarDiasDaSemana(data: Date): CalendarioData[] {
  const inicioSemana = getInicioSemana(data);
  const dias: CalendarioData[] = [];
  const hoje = new Date();
  
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    
    dias.push({
      date: dia,
      agendamentos: [],
      isCurrentMonth: true,
      isToday: isSameDay(dia, hoje),
      isWeekend: dia.getDay() === 0 || dia.getDay() === 6,
    });
  }
  
  return dias;
}

export function gerarHorariosDoDia(data: Date): string[] {
  const horarios: string[] = [];
  
  for (let hora = 6; hora <= 22; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const horarioStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horarios.push(horarioStr);
    }
  }
  
  return horarios;
}

export function agruparAgendamentosPorData(agendamentos: Agendamento[]): Map<string, Agendamento[]> {
  const grupos = new Map<string, Agendamento[]>();
  
  agendamentos.forEach(agendamento => {
    const data = new Date(agendamento.dataHora);
    const chaveData = formatarDataParaChave(data);
    
    if (!grupos.has(chaveData)) {
      grupos.set(chaveData, []);
    }
    grupos.get(chaveData)!.push(agendamento);
  });
  
  return grupos;
}

export function formatarDataParaChave(data: Date): string {
  return data.toISOString().split('T')[0];
}

export function isSameDay(data1: Date, data2: Date): boolean {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}

export function getInicioSemana(data: Date): Date {
  const inicio = new Date(data);
  const dia = inicio.getDay();
  const diff = inicio.getDate() - dia; // domingo = 0
  return new Date(inicio.setDate(diff));
}

export function formatarMesAno(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(data);
}

export function formatarDiaSemana(data: Date, formato: 'curto' | 'longo' = 'curto'): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: formato === 'curto' ? 'short' : 'long'
  }).format(data);
}

export function formatarDiaMes(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(data);
}

export function obterCorPorStatus(status: string): string {
  const cores = {
    'AGENDADO': 'bg-blue-500',
    'CONFIRMADO': 'bg-green-500',
    'EM_ANDAMENTO': 'bg-yellow-500',
    'CONCLUIDO': 'bg-gray-500',
    'CANCELADO': 'bg-red-500',
  };
  
  return cores[status as keyof typeof cores] || 'bg-blue-500';
}