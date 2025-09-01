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
  initialViewType?: 'diaria' | 'semanal' | 'mensal'; // Nova prop
}

export function CalendarioView({
  agendamentos,
  onNovoAgendamento,
  onAgendamentoClick,
  onDayClick,
  initialViewType
}: CalendarioViewProps) {
  // Usar visualização inicial se fornecida, senão usar padrão
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>(
    initialViewType || 'mensal'
  );
  const [dataAtual, setDataAtual] = useState(new Date());
  const [profissionalFiltro, setProfissionalFiltro] = useState<number | 'TODOS'>('TODOS');

  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  const { data: profissionais } = useProfissionais(empresaId);

  // Efeito para definir visualização inicial quando a prop mudar
  useEffect(() => {
    if (initialViewType) {
      setTipoVisualizacao(initialViewType);
    }
  }, [initialViewType]);

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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="TODOS">Todos os profissionais</option>
                {profissionais?.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de Visualização */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {visualizacoes.map((vis) => {
                const Icon = vis.icon;
                return (
                  <button
                    key={vis.tipo}
                    onClick={() => setTipoVisualizacao(vis.tipo)}
                    className={`
                      flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${tipoVisualizacao === vis.tipo
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                    title={vis.descricao}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{vis.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar calendário baseado no tipo selecionado */}
      <div>
        {tipoVisualizacao === 'mensal' && (
          <CalendarioMensal
            agendamentos={agendamentosFiltrados}
            dataAtual={dataAtual}
            onDataAtualChange={setDataAtual}
            onNovoAgendamento={handleNovoAgendamentoComFiltro}
            onAgendamentoClick={onAgendamentoClick}
            onDayClick={handleDayClick}
          />
        )}

        {tipoVisualizacao === 'semanal' && (
          <CalendarioSemanal
            agendamentos={agendamentosFiltrados}
            dataAtual={dataAtual}
            onDataAtualChange={setDataAtual}
            onNovoAgendamento={handleNovoAgendamentoComFiltro}
            onAgendamentoClick={onAgendamentoClick}
          />
        )}

        {tipoVisualizacao === 'diaria' && (
          <CalendarioDiario
            agendamentos={agendamentosFiltrados}
            dataAtual={dataAtual}
            onDataAtualChange={setDataAtual}
            onNovoAgendamento={handleNovoAgendamentoComFiltro}
            onAgendamentoClick={onAgendamentoClick}
            profissionalFiltro={profissionalFiltro}
          />
        )}
      </div>
    </div>
  );
}