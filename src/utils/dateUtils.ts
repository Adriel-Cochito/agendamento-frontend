export const dateUtils = {
  // Converte data local para UTC (para envio ao backend)
  toUTC: (date: Date): string => {
    return date.toISOString();
  },
  
  // Converte string UTC para data local (para exibição)
  fromUTC: (utcString: string): Date => {
    return new Date(utcString);
  },
  
  // Formata data para exibição local
  formatLocal: (utcString: string): string => {
    const date = new Date(utcString);
    return date.toLocaleString('pt-BR', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Formata apenas a hora
  formatTimeLocal: (utcString: string): string => {
    const date = new Date(utcString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Criar data a partir de horário string
  createFromTimeString: (dateBase: Date, timeString: string): Date => {
    const [hour, minute] = timeString.split(':').map(Number);
    const newDate = new Date(dateBase);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
  }
};