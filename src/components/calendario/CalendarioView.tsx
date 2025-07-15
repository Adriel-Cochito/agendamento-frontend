import { useState } from 'react';
import { Calendar, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarioMensal } from './CalendarioMensal';
import { CalendarioSemanal } from './CalendarioSemanal';
import { CalendarioDiario } from './CalendarioDiario';
import { Agendamento } from '@/types/agendamento';
import { TipoVisualizacao } from '@/utils/calendario';

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

  const handleDayClick = (data: Date) => {
    // Se clicar em um dia na visualização mensal ou semanal, mudar para visualização diária
    if (tipoVisualizacao !== 'diaria') {
      setTipoVisualizacao('diaria');
    }
    onDayClick?.(data);
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

  return (
    <div className="space-y-6">
      {/* Seletor de Visualização */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendário de Agendamentos
          </h2>
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {visualizacoes.map(({ tipo, label, icon: Icon }) => (
              <Button
                key={tipo}
                variant={tipoVisualizacao === tipo ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTipoVisualizacao(tipo)}
                className={`
                  ${tipoVisualizacao === tipo 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Descrição da visualização atual */}
        <p className="text-sm text-gray-500 mt-2">
          {visualizacoes.find(v => v.tipo === tipoVisualizacao)?.descricao}
        </p>
      </div>

      {/* Renderizar visualização selecionada */}
      {tipoVisualizacao === 'mensal' && (
        <CalendarioMensal
          agendamentos={agendamentos}
          onDayClick={handleDayClick}
          onNovoAgendamento={onNovoAgendamento}
          onAgendamentoClick={onAgendamentoClick}
        />
      )}

      {tipoVisualizacao === 'semanal' && (
        <CalendarioSemanal
          agendamentos={agendamentos}
          onDayClick={handleDayClick}
          onNovoAgendamento={onNovoAgendamento}
          onAgendamentoClick={onAgendamentoClick}
        />
      )}

      {tipoVisualizacao === 'diaria' && (
        <CalendarioDiario
          agendamentos={agendamentos}
          onNovoAgendamento={onNovoAgendamento}
          onAgendamentoClick={onAgendamentoClick}
        />
      )}
    </div>
  );
}