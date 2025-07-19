import { Tag } from 'lucide-react';
import { useServicos } from '@/hooks/useServicos';
import { useAuthStore } from '@/store/authStore';
import { Servico } from '@/types/servico';
import { Loading } from '@/components/ui/Loading';

interface ServicoSelectorProps {
  onServicoSelect: (servico: Servico) => void;
  selectedServico?: Servico | null;
}

export function ServicoSelector({ onServicoSelect }: ServicoSelectorProps) {
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  const { data: servicos, isLoading } = useServicos(empresaId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loading size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Tag className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-medium">Escolha o Serviço</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {servicos?.map((servico) => (
          <button
            key={servico.id}
            onClick={() => onServicoSelect(servico)}
            className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="font-medium text-gray-900">{servico.titulo}</div>
            <div className="text-sm text-gray-500 mt-1">{servico.descricao}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">{servico.duracao} min</span>
              <span className="font-medium text-primary-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(servico.preco)}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {servico.profissionais?.length || 0} profissional(is) disponível(is)
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}