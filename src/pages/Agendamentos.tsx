import { useState } from 'react';
import { Plus, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarioView } from '@/components/calendario/CalendarioView';
import { AgendamentosLista } from '@/components/agendamento/AgendamentosLista';
import { AgendamentosModals } from '@/components/agendamento/AgendamentosModals';
import { useAuthStore } from '@/store/authStore';
import { useAgendamentosLogic } from '@/hooks/useAgendamentosLogic';

type TipoVisualizacao = 'lista' | 'calendario';

export function Agendamentos() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('lista');
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

        <div className="flex items-center space-x-2">
          {/* Seletor de Visualização */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={tipoVisualizacao === 'lista' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisualizacao('lista')}
              className={`transition-all duration-200 ${
                tipoVisualizacao === 'lista'
                  ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={tipoVisualizacao === 'calendario' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisualizacao('calendario')}
              className={`transition-all duration-200 ${
                tipoVisualizacao === 'calendario'
                  ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendário
            </Button>
          </div>

          <Button onClick={() => handleNovoAgendamento()} className="sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Renderizar visualização selecionada */}
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

      {/* Modals */}
      <AgendamentosModals
        modalStates={modalStates}
        modalHandlers={modalHandlers}
        empresaId={empresaId}
      />
    </div>
  );
}