// src/components/agendamento/ProfissionalSelector.tsx
import { useState } from 'react';
import { User, Users, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Profissional } from '@/types/profissional';
import { Servico } from '@/types/servico';

interface ProfissionalSelectorProps {
  servico: Servico;
  onProfissionaisSelect: (profissionais: Profissional[]) => void;
  selectedProfissionais?: Profissional[];
  singleSelect?: boolean;
  profissionaisDisponiveis?: Profissional[]; // Novos: profissionais pré-filtrados
}

export function ProfissionalSelector({
  servico,
  onProfissionaisSelect,
  selectedProfissionais = [],
  singleSelect = false,
  profissionaisDisponiveis
}: ProfissionalSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    selectedProfissionais.map(p => p.id)
  );

  // Usar profissionais pré-filtrados se fornecidos, senão usar os do serviço
  const profissionaisParaEscolha = profissionaisDisponiveis || servico.profissionais || [];

  console.log('🎯 ProfissionalSelector:', {
    servicoProfissionais: servico.profissionais?.length || 0,
    profissionaisDisponiveis: profissionaisDisponiveis?.length || 0,
    profissionaisParaEscolha: profissionaisParaEscolha.length,
    nomes: profissionaisParaEscolha.map(p => p.nome)
  });

  const handleProfissionalToggle = (profissional: Profissional) => {
    let newSelectedIds: number[];
    
    if (singleSelect) {
      // Modo seleção única
      newSelectedIds = [profissional.id];
    } else {
      // Modo seleção múltipla
      if (selectedIds.includes(profissional.id)) {
        newSelectedIds = selectedIds.filter(id => id !== profissional.id);
      } else {
        newSelectedIds = [...selectedIds, profissional.id];
      }
    }
    
    setSelectedIds(newSelectedIds);
    
    // Buscar os objetos completos dos profissionais selecionados
    const profissionaisSelecionados = profissionaisParaEscolha.filter(p => 
      newSelectedIds.includes(p.id)
    );
    
    onProfissionaisSelect(profissionaisSelecionados);
  };

  const handleSelectAll = () => {
    const allIds = profissionaisParaEscolha.map(p => p.id);
    setSelectedIds(allIds);
    onProfissionaisSelect(profissionaisParaEscolha);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    onProfissionaisSelect([]);
  };

  if (profissionaisParaEscolha.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum profissional disponível
        </h3>
        <p className="text-gray-500">
          {profissionaisDisponiveis 
            ? 'Nenhum profissional está disponível neste horário específico.'
            : 'Este serviço não possui profissionais cadastrados que possam executá-lo.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {singleSelect ? 'Escolha o Profissional' : 'Escolha os Profissionais'}
          </h3>
        </div>
        
        {!singleSelect && profissionaisParaEscolha.length > 1 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedIds.length === profissionaisParaEscolha.length}
            >
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedIds.length === 0}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Informações do serviço */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <strong>Serviço:</strong> {servico.titulo}
        </p>
        <p className="text-sm text-gray-500">
          {profissionaisParaEscolha.length} profissional(is) {profissionaisDisponiveis ? 'disponível(is) neste horário' : 'pode(m) executar este serviço'}
        </p>
      </div>

      {/* Lista de profissionais */}
      <div className="grid grid-cols-1 gap-3">
        {profissionaisParaEscolha.map((profissional) => {
          const isSelected = selectedIds.includes(profissional.id);
          
          return (
            <button
              key={profissional.id}
              onClick={() => handleProfissionalToggle(profissional)}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                isSelected
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isSelected 
                      ? 'bg-primary-600' 
                      : 'bg-gray-400'
                  }`}>
                    {profissional.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {profissional.nome}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {profissional.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {profissional.perfil === 'OWNER' && 'Proprietário'}
                      {profissional.perfil === 'ADMIN' && 'Administrador'}
                      {profissional.perfil === 'USER' && 'Usuário'}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Resumo da seleção */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <p className="text-sm text-primary-800">
            {singleSelect 
              ? `Profissional selecionado: ${profissionaisParaEscolha.find(p => p.id === selectedIds[0])?.nome}`
              : `${selectedIds.length} profissional(is) selecionado(s)`
            }
          </p>
          {!singleSelect && selectedIds.length > 1 && (
            <p className="text-xs text-primary-600 mt-1">
              O cliente poderá escolher entre os profissionais selecionados no próximo passo
            </p>
          )}
        </div>
      )}
    </div>
  );
}