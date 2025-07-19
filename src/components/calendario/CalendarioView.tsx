import { useState, useEffect } from 'react';
import { Calendar, CalendarDays, Clock, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarioMensal } from './CalendarioMensal';
import { CalendarioSemanal } from './CalendarioSemanal';
import { CalendarioDiario } from './CalendarioDiario';
import { Agendamento } from '@/types/agendamento';
import { TipoVisualizacao } from '@/utils/calendario';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useAuthStore } from '@/store/authStore';

interface CalendarioViewProps {
  agendamentos: Agendamento[];
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  onDayClick?: (data: Date) => void;
}

export function CalendarioView({
  agendamentos,
  onNovoAgendamento,
  onAgendamentoClick,
  onDayClick
}: CalendarioViewProps) {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('mensal');
  const [dataAtual, setDataAtual] = useState(new Date());
  const [profissionalFiltro, setProfissionalFiltro] = useState<number | 'TODOS'>('TODOS');

  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  const { data: profissionais } = useProfissionais(empresaId);

  // Filtrar agendamentos por profissional se necessário
  const agendamentosFiltrados = profissionalFiltro === 'TODOS' 
    ? agendamentos 
    : agendamentos.filter(agendamento => {
        // Verificar tanto profissionalId quanto profissional.id
        const profId = agendamento.profissionalId || agendamento.profissional?.id;
        return profId === profissionalFiltro;
      });

  const handleDayClick = (data: Date) => {
    // Atualizar a data atual para a data clicada
    setDataAtual(data);
    // Mudar para visualização diária
    setTipoVisualizacao('diaria');
    // Chamar callback opcional
    onDayClick?.(data);
  };

  const handleNovoAgendamentoComFiltro = (data?: Date) => {
    // Se há um profissional específico selecionado, poderia pré-selecionar
    // Mas isso seria implementado no componente pai
    onNovoAgendamento(data);
  };

  const visualizacoes = [
    {
      tipo: 'mensal' as TipoVisualizacao,
      label: 'Mês',
      icon: Calendar,
      descricao: 'Visualização mensal'
    },
    {
      tipo: 'semanal' as TipoVisualizacao,
      label: 'Semana',
      icon: CalendarDays,
      descricao: 'Visualização semanal'
    },
    {
      tipo: 'diaria' as TipoVisualizacao,
      label: 'Dia',
      icon: Clock,
      descricao: 'Visualização diária'
    }
  ];

  const profissionalSelecionado = profissionais?.find(p => p.id === profissionalFiltro);

  return (
    <div className="space-y-6">
      {/* Controles de Visualização e Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Calendário de Agendamentos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {visualizacoes.find(v => v.tipo === tipoVisualizacao)?.descricao}
              {profissionalSelecionado && (
                <span className="ml-2 text-primary-600">
                  • Filtrado por: {profissionalSelecionado.nome}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro por Profissional */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={profissionalFiltro}
                onChange={(e) => setProfissionalFiltro(
                  e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value)
                )}
                className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value="TODOS">Todos os profissionais</option>
                {profissionais?.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Visualização */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {visualizacoes.map(({ tipo, label, icon: Icon }) => (
                <Button
                  key={tipo}
                  variant={tipoVisualizacao === tipo ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTipoVisualizacao(tipo)}
                  className={`transition-all duration-200 ${
                    tipoVisualizacao === tipo 
                      ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700' 
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas rápidas quando há filtro */}
        {profissionalFiltro !== 'TODOS' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>
                  {agendamentosFiltrados.filter(a => a.status === 'CONFIRMADO').length} Confirmados
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>
                  {agendamentosFiltrados.filter(a => a.status === 'REALIZADO').length} Realizados
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>
                  {agendamentosFiltrados.filter(a => a.status === 'CANCELADO').length} Cancelados
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Renderizar visualização selecionada */}
      {tipoVisualizacao === 'mensal' && (
        <CalendarioMensal
          agendamentos={agendamentosFiltrados}
          onDayClick={handleDayClick}
          onNovoAgendamento={handleNovoAgendamentoComFiltro}
          onAgendamentoClick={onAgendamentoClick}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}

      {tipoVisualizacao === 'semanal' && (
        <CalendarioSemanal
          agendamentos={agendamentosFiltrados}
          onDayClick={handleDayClick}
          onNovoAgendamento={handleNovoAgendamentoComFiltro}
          onAgendamentoClick={onAgendamentoClick}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}

      {tipoVisualizacao === 'diaria' && (
        <CalendarioDiario
          agendamentos={agendamentosFiltrados}
          onNovoAgendamento={handleNovoAgendamentoComFiltro}
          onAgendamentoClick={onAgendamentoClick}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}
    </div>
  );
}