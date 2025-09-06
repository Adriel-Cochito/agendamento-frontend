// src/components/agendamento/ProfissionalSelector.tsx - Versão otimizada
import { useState, useCallback, useMemo, memo } from 'react';
import { Users, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Profissional } from '@/types/profissional';
import { Servico } from '@/types/servico';

interface ProfissionalSelectorProps {
  servico: Servico;
  onProfissionaisSelect: (profissionais: Profissional[]) => void;
  selectedProfissionais?: Profissional[];
  singleSelect?: boolean;
  profissionaisDisponiveis?: Profissional[];
}

// Componente de item de profissional memoizado
const ProfissionalItem = memo(({ 
  profissional, 
  isSelected, 
  onToggle 
}: { 
  profissional: Profissional; 
  isSelected: boolean; 
  onToggle: (profissional: Profissional) => void;
}) => {
  const handleClick = useCallback(() => {
    onToggle(profissional);
  }, [profissional, onToggle]);

  return (
    <button
      onClick={handleClick}
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
});

ProfissionalItem.displayName = 'ProfissionalItem';

export const ProfissionalSelector = memo(({
  servico,
  onProfissionaisSelect,
  selectedProfissionais = [],
  singleSelect = false,
  profissionaisDisponiveis
}: ProfissionalSelectorProps) => {
  // IDs selecionados como estado local
  const [selectedIds, setSelectedIds] = useState<number[]>(
    selectedProfissionais.map(p => p.id)
  );

  // Memoizar lista de profissionais para escolha
  const profissionaisParaEscolha = useMemo(() => {
    const lista = profissionaisDisponiveis || servico.profissionais || [];
    
    console.log('🎯 [PROF SELECTOR] Analisando profissionais:', {
      servicoId: servico.id,
      servicoTitulo: servico.titulo,
      servicoProfissionais: servico.profissionais?.length || 0,
      profissionaisDisponiveis: profissionaisDisponiveis?.length || 0,
      profissionaisParaEscolha: lista.length,
      nomes: lista.map(p => ({ id: p.id, nome: p.nome, ativo: p.ativo })),
      singleSelect
    });
    
    return lista;
  }, [profissionaisDisponiveis, servico.profissionais, servico.id, servico.titulo, singleSelect]);

  // Handler de toggle memoizado
  const handleProfissionalToggle = useCallback((profissional: Profissional) => {
    console.log('👤 [PROF SELECTOR] Toggle profissional:', {
      id: profissional.id,
      nome: profissional.nome,
      singleSelect,
      currentSelectedIds: selectedIds
    });
    
    let newSelectedIds: number[];
    
    if (singleSelect) {
      // Modo seleção única
      newSelectedIds = [profissional.id];
      console.log('✅ [PROF SELECTOR] Seleção única:', newSelectedIds);
    } else {
      // Modo seleção múltipla
      if (selectedIds.includes(profissional.id)) {
        newSelectedIds = selectedIds.filter(id => id !== profissional.id);
        console.log('➖ [PROF SELECTOR] Removendo da seleção:', newSelectedIds);
      } else {
        newSelectedIds = [...selectedIds, profissional.id];
        console.log('➕ [PROF SELECTOR] Adicionando à seleção:', newSelectedIds);
      }
    }
    
    setSelectedIds(newSelectedIds);
    
    // Buscar os objetos completos dos profissionais selecionados
    const profissionaisSelecionados = profissionaisParaEscolha.filter(p => 
      newSelectedIds.includes(p.id)
    );
    
    console.log('📤 [PROF SELECTOR] Enviando profissionais selecionados:', {
      count: profissionaisSelecionados.length,
      nomes: profissionaisSelecionados.map(p => p.nome)
    });
    
    onProfissionaisSelect(profissionaisSelecionados);
  }, [selectedIds, singleSelect, profissionaisParaEscolha, onProfissionaisSelect]);

  // Handlers de seleção em massa memoizados
  const handleSelectAll = useCallback(() => {
    const allIds = profissionaisParaEscolha.map(p => p.id);
    setSelectedIds(allIds);
    onProfissionaisSelect(profissionaisParaEscolha);
  }, [profissionaisParaEscolha, onProfissionaisSelect]);

  const handleClearAll = useCallback(() => {
    setSelectedIds([]);
    onProfissionaisSelect([]);
  }, [onProfissionaisSelect]);

  // Verificar se há profissionais disponíveis
  if (profissionaisParaEscolha.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum profissional disponível
        </h3>
        <p className="text-gray-500">
          Este serviço não possui profissionais cadastrados que possam executá-lo.
          Configure os profissionais para este serviço primeiro.
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
          {profissionaisDisponiveis 
            ? `${profissionaisParaEscolha.length} profissional(is) disponível(is) no horário selecionado`
            : `${profissionaisParaEscolha.length} profissional(is) pode(m) executar este serviço`
          }
        </p>
      </div>

      {/* Lista de profissionais */}
      <div className="grid grid-cols-1 gap-3">
        {profissionaisParaEscolha.map((profissional) => (
          <ProfissionalItem
            key={profissional.id}
            profissional={profissional}
            isSelected={selectedIds.includes(profissional.id)}
            onToggle={handleProfissionalToggle}
          />
        ))}
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
});

ProfissionalSelector.displayName = 'ProfissionalSelector';