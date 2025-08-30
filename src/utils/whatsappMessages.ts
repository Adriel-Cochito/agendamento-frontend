// src/utils/whatsappMessages.ts
import { StatusAgendamento } from '@/types/agendamento';
import { dateUtils } from './dateUtils';

export interface WhatsAppMessageData {
  clienteName: string;
  serviceName: string;
  profissionalName: string;
  date: string;
  time: string;
  empresaNome?: string;
}

export interface WhatsAppMessageConfig {
  title: string;
  buttonText: string;
  buttonColor: string;
  generateMessage: (data: WhatsAppMessageData) => string;
}

export const whatsappMessages: Record<StatusAgendamento, WhatsAppMessageConfig> = {
  AGENDADO: {
    title: 'Enviar Lembrete de Agendamento',
    buttonText: 'Enviar Lembrete',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    generateMessage: (data) => `📅 Lembrete de Agendamento

Olá ${data.clienteName}!

Este é um lembrete do seu agendamento:

📍 Serviço: ${data.serviceName}
👨‍⚕️ Profissional: ${data.profissionalName}
📅 Data: ${data.date}
⏰ Horário: ${data.time}

🔔 Não se esqueça! Chegue com 10 minutos de antecedência.

📞 Se precisar remarcar ou cancelar, entre em contato conosco.

Aguardamos você! 😊`
  },

  CONFIRMADO: {
    title: 'Enviar Confirmação de Agendamento',
    buttonText: 'Enviar Confirmação',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    generateMessage: (data) => `✅ Confirmação de Agendamento

🎯 Olá ${data.clienteName}!

Seu agendamento foi CONFIRMADO com sucesso:

📅 Data: ${data.date}
⏰ Horário: ${data.time}
💼 Serviço: ${data.serviceName}
👨‍⚕️ Profissional: ${data.profissionalName}

📍 Por favor, chegue com 10 minutos de antecedência para melhor organização.

📞 Caso precise remarcar ou cancelar, entre em contato conosco pelo WhatsApp ou telefone.

✨ Agradecemos sua confiança e estaremos à disposição!

---
Esta é uma mensagem automática de confirmação.`
  },

  REALIZADO: {
    title: 'Enviar Agradecimento',
    buttonText: 'Enviar Agradecimento',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    generateMessage: (data) => `🎉 Obrigado pela sua visita!

Olá ${data.clienteName}!

Esperamos que tenha ficado satisfeito(a) com o nosso atendimento:

✅ Serviço: ${data.serviceName}
👨‍⚕️ Profissional: ${data.profissionalName}
📅 Data: ${data.date}

⭐ Sua opinião é muito importante para nós!

📞 Para novos agendamentos ou dúvidas, estamos sempre à disposição.

💙 Agradecemos pela confiança e esperamos vê-lo(a) novamente em breve!`
  },

  CANCELADO: {
    title: 'Enviar sobre Cancelamento',
    buttonText: 'Falar sobre Cancelamento',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    generateMessage: (data) => `⚠️ Sobre o Cancelamento

Olá ${data.clienteName}!

Confirmamos o cancelamento do seu agendamento:

📅 Era para: ${data.date} às ${data.time}
💼 Serviço: ${data.serviceName}
👨‍⚕️ Profissional: ${data.profissionalName}

🔄 Quando quiser remarcar, estamos aqui para ajudar!

📞 Entre em contato conosco para:
• Reagendar para outra data
• Esclarecer dúvidas
• Novos agendamentos

💙 Esperamos vê-lo(a) em breve!`
  }
};

// Função utilitária para formatar telefone para WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  const numbersOnly = phone.replace(/\D/g, '');
  if (!numbersOnly.startsWith('55')) {
    return `55${numbersOnly}`;
  }
  return numbersOnly;
};

// Função utilitária para criar URL do WhatsApp
export const createWhatsAppUrl = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Função utilitária para copiar mensagem
export const copyMessageToClipboard = async (message: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch (err) {
    console.error('Erro ao copiar mensagem:', err);
    return false;
  }
};

// Função para obter configuração da mensagem baseada no status
export const getWhatsAppMessageConfig = (status: StatusAgendamento): WhatsAppMessageConfig => {
  return whatsappMessages[status];
};

// Função para gerar dados formatados da mensagem
export const formatMessageData = (
  agendamento: any, 
  servico: any, 
  profissional: any,
  dataHora: string
): WhatsAppMessageData => {
  // Usar as funções do dateUtils que já tratam o fuso horário corretamente
  const formattedDateTime = dateUtils.formatLocal(dataHora);
  const [formattedDate, formattedTime] = formattedDateTime.split(' ');

  return {
    clienteName: agendamento?.nomeCliente || 'Cliente',
    serviceName: servico?.titulo || 'Serviço',
    profissionalName: profissional?.nome || 'Profissional',
    date: formattedDate,
    time: formattedTime,
  };
};