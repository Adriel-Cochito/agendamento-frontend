// src/pages/Agendamentos.tsx - Versão atualizada
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  
  // Ler parâmetros da URL para definir visualização inicial
  const viewFromUrl = searchParams.get('view');
  const tipoFromUrl = searchParams.get('tipo');
  
  // Definir visualização inicial baseada na URL
  const getInitialVisualizacao = (): TipoVisualizacao => {
    if (viewFromUrl === 'calendario') return 'calendario';
    if (viewFromUrl === 'lista') return 'lista';
    return 'calendario'; // padrão
  };

  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>(getInitialVisualizacao);
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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie os agendamentos da sua empresa</p>
          </div>
        </div>

        {/* Seletor de Visualização */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 px-2">
                Visualização:
              </span>
              
              <button
                onClick={() => setTipoVisualizacao('calendario')}
                className={`
                  flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[100px] sm:min-w-[120px] justify-center
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
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="font-semibold text-xs sm:text-sm">Calendário</span>
              </button>
              
              <button
                onClick={() => setTipoVisualizacao('lista')}
                className={`
                  flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[100px] sm:min-w-[120px] justify-center
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
                <List className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="font-semibold text-xs sm:text-sm">Lista</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação - Nova linha em mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:ml-auto">
            {/* Botão de Compartilhar Link */}
            <div className="flex-shrink-0">
              <CompartilharLink />
            </div>

            <Button 
              onClick={() => handleNovoAgendamento()} 
              className="w-full sm:w-auto shadow-lg"
              aria-label="Criar novo agendamento"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Novo Agendamento</span>
            </Button>
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
            initialViewType={tipoFromUrl === 'diaria' ? 'diaria' : undefined}
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