import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Profissional } from '@/types/profissional';

const createSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  perfil: z.enum(['OWNER', 'ADMIN', 'USER']),
  ativo: z.boolean(),
});

const updateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
  perfil: z.enum(['OWNER', 'ADMIN', 'USER']),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof createSchema>;

interface ProfissionalFormProps {
  profissional?: Profissional;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  empresaId: number;
}

export function ProfissionalForm({ profissional, onSubmit, isLoading, empresaId }: ProfissionalFormProps) {
  const isEditing = !!profissional;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      nome: profissional?.nome || '',
      email: profissional?.email || '',
      senha: '',
      perfil: profissional?.perfil || 'USER',
      ativo: profissional?.ativo ?? true,
    },
  });

  const onFormSubmit = (data: FormData) => {
    if (isEditing) {
      const updateData: any = {
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        ativo: data.ativo,
      };
      
      if (data.senha) {
        updateData.senha = data.senha;
      }
      
      onSubmit(updateData);
    } else {
      onSubmit({
        ...data,
        empresaId,
        googleAccessToken: null,
        googleRefreshToken: null,
      });
    }
  };

  const perfilValue = watch('perfil');
  const ativoValue = watch('ativo');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo
        </label>
        <Input
          id="nome"
          type="text"
          placeholder="João Silva"
          icon={User}
          error={errors.nome?.message}
          {...register('nome')}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="joao@email.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
          {isEditing ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
        </label>
        <Input
          id="senha"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.senha?.message}
          {...register('senha')}
        />
      </div>

      <div>
        <label htmlFor="perfil" className="block text-sm font-medium text-gray-700 mb-1">
          Perfil de Acesso
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            id="perfil"
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            {...register('perfil')}
          >
            <option value="USER">Usuário</option>
            <option value="ADMIN">Administrador</option>
            <option value="OWNER">Proprietário</option>
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {perfilValue === 'OWNER' && 'Acesso total ao sistema'}
          {perfilValue === 'ADMIN' && 'Pode gerenciar agendamentos e serviços'}
          {perfilValue === 'USER' && 'Acesso básico para visualização'}
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('ativo')}
          />
          <span className="text-sm font-medium text-gray-700">
            Profissional ativo
          </span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          {ativoValue ? 'O profissional pode acessar o sistema' : 'O profissional não poderá fazer login'}
        </p>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="submit"
          loading={isLoading}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Profissional
        </Button>
      </div>
    </form>
  );
}