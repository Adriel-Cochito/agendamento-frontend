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
  const [dataAtual, setDataAtual] = useState(new Date());

  const handleDayClick = (data: Date) => {
    // Atualizar a data atual para a data clicada
    setDataAtual(data);
    // Mudar para visualização diária
    setTipoVisualizacao('diaria');
    // Chamar callback opcional
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
                  transition-all duration-200
                  ${tipoVisualizacao === tipo 
                    ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700' 
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'
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
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}

      {tipoVisualizacao === 'semanal' && (
        <CalendarioSemanal
          agendamentos={agendamentos}
          onDayClick={handleDayClick}
          onNovoAgendamento={onNovoAgendamento}
          onAgendamentoClick={onAgendamentoClick}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}

      {tipoVisualizacao === 'diaria' && (
        <CalendarioDiario
          agendamentos={agendamentos}
          onNovoAgendamento={onNovoAgendamento}
          onAgendamentoClick={onAgendamentoClick}
          dataAtual={dataAtual}
          onDataAtualChange={setDataAtual}
        />
      )}
    </div>
  );
}