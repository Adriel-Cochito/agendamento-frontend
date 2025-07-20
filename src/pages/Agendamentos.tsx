// src/pages/Agendamentos.tsx - Versão atualizada
import { useState } from 'react';
import { Plus, List, CalendarDays, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarioView } from '@/components/calendario/CalendarioView';
import { AgendamentosLista } from '@/components/agendamento/AgendamentosLista';
import { AgendamentosModals } from '@/components/agendamento/AgendamentosModals';
import { CompartilharLink } from '@/components/agendamento/CompartilharLink';
import { useAuthStore } from '@/store/authStore';
import { useAgendamentosLogic } from '@/hooks/useAgendamentosLogic';

type TipoVisualizacao = 'lista' | 'calendario';

export function Agendamentos() {
  // Alterado: Calendário como visualização padrão
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('calendario');
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;

  const {
    // Estados e dados
    agendamentos,
    isLoading,
    
    // Estados dos modais
    modalStates,
    
    // Handlers principais
    handleNovoAgendamento,
    handleEdit,
    handleDelete,
    
    // Handlers dos modais
    modalHandlers,
    
    // Estados dos filtros (para lista)
    filtros,
    agendamentosFiltrados,
    handleFiltrosChange,
  } = useAgendamentosLogic(empresaId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os agendamentos da sua empresa</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Seletor de Visualização Melhorado para Acessibilidade */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 px-2">
                Visualização:
              </span>
              
              <button
                onClick={() => setTipoVisualizacao('calendario')}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[120px] justify-center
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  ${tipoVisualizacao === 'calendario'
                    ? 'bg-primary-600 text-white shadow-md transform scale-105 border-2 border-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-2 border-transparent'
                  }
                `}
                aria-pressed={tipoVisualizacao === 'calendario'}
                aria-label={`Visualizar em formato de calendário ${tipoVisualizacao === 'calendario' ? '(selecionado)' : ''}`}
                title="Visualizar agendamentos em formato de calendário"
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                <span className="font-semibold">Calendário</span>
              </button>
              
              <button
                onClick={() => setTipoVisualizacao('lista')}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[120px] justify-center
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  ${tipoVisualizacao === 'lista'
                    ? 'bg-primary-600 text-white shadow-md transform scale-105 border-2 border-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-2 border-transparent'
                  }
                `}
                aria-pressed={tipoVisualizacao === 'lista'}
                aria-label={`Visualizar em formato de lista ${tipoVisualizacao === 'lista' ? '(selecionado)' : ''}`}
                title="Visualizar agendamentos em formato de lista"
              >
                <List className="w-5 h-5 mr-2" />
                <span className="font-semibold">Lista</span>
              </button>
            </div>
          </div>

          {/* Botão de Compartilhar Link */}
          <CompartilharLink />

          <Button 
            onClick={() => handleNovoAgendamento()} 
            className="sm:w-auto shadow-lg"
            aria-label="Criar novo agendamento"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Indicador Visual da Visualização Ativa */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tipoVisualizacao === 'calendario' ? (
              <>
                <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  Visualização em Calendário Ativa
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Navegue entre mês, semana e dia
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  Visualização em Lista Ativa
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Use os filtros para encontrar agendamentos
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400">
              {agendamentos?.length || 0} agendamento(s) total
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Share2 className="w-3 h-3" />
              <span>Link público disponível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar visualização selecionada */}
      <div role="main" aria-label={`Agendamentos em formato de ${tipoVisualizacao}`}>
        {tipoVisualizacao === 'calendario' ? (
          <CalendarioView
            agendamentos={agendamentos || []}
            onNovoAgendamento={handleNovoAgendamento}
            onAgendamentoClick={handleEdit}
            onDayClick={(data) => {
              console.log('Dia clicado:', data);
            }}
          />
        ) : (
          <AgendamentosLista
            agendamentosFiltrados={agendamentosFiltrados}
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            onNovoAgendamento={handleNovoAgendamento}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <AgendamentosModals
        modalStates={modalStates}
        modalHandlers={modalHandlers}
        empresaId={empresaId}
      />
    </div>
  );
}