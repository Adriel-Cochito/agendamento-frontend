// src/components/forms/AgendamentoForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { maskPhone } from '@/lib/masks';
import { User, Phone, MessageSquare, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { dateUtils } from '../../utils/dateUtils';
import { 
  getWhatsAppMessageConfig, 
  formatMessageData, 
  createWhatsAppUrl, 
  createWhatsAppUrlNoEmojis,
  copyMessageToClipboard 
} from '../../utils/whatsappMessages';

const schema = z.object({
  nomeCliente: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefoneCliente: z
    .string()
    .regex(/^\+55\s\d{2}\s\d{5}-\d{4}$/, 'Telefone inválido. Formato: +55 31 99999-8888'),
  status: z.enum([
    'AGENDADO',
    'CONFIRMADO', 
    'REALIZADO',
    'CANCELADO',
  ] as const),
});

type FormData = z.infer<typeof schema>;

interface AgendamentoFormProps {
  agendamento?: Agendamento;
  servico: Servico;
  profissional: Profissional;
  dataHora: string;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  empresaId: number;
}

export function AgendamentoForm({
  agendamento,
  servico,
  profissional,
  dataHora,
  onSubmit,
  isLoading,
  empresaId,
}: AgendamentoFormProps) {
  const isEditing = !!agendamento;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCliente: agendamento?.nomeCliente || '',
      telefoneCliente: agendamento?.telefoneCliente || '+55 ',
      status: agendamento?.status || 'AGENDADO',
    },
  });

  const watchedStatus = watch('status');
  const watchedNome = watch('nomeCliente');
  const watchedTelefone = watch('telefoneCliente');

  const onFormSubmit = async (data: FormData) => {
    const submitData = {
      nomeCliente: data.nomeCliente,
      telefoneCliente: data.telefoneCliente,
      dataHora: dataHora,
      status: data.status,
      empresa: { id: empresaId },
      servico: { id: servico.id },
      profissional: { id: profissional.id },
    };

    await onSubmit(submitData);
  };

  const formatDateTime = (dateTime: string) => {
    return dateUtils.formatLocal(dateTime);
  };

  const getStatusBadge = (status: StatusAgendamento) => {
    const badges = {
      AGENDADO: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      CONFIRMADO: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      REALIZADO: { color: 'bg-gray-100 text-gray-800', label: 'Realizado' },
      CANCELADO: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };
    return badges[status] || badges.AGENDADO;
  };

  // Função para lidar com o envio do WhatsApp
  const handleWhatsAppSend = async (withEmojis: boolean = true) => {
    const messageConfig = getWhatsAppMessageConfig(watchedStatus);
    const messageData = formatMessageData(
      { nomeCliente: watchedNome },
      servico,
      profissional,
      dataHora
    );

    const message = messageConfig.generateMessage(messageData);
    const whatsappUrl = withEmojis 
      ? createWhatsAppUrl(watchedTelefone, message)
      : createWhatsAppUrlNoEmojis(watchedTelefone, message);
    
    window.open(whatsappUrl, '_blank');
  };

  // Função para copiar mensagem
  const handleCopyMessage = async () => {
    const messageConfig = getWhatsAppMessageConfig(watchedStatus);
    const messageData = formatMessageData(
      { nomeCliente: watchedNome },
      servico,
      profissional,
      dataHora
    );

    const message = messageConfig.generateMessage(messageData);
    const success = await copyMessageToClipboard(message);
    
    if (success) {
      alert('Mensagem copiada para a área de transferência!');
    } else {
      alert('Erro ao copiar mensagem');
    }
  };

  // Gerar dados para preview
  const messageConfig = getWhatsAppMessageConfig(watchedStatus);
  const messageData = formatMessageData(
    { nomeCliente: watchedNome || 'Cliente' },
    servico,
    profissional,
    dataHora
  );
  const previewMessage = messageConfig.generateMessage(messageData);

  // Verificar se tem dados suficientes para enviar WhatsApp
  const canSendWhatsApp = watchedNome?.trim().length >= 3 && 
                         watchedTelefone?.length >= 17;

  // Verificar se pode enviar WhatsApp (só para agendamentos existentes)
  const canSendWhatsAppNow = isEditing && canSendWhatsApp;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informações do Agendamento */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-gray-900 mb-3">Detalhes do Agendamento</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Serviço:</span>
            <p className="text-sm text-gray-900 font-medium">{servico.titulo}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Profissional:</span>
            <p className="text-sm text-gray-900 font-medium">{profissional.nome}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Data e Horário:</span>
            <p className="text-sm text-gray-900 font-medium">{formatDateTime(dataHora)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Preço:</span>
            <p className="text-sm text-gray-900 font-medium">
              R$ {servico.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Dados do Cliente</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Cliente
          </label>
          <Input
            {...register('nomeCliente')}
            placeholder="Nome completo do cliente"
            icon={User}
            error={errors.nomeCliente?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone do Cliente
          </label>
          <Controller
            name="telefoneCliente"
            control={control}
            render={({ field }) => (
              <MaskedInput
                {...field}
                mask={maskPhone}
                placeholder="+55 31 99999-8888"
                icon={Phone}
                error={errors.telefoneCliente?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status do Agendamento
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="AGENDADO">Agendado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="REALIZADO">Realizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
          
          {/* Status Badge */}
          <div className="mt-2">
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(watchedStatus).color}`}
            >
              {getStatusBadge(watchedStatus).label}
            </span>
          </div>
        </div>
      </div>



      {/* Botões de Ação */}
      <div className="flex space-x-4 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading}
          loading={isLoading}
          className="flex-1"
        >
          {isEditing ? 'Atualizar Agendamento' : 'Criar Agendamento'}
        </Button>
      </div>

            {/* Seção do WhatsApp - Sempre visível baseada no status atual */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-green-900">{messageConfig.title}</h3>
        </div>
        
        <p className="text-sm text-green-700 mb-4">
          Envie uma mensagem personalizada para o cliente baseada no status atual: <strong>{getStatusBadge(watchedStatus).label}</strong>
        </p>

        {/* Preview da Mensagem */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
          <h4 className="font-medium text-gray-900 mb-2">Preview da Mensagem:</h4>
          <div className="max-h-48 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded border">
              {previewMessage}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botão principal do WhatsApp com emojis */}
          <Button
            type="button"
            onClick={() => handleWhatsAppSend(true)}
            disabled={!canSendWhatsAppNow}
            className={`${messageConfig.buttonColor} text-white flex items-center justify-center ${
              !canSendWhatsAppNow ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {messageConfig.buttonText}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          {/* Botão para copiar mensagem */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyMessage}
            disabled={!canSendWhatsAppNow}
            className={`border-green-300 text-green-700 hover:bg-green-50 ${
              !canSendWhatsAppNow ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Mensagem
          </Button>
        </div>

        {/* Mensagem para novos agendamentos */}
        {!isEditing && (
          <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              ⚠️ <strong>Salve o agendamento primeiro:</strong> Para enviar mensagens via WhatsApp, você precisa salvar o agendamento antes. 
              Após salvar, você poderá enviar lembretes, confirmações e outras mensagens personalizadas.
            </p>
          </div>
        )}

        {/* Informações de validação para agendamentos existentes */}
        {isEditing && !canSendWhatsApp && (
          <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              ⚠️ <strong>Para enviar via WhatsApp:</strong> Preencha o nome (mín. 3 caracteres) e telefone completo do cliente.
            </p>
          </div>
        )}

        {/* Dica contextual para agendamentos existentes */}
        {isEditing && canSendWhatsApp && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">
              💡 <strong>Dica:</strong> A mensagem será enviada para {watchedTelefone}. 
              Você pode editar a mensagem diretamente no WhatsApp antes de enviar.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}