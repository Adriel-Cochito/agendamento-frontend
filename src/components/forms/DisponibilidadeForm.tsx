import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar, 
  Clock, 
  CalendarDays, 
  User, 
  FileText, 
  Shield,
  Timer,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { useProfissionais } from '@/hooks/useProfissionais';
import { Disponibilidade, TipoDisponibilidade } from '@/types/disponibilidade';

const baseSchema = z.object({
  tipo: z.enum(['GRADE', 'LIBERADO', 'BLOQUEIO'] as const),
  profissionalId: z.number().min(1, 'Selecione um profissional'),
  observacao: z.string().min(3, 'Observação deve ter no mínimo 3 caracteres'),
});

const gradeSchema = baseSchema.extend({
  diasSemana: z.array(z.number()).min(1, 'Selecione pelo menos um dia da semana'),
  horaInicio: z.string().min(1, 'Hora de início é obrigatória'),
  horaFim: z.string().min(1, 'Hora de fim é obrigatória'),
});

const pontoSchema = baseSchema.extend({
  dataHoraInicio: z.string().min(1, 'Data e hora de início são obrigatórias'),
  dataHoraFim: z.string().min(1, 'Data e hora de fim são obrigatórias'),
});

type FormData = z.infer<typeof gradeSchema>;

interface DisponibilidadeFormProps {
  disponibilidade?: Disponibilidade;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  empresaId: number;
}

const diasSemanaOptions = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export function DisponibilidadeForm({ 
  disponibilidade, 
  onSubmit, 
  isLoading, 
  empresaId 
}: DisponibilidadeFormProps) {
  const isEditing = !!disponibilidade;
  const [selectedTipo, setSelectedTipo] = useState<TipoDisponibilidade>(
    disponibilidade?.tipo || 'GRADE'
  );
  const [submitError, setSubmitError] = useState('');

  const { data: profissionais, isLoading: isLoadingProfissionais } = useProfissionais(empresaId);

  const getSchema = () => {
    if (selectedTipo === 'GRADE') {
      return gradeSchema;
    }
    return pontoSchema;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      tipo: disponibilidade?.tipo || 'GRADE',
      profissionalId: disponibilidade?.profissional?.id || 0,
      observacao: disponibilidade?.observacao || '',
      diasSemana: disponibilidade?.diasSemana || [],
      horaInicio: disponibilidade?.horaInicio || '',
      horaFim: disponibilidade?.horaFim || '',
    },
  });

  const tipoValue = watch('tipo');

  useEffect(() => {
    if (tipoValue !== selectedTipo) {
      setSelectedTipo(tipoValue);
      // Reset campos específicos quando mudar o tipo
      if (tipoValue === 'GRADE') {
        setValue('dataHoraInicio', undefined as any);
        setValue('dataHoraFim', undefined as any);
      } else {
        setValue('diasSemana', []);
        setValue('horaInicio', '');
        setValue('horaFim', '');
      }
    }
  }, [tipoValue, selectedTipo, setValue]);

  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const onFormSubmit = async (data: FormData) => {
    setSubmitError('');
    
    try {
      const submitData: any = {
        tipo: data.tipo,
        profissionalId: data.profissionalId,
        observacao: data.observacao,
        empresaId,
      };

      if (data.tipo === 'GRADE') {
        submitData.diasSemana = data.diasSemana;
        submitData.horaInicio = data.horaInicio;
        submitData.horaFim = data.horaFim;
      } else {
        submitData.dataHoraInicio = (data as any).dataHoraInicio;
        submitData.dataHoraFim = (data as any).dataHoraFim;
      }

      await onSubmit(submitData);
    } catch (error: any) {
      console.error('Erro ao submeter:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Erro ao salvar disponibilidade');
    }
  };

  if (isLoadingProfissionais) {
    return <Loading size="md" />;
  }

  const getTipoIcon = (tipo: TipoDisponibilidade) => {
    switch (tipo) {
      case 'GRADE':
        return Calendar;
      case 'LIBERADO':
        return Timer;
      case 'BLOQUEIO':
        return Ban;
    }
  };

  const getTipoColor = (tipo: TipoDisponibilidade) => {
    switch (tipo) {
      case 'GRADE':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'LIBERADO':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'BLOQUEIO':
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getTipoDescription = (tipo: TipoDisponibilidade) => {
    switch (tipo) {
      case 'GRADE':
        return 'Horário fixo de trabalho que se repete semanalmente';
      case 'LIBERADO':
        return 'Horário específico liberado para agendamentos';
      case 'BLOQUEIO':
        return 'Período bloqueado onde não haverá atendimentos';
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Tipo de Disponibilidade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Disponibilidade
        </label>
        <div className="space-y-3">
          {(['GRADE', 'LIBERADO', 'BLOQUEIO'] as const).map((tipo) => {
            const Icon = getTipoIcon(tipo);
            return (
              <label
                key={tipo}
                className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTipo === tipo
                    ? getTipoColor(tipo)
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={tipo}
                  {...register('tipo')}
                  className="sr-only"
                />
                <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">
                    {tipo === 'GRADE' && 'Grade Horária'}
                    {tipo === 'LIBERADO' && 'Horário Liberado'}
                    {tipo === 'BLOQUEIO' && 'Bloqueio'}
                  </div>
                  <p className="text-sm opacity-75 mt-1">
                    {getTipoDescription(tipo)}
                  </p>
                </div>
                {selectedTipo === tipo && (
                  <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </label>
            );
          })}
        </div>
        {errors.tipo && (
          <p className="mt-1 text-xs text-red-500">{errors.tipo.message}</p>
        )}
      </div>

      {/* Profissional */}
      <div>
        <label htmlFor="profissionalId" className="block text-sm font-medium text-gray-700 mb-1">
          Profissional
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            id="profissionalId"
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            {...register('profissionalId', { valueAsNumber: true })}
          >
            <option value={0}>Selecione um profissional</option>
            {profissionais?.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.nome} - {prof.email}
              </option>
            ))}
          </select>
        </div>
        {errors.profissionalId && (
          <p className="mt-1 text-xs text-red-500">{errors.profissionalId.message}</p>
        )}
      </div>

      {/* Campos específicos por tipo */}
      {selectedTipo === 'GRADE' && (
        <>
          {/* Dias da Semana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="inline-block w-4 h-4 mr-1" />
              Dias da Semana
            </label>
            <Controller
              name="diasSemana"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {diasSemanaOptions.map((dia) => (
                    <label
                      key={dia.value}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={field.value?.includes(dia.value) || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newValue = field.value || [];
                          if (checked) {
                            field.onChange([...newValue, dia.value]);
                          } else {
                            field.onChange(newValue.filter(v => v !== dia.value));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {dia.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.diasSemana && (
              <p className="mt-1 text-xs text-red-500">{errors.diasSemana.message}</p>
            )}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Início
              </label>
              <Input
                id="horaInicio"
                type="time"
                icon={Clock}
                error={errors.horaInicio?.message}
                {...register('horaInicio')}
              />
            </div>
            <div>
              <label htmlFor="horaFim" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fim
              </label>
              <Input
                id="horaFim"
                type="time"
                icon={Clock}
                error={errors.horaFim?.message}
                {...register('horaFim')}
              />
            </div>
          </div>
        </>
      )}

      {(selectedTipo === 'LIBERADO' || selectedTipo === 'BLOQUEIO') && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="dataHoraInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Início
            </label>
            <Input
              id="dataHoraInicio"
              type="datetime-local"
              icon={Calendar}
              defaultValue={formatDateTimeLocal(disponibilidade?.dataHoraInicio || null)}
              error={(errors as any).dataHoraInicio?.message}
              {...register('dataHoraInicio' as any)}
            />
          </div>
          <div>
            <label htmlFor="dataHoraFim" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Fim
            </label>
            <Input
              id="dataHoraFim"
              type="datetime-local"
              icon={Calendar}
              defaultValue={formatDateTimeLocal(disponibilidade?.dataHoraFim || null)}
              error={(errors as any).dataHoraFim?.message}
              {...register('dataHoraFim' as any)}
            />
          </div>
        </div>
      )}

      {/* Observação */}
      <div>
        <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
          Observação
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            id="observacao"
            className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            placeholder="Descreva a disponibilidade..."
            {...register('observacao')}
          />
        </div>
        {errors.observacao && (
          <p className="mt-1 text-xs text-red-500">{errors.observacao.message}</p>
        )}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="submit"
          loading={isLoading}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Disponibilidade
        </Button>
      </div>
    </form>
  );
}