import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Agendamento } from '@/types/agendamento';
import {
  gerarDiasDaSemana,
  agruparAgendamentosPorData,
  formatarDataParaChave,
  formatarDiaSemana,
  formatarDiaMes,
  obterCorPorStatus,
  CalendarioData
} from '@/utils/calendario';

interface CalendarioSemanalProps {
  agendamentos: Agendamento[];
  onDayClick: (data: Date) => void;
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  dataAtual: Date; // NOVA PROP
  onDataAtualChange: (data: Date) => void; // NOVA PROP
}

export function CalendarioSemanal({
  agendamentos,
  onDayClick,
  onNovoAgendamento,
  onAgendamentoClick,
  dataAtual,
  onDataAtualChange
}: CalendarioSemanalProps) {
  const [diasSemana, setDiasSemana] = useState<CalendarioData[]>([]);

  useEffect(() => {
    const dias = gerarDiasDaSemana(dataAtual);
    
    // Agrupar agendamentos por data
    const agendamentosPorData = agruparAgendamentosPorData(agendamentos);
    
    // Associar agendamentos aos dias
    const diasComAgendamentos = dias.map(dia => ({
      ...dia,
      agendamentos: agendamentosPorData.get(formatarDataParaChave(dia.date)) || []
    }));
    
    setDiasSemana(diasComAgendamentos);
  }, [dataAtual, agendamentos]);

  const navegarSemana = (direcao: 'anterior' | 'proximo') => {
    const nova = new Date(dataAtual);
    const dias = direcao === 'anterior' ? -7 : 7;
    nova.setDate(nova.getDate() + dias);
    onDataAtualChange(nova);
  };

  const irParaHoje = () => {
    onDataAtualChange(new Date());
  };

  const formatarPeriodoSemana = () => {
    if (diasSemana.length === 0) return '';
    
    const primeiro = diasSemana[0].date;
    const ultimo = diasSemana[6].date;
    
    if (primeiro.getMonth() === ultimo.getMonth()) {
      return `${primeiro.getDate()} - ${ultimo.getDate()} de ${new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).format(primeiro)}`;
    } else {
      return `${formatarDiaMes(primeiro)} - ${formatarDiaMes(ultimo)}`;
    }
  };

  // Gerar horários do dia (6h às 22h, intervalos de 30min)
  const horarios = [];
  for (let hora = 6; hora <= 22; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
    }
  }

  const obterAgendamentosNoHorario = (dia: CalendarioData, horario: string) => {
    return dia.agendamentos.filter(agendamento => {
      const horaAgendamento = new Date(agendamento.dataHora).toTimeString().slice(0, 5);
      return horaAgendamento === horario;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {formatarPeriodoSemana()}
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navegarSemana('anterior')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navegarSemana('proximo')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={irParaHoje}>
            Hoje
          </Button>
          <Button onClick={() => onNovoAgendamento()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Grid Semanal */}
      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8 gap-0 min-w-[800px]">
          {/* Coluna de horários */}
          <div className="border-r border-gray-200">
            <div className="h-16 border-b border-gray-200"></div>
            {horarios.map(horario => (
              <div
                key={horario}
                className="h-12 border-b border-gray-100 flex items-center justify-center text-xs text-gray-500"
              >
                {horario}
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {diasSemana.map((dia, diaIndex) => (
            <div key={diaIndex} className="border-r border-gray-200 last:border-r-0">
              {/* Header do dia */}
              <div
                className={`
                  h-16 border-b border-gray-200 flex flex-col items-center justify-center cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${dia.isToday ? 'bg-primary-50' : ''}
                  ${dia.isWeekend ? 'bg-gray-25' : ''}
                `}
                onClick={() => onDayClick(dia.date)}
              >
                <div className={`text-sm font-medium ${dia.isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                  {formatarDiaSemana(dia.date)}
                </div>
                <div className={`text-lg font-bold ${dia.isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                  {dia.date.getDate()}
                </div>
              </div>

              {/* Slots de horário */}
              {horarios.map(horario => {
                const agendamentosNoHorario = obterAgendamentosNoHorario(dia, horario);
                
                return (
                  <div
                    key={horario}
                    className="h-12 border-b border-gray-100 relative hover:bg-gray-25 transition-colors"
                  >
                    {agendamentosNoHorario.map((agendamento, idx) => (
                      <div
                        key={agendamento.id}
                        className={`
                          absolute inset-x-1 top-1 bottom-1 text-xs text-white rounded p-1 cursor-pointer
                          ${obterCorPorStatus(agendamento.status)}
                          hover:opacity-80 transition-opacity z-10
                        `}
                        style={{ 
                          left: `${idx * 2 + 4}px`,
                          right: `${(agendamentosNoHorario.length - idx - 1) * 2 + 4}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAgendamentoClick(agendamento);
                        }}
                        title={`${agendamento.nomeCliente} - ${agendamento.servicoTitulo} - ${agendamento.profissionalNome}`}
                      >
                        <div className="truncate font-medium">
                          {agendamento.nomeCliente}
                        </div>
                        <div className="truncate text-xs opacity-90">
                          {agendamento.servicoTitulo}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}