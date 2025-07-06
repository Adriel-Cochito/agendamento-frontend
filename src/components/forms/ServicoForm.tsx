import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, FileText, DollarSign, Clock, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Servico } from '@/types/servico';
import { useProfissionais } from '@/hooks/useProfissionais';
import { Loading } from '@/components/ui/Loading';

const schema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  preco: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Preço deve ser um número válido maior que zero',
  }),
  duracao: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Duração deve ser um número válido maior que zero',
  }),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ServicoFormProps {
  servico?: Servico;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  empresaId: number;
}

export function ServicoForm({ servico, onSubmit, isLoading, empresaId }: ServicoFormProps) {
  const isEditing = !!servico;
  const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState('');
  
  const { data: profissionais, isLoading: isLoadingProfissionais } = useProfissionais(empresaId);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: servico?.titulo || '',
      descricao: servico?.descricao || '',
      preco: servico?.preco?.toString() || '',
      duracao: servico?.duracao?.toString() || '',
      ativo: servico?.ativo ?? true,
    },
  });

  useEffect(() => {
    if (servico?.profissionais) {
      setSelectedProfissionais(servico.profissionais.map(p => p.id));
    }
  }, [servico]);

  const onFormSubmit = async (data: FormData) => {
    setSubmitError('');
    
    try {
      if (isEditing) {
        // Para update, enviar apenas os campos que mudaram
        const updateData: any = {
          titulo: data.titulo,
          descricao: data.descricao,
          preco: Number(data.preco),
          duracao: Number(data.duracao),
          ativo: data.ativo,
        };
        
        // Só incluir profissionais se houver mudança
        if (selectedProfissionais.length > 0) {
          updateData.profissionais = selectedProfissionais.map(id => ({ id }));
        }
        
        await onSubmit(updateData);
      } else {
        // Para criação, enviar todos os campos
        const createData = {
          titulo: data.titulo,
          descricao: data.descricao,
          preco: Number(data.preco),
          duracao: Number(data.duracao),
          ativo: data.ativo,
          empresaId,
          profissionais: selectedProfissionais.map(id => ({ id })),
        };
        
        await onSubmit(createData);
      }
    } catch (error: any) {
      console.error('Erro ao submeter:', error);
      setSubmitError(error.response?.data?.message || 'Erro ao salvar serviço');
    }
  };

  const toggleProfissional = (profissionalId: number) => {
    setSelectedProfissionais(prev =>
      prev.includes(profissionalId)
        ? prev.filter(id => id !== profissionalId)
        : [...prev, profissionalId]
    );
  };

  const ativoValue = watch('ativo');

  if (isLoadingProfissionais) {
    return <Loading size="md" />;
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
          Título do Serviço
        </label>
        <Input
          id="titulo"
          type="text"
          placeholder="Ex: Corte de Cabelo"
          icon={Tag}
          error={errors.titulo?.message}
          {...register('titulo')}
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            id="descricao"
            className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            placeholder="Descreva o serviço..."
            {...register('descricao')}
          />
        </div>
        {errors.descricao && (
          <p className="mt-1 text-xs text-red-500">{errors.descricao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
            Preço (R$)
          </label>
          <Input
            id="preco"
            type="number"
            step="0.01"
            placeholder="50.00"
            icon={DollarSign}
            error={errors.preco?.message}
            {...register('preco')}
          />
        </div>

        <div>
          <label htmlFor="duracao" className="block text-sm font-medium text-gray-700 mb-1">
            Duração (minutos)
          </label>
          <Input
            id="duracao"
            type="number"
            placeholder="30"
            icon={Clock}
            error={errors.duracao?.message}
            {...register('duracao')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="inline-block w-4 h-4 mr-1" />
          Profissionais que executam este serviço
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {profissionais?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              Nenhum profissional cadastrado
            </p>
          ) : (
            profissionais?.map((profissional) => (
              <label
                key={profissional.id}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedProfissionais.includes(profissional.id)}
                  onChange={() => toggleProfissional(profissional.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{profissional.nome}</p>
                  <p className="text-xs text-gray-500">{profissional.email}</p>
                </div>
                {selectedProfissionais.includes(profissional.id) && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </label>
            ))
          )}
        </div>
        {selectedProfissionais.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">
            ⚠️ Selecione ao menos um profissional
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('ativo')}
          />
          <span className="text-sm font-medium text-gray-700">
            Serviço ativo
          </span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          {ativoValue ? 'O serviço está disponível para agendamento' : 'O serviço não aparecerá para os clientes'}
        </p>
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
          disabled={selectedProfissionais.length === 0}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Serviço
        </Button>
      </div>
    </form>
  );
}