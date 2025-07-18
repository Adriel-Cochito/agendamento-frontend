import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { maskPhone } from '@/lib/masks';
import { User, Phone, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { dateUtils } from '../../utils/dateUtils';

const schema = z.object({
  nomeCliente: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefoneCliente: z
    .string()
    .regex(/^\+55\s\d{2}\s\d{5}-\d{4}$/, 'Telefone inválido. Formato: +55 31 99999-8888'),
  status: z.enum([
    'AGENDADO',
    'CONFIRMADO',
    'EM_ANDAMENTO',
    'CONCLUIDO',
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
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCliente: agendamento?.nomeCliente || '',
      telefoneCliente: agendamento?.telefoneCliente || '+55 ',
      status: agendamento?.status || 'AGENDADO',
    },
  });

  const onFormSubmit = async (data: FormData) => {
    // Garantir que dataHora seja enviado em UTC
    const dataHoraUTC = dateUtils.toUTC(new Date(dataHora));

    const submitData = {
      nomeCliente: data.nomeCliente,
      telefoneCliente: data.telefoneCliente,
      dataHora: dataHoraUTC,
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
      EM_ANDAMENTO: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      CONCLUIDO: { color: 'bg-gray-100 text-gray-800', label: 'Concluído' },
      CANCELADO: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };
    return badges[status] || badges.AGENDADO;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informações do Agendamento */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-gray-900 mb-3">Detalhes do Agendamento</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Serviço:</span>
            <p className="text-sm text-gray-900">{servico.titulo}</p>
            <p className="text-xs text-gray-500">{servico.descricao}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Profissional:</span>
            <p className="text-sm text-gray-900">{profissional.nome}</p>
            <p className="text-xs text-gray-500">{profissional.email}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Data e Horário:</span>
            <p className="text-sm text-gray-900">{formatDateTime(dataHora)}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Duração:</span>
            <p className="text-sm text-gray-900">{servico.duracao} minutos</p>
            <p className="text-xs text-gray-500">
              Valor:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(servico.preco)}
            </p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Dados do Cliente</h3>

        <div>
          <label
            htmlFor="nomeCliente"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome Completo
          </label>
          <Input
            id="nomeCliente"
            type="text"
            placeholder="João Silva"
            icon={User}
            error={errors.nomeCliente?.message}
            {...register('nomeCliente')}
          />
        </div>

        <div>
          <label
            htmlFor="telefoneCliente"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone
          </label>
          <Controller
            name="telefoneCliente"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="telefoneCliente"
                type="tel"
                placeholder="+55 31 99999-8888"
                icon={Phone}
                error={errors.telefoneCliente?.message}
                mask={maskPhone}
                value={field.value}
                onChange={(masked) => field.onChange(masked)}
              />
            )}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status do Agendamento
        </label>
        <div className="relative">
          <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            id="status"
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            {...register('status')}
          >
            <option value="AGENDADO">Agendado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        {errors.status && (
          <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="submit" loading={isLoading}>
          {isEditing ? 'Atualizar' : 'Criar'} Agendamento
        </Button>
      </div>
    </form>
  );
}
