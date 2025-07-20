// src/components/agendamento/AgendamentoPublicoWrapper.tsx - Wrapper para evitar re-renders
import React, { memo, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { InitialLoading } from '@/components/ui/LoadingState';
import { AlertCircle } from 'lucide-react';

interface AgendamentoPublicoWrapperProps {
  children: (props: {
    empresaId: number;
    empresaInfo: {
      id: string;
      nomeFromUrl: string | null;
      telefoneFromUrl: string | null;
    };
  }) => React.ReactNode;
}

// Função para decodificar parâmetros da URL - memoizada
const decodeUrlParam = (param: string | undefined): string => {
  if (!param) return '';
  try {
    return decodeURIComponent(param.replace(/-/g, ' '));
  } catch (error) {
    console.error('Erro ao decodificar parâmetro:', error);
    return param.replace(/-/g, ' ');
  }
};

// Componente de erro memoizado
const ErrorDisplay = memo(({ message }: { message: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro no Link</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <p className="text-sm text-gray-500">
        Verifique se o link está correto ou entre em contato com a empresa.
      </p>
    </div>
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

// Componente principal memoizado
export const AgendamentoPublicoWrapper = memo(({ children }: AgendamentoPublicoWrapperProps) => {
  const { 
    empresaId: paramEmpresaId, 
    nomeEmpresa: nomeEmpresaParam, 
    telefoneEmpresa: telefoneEmpresaParam 
  } = useParams<{ 
    empresaId: string; 
    nomeEmpresa?: string; 
    telefoneEmpresa?: string; 
  }>();
  
  const [searchParams] = useSearchParams();

  // Memoizar a extração das informações da empresa
  const empresaInfo = useMemo(() => {
    const empresaIdFinal = paramEmpresaId || searchParams.get('empresaId') || '1';
    
    const info = {
      id: empresaIdFinal,
      nomeFromUrl: nomeEmpresaParam ? decodeUrlParam(nomeEmpresaParam) : null,
      telefoneFromUrl: telefoneEmpresaParam && telefoneEmpresaParam !== 'sem-telefone' 
        ? decodeUrlParam(telefoneEmpresaParam) : null
    };

    // Log apenas uma vez quando as informações mudarem
    console.log('🔍 Informações da empresa extraídas da URL:', info);
    
    return info;
  }, [paramEmpresaId, nomeEmpresaParam, telefoneEmpresaParam, searchParams]);

  // Validação do ID da empresa
  const empresaIdNum = useMemo(() => {
    const id = Number(empresaInfo.id);
    return isNaN(id) || id <= 0 ? null : id;
  }, [empresaInfo.id]);

  // Mostrar erro se ID inválido
  if (!empresaIdNum) {
    return (
      <ErrorDisplay message="ID da empresa não fornecido ou inválido no link." />
    );
  }

  // Renderizar children com props estáveis
  return (
    <>
      {children({ 
        empresaId: empresaIdNum, 
        empresaInfo 
      })}
    </>
  );
});

AgendamentoPublicoWrapper.displayName = 'AgendamentoPublicoWrapper';