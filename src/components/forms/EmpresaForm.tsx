// src/components/forms/EmpresaForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, Phone, FileText, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { Empresa } from '@/types/empresa';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(16, 'Telefone deve estar no formato +55 31 99999-8888'),
  cnpj: z.string().min(18, 'CNPJ deve estar no formato 00.000.000/0001-00'),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EmpresaFormProps {
  empresa: Empresa;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

// Máscara para CNPJ
const maskCNPJ = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

const unmaskCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Máscara para telefone no formato +55 31 99999-8888
const maskPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  // Se começar com 55, manter como está
  let digits = cleaned;
  if (!cleaned.startsWith('55') && cleaned.length > 0) {
    digits = '55' + cleaned;
  }
  
  // Aplicar máscara +55 31 99999-8888
  if (digits.length <= 2) {
    return `+${digits}`;
  } else if (digits.length <= 4) {
    return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  } else if (digits.length <= 9) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  } else {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  }
};

const unmaskPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export function EmpresaForm({ empresa, onSubmit, isLoading }: EmpresaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: empresa.nome || '',
      email: empresa.email || '',
      telefone: empresa.telefone ? maskPhone(empresa.telefone) : '',
      cnpj: empresa.cnpj ? maskCNPJ(empresa.cnpj) : '',
      ativo: empresa.ativo ?? true,
    },
  });

  useEffect(() => {
    if (empresa) {
      setValue('nome', empresa.nome);
      setValue('email', empresa.email);
      // Aplicar máscaras aos valores vindos da API
      setValue('telefone', maskPhone(empresa.telefone));
      setValue('cnpj', maskCNPJ(empresa.cnpj));
      setValue('ativo', empresa.ativo);
    }
  }, [empresa, setValue]);

  const ativoValue = watch('ativo');

  const onFormSubmit = (data: FormData) => {
    // Backend espera dados COM formatação/máscara
    const formattedData = {
      nome: data.nome.trim(),
      email: data.email.trim(),
      telefone: data.telefone, // Manter com máscara: (11) 99999-9999
      cnpj: data.cnpj, // Manter com máscara: 00.000.000/0001-00
      ativo: data.ativo,
    };
    
    console.log('Dados do formulário (formatados para backend):', formattedData);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
        </div>

        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Empresa
          </label>
          <Input
            id="nome"
            type="text"
            placeholder="Minha Empresa Ltda"
            icon={Building2}
            error={errors.nome?.message}
            {...register('nome')}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Corporativo
          </label>
          <Input
            id="email"
            type="email"
            placeholder="contato@minhaempresa.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <MaskedInput
            id="telefone"
            type="text"
            placeholder="+55 31 99999-8888"
            icon={Phone}
            mask={maskPhone}
            unmask={unmaskPhone}
            error={errors.telefone?.message}
            onChange={(masked, raw) => {
              setValue('telefone', masked);
            }}
            defaultValue={empresa.telefone ? maskPhone(empresa.telefone) : ''}
          />
        </div>

        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ
          </label>
          <MaskedInput
            id="cnpj"
            type="text"
            placeholder="00.000.000/0001-00"
            icon={FileText}
            mask={maskCNPJ}
            unmask={unmaskCNPJ}
            error={errors.cnpj?.message}
            onChange={(masked, raw) => {
              setValue('cnpj', masked);
            }}
            defaultValue={empresa.cnpj ? maskCNPJ(empresa.cnpj) : ''}
          />
        </div>
      </div>

      {/* Status da Empresa */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
          <Info className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Status da Empresa</h3>
        </div>

        <div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('ativo')}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Empresa ativa
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {ativoValue 
                  ? 'A empresa está ativa e disponível para agendamentos' 
                  : 'A empresa está inativa e não receberá novos agendamentos'}
              </p>
            </div>
          </label>
        </div>

        {/* Aviso crítico quando desativada */}
        {!ativoValue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  ⚠️ Atenção: Empresa será desativada
                </h4>
                <div className="text-xs text-red-700 space-y-1">
                  <p>• <strong>Todos os profissionais</strong> perderão acesso ao sistema</p>
                  <p>• <strong>Clientes não poderão</strong> fazer novos agendamentos</p>
                  <p>• <strong>Agendamentos existentes</strong> não serão afetados</p>
                  <p>• <strong>Link público</strong> ficará indisponível</p>
                </div>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Esta ação afetará toda a operação da empresa!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info quando ativa */}
        {ativoValue && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-800 mb-1">
                  ✅ Empresa ativa
                </h4>
                <div className="text-xs text-green-700 space-y-1">
                  <p>• Profissionais podem acessar o sistema</p>
                  <p>• Clientes podem fazer agendamentos</p>
                  <p>• Link público está funcionando</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={isLoading}
          className="px-8"
        >
          Atualizar Empresa
        </Button>
      </div>
    </form>
  );
}