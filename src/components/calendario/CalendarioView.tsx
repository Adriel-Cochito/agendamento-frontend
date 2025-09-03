// src/components/calendario/CalendarioView.tsx - Correção do erro de props
import { useState } from 'react';
import { Calendar, CalendarDays, Clock, Filter } from 'lucide-react';
import { Agendamento } from '@/types/agendamento';
import { CalendarioMensal } from './CalendarioMensal';
import { CalendarioSemanal } from './CalendarioSemanal';
import { CalendarioDiario } from './CalendarioDiario';
import { Profissional } from '@/types/profissional';

type TipoVisualizacao = 'mensal' | 'semanal' | 'diaria';

interface CalendarioViewProps {
  agendamentos: Agendamento[];
  profissionais?: Profissional[];
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

export function CalendarioView({
  agendamentos,
  profissionais,
  onNovoAgendamento,
  onAgendamentoClick
}: CalendarioViewProps) {
  const [dataAtual, setDataAtual] = useState<Date>(new Date());
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('mensal');
  const [profissionalFiltro, setProfissionalFiltro] = useState<number | null>(null);

  // Filtrar agendamentos pelo profissional selecionado
  const agendamentosFiltrados = useMemo(() => {
    if (!profissionalFiltro) return agendamentos;
    
    return agendamentos.filter(agendamento => {
      // Verificar tanto profissionalId quanto profissional.id
      const profId = agendamento.profissionalId || agendamento.profissional?.id;
      return profId === profissionalFiltro;
    });
  }, [agendamentos, profissionalFiltro]);

  const handleDayClick = (data: Date) => {
    // Atualizar a data atual para a data clicada
    setDataAtual(data);
    // Mudar para visualização diária
    setTipoVisualizacao('diaria');
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
                value={profissionalFiltro || 'TODOS'}
                onChange={(e) => setProfissionalFiltro(
                  e.target.value === 'TODOS' ? null : parseInt(e.target.value)
                )}
                className="w-full sm:w-48 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="TODOS">Todos os profissionais</option>
                {profissionais?.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Visualização */}
            <div className="flex border border-gray-200 rounded-md shadow-sm divide-x">
              {visualizacoes.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.tipo}
                    onClick={() => setTipoVisualizacao(view.tipo)}
                    className={`px-3 py-2 flex items-center space-x-1 text-sm ${
                      tipoVisualizacao === view.tipo 
                        ? 'bg-primary-50 text-primary-600 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title={view.descricao}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Visualizações do Calendário */}
      {tipoVisualizacao === 'mensal' && (
        <CalendarioMensal 
          agendamentos={agendamentosFiltrados}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
          onDayClick={handleDayClick}
          onNovoAgendamento={handleNovoAgendamentoComFiltro}
        />
      )}
      {tipoVisualizacao === 'semanal' && (
        <CalendarioSemanal 
          agendamentos={agendamentosFiltrados}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
          onDayClick={handleDayClick}
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
        />
      )}
    </div>
  );
}

// Importação necessária para resolver o erro
import { useMemo } from 'react';