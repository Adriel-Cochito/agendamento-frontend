// src/utils/dateUtils.ts
export const dateUtils = {
  // Para backend WITHOUT TIME ZONE - apenas formata strings
  formatLocal: (isoString: string): string => {
    // Remove Z e timezone info se existir
    const cleanString = isoString.replace(/[Z]|[+-]\d{2}:\d{2}$/g, '');
    const [datePart, timePart = '00:00:00'] = cleanString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },
  
  // Formata apenas a hora
  formatTimeLocal: (isoString: string): string => {
    const cleanString = isoString.replace(/[Z]|[+-]\d{2}:\d{2}$/g, '');
    const [, timePart = '00:00:00'] = cleanString.split('T');
    const [hours, minutes] = timePart.split(':');
    
    return `${hours}:${minutes}`;
  },
  
  // Cria string no formato que o backend espera (YYYY-MM-DDTHH:mm:ssZ)
  toISOString: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  },
  
  // Converte string do backend para Date local
  fromISOString: (isoString: string): Date => {
    const cleanString = isoString.replace(/[Z]|[+-]\d{2}:\d{2}$/g, '');
    const [datePart, timePart = '00:00:00'] = cleanString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    return new Date(year, month - 1, day, hours, minutes, seconds || 0);
  },
  
  // Para input datetime-local
  toDateTimeLocal: (isoString: string): string => {
    const cleanString = isoString.replace(/[Z]|[+-]\d{2}:\d{2}$/g, '');
    return cleanString.slice(0, 16); // YYYY-MM-DDTHH:mm
  },
  
  // De input datetime-local para o formato do backend
  fromDateTimeLocal: (dateTimeLocal: string): string => {
    const withSeconds = dateTimeLocal.includes(':') ? dateTimeLocal + ':00' : dateTimeLocal;
    return withSeconds + 'Z';
  },
  
  // Para comparações de data (YYYY-MM-DD)
  toDateString: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  // Extrai só a data de uma string ISO
  extractDateString: (isoString: string): string => {
    return isoString.split('T')[0];
  },
  
  // Criar data a partir de data base e horário string
  createFromTimeString: (dateBase: Date, timeString: string): Date => {
    const [hour, minute] = timeString.split(':').map(Number);
    const newDate = new Date(dateBase);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
  },

  // CORREÇÃO: Converte string YYYY-MM-DD para Date SEM problemas de timezone
  fromDateString: (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  },

  // CORREÇÃO: Formatar data para exibição SEM timezone
  formatDateForDisplay: (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  },

  // CORREÇÃO: Formatar data simples para exibição SEM timezone
  formatDateSimple: (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
};