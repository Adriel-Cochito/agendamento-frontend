import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Agendamento } from '@/types/agendamento';
import { dateUtils } from '../../utils/dateUtils';
import {
  gerarDiasDoMes,
  agruparAgendamentosPorData,
  formatarDataParaChave,
  formatarMesAno,
  obterCorPorStatus,
  CalendarioData
} from '@/utils/calendario';

interface CalendarioMensalProps {
  agendamentos: Agendamento[];
  onDayClick: (data: Date) => void;
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  dataAtual: Date; // NOVA PROP
  onDataAtualChange: (data: Date) => void; // NOVA PROP
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarioMensal({
  agendamentos,
  onDayClick,
  onNovoAgendamento,
  onAgendamentoClick,
  dataAtual,
  onDataAtualChange
}: CalendarioMensalProps) {
  const [diasCalendario, setDiasCalendario] = useState<CalendarioData[]>([]);

  useEffect(() => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const dias = gerarDiasDoMes(ano, mes);
    
    // Agrupar agendamentos por data
    const agendamentosPorData = agruparAgendamentosPorData(agendamentos);
    
    // Associar agendamentos aos dias
    const diasComAgendamentos = dias.map(dia => ({
      ...dia,
      agendamentos: agendamentosPorData.get(formatarDataParaChave(dia.date)) || []
    }));
    
    setDiasCalendario(diasComAgendamentos);
  }, [dataAtual, agendamentos]);

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const nova = new Date(dataAtual);
    if (direcao === 'anterior') {
      nova.setMonth(nova.getMonth() - 1);
    } else {
      nova.setMonth(nova.getMonth() + 1);
    }
    onDataAtualChange(nova);
  };

  const irParaHoje = () => {
    onDataAtualChange(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {formatarMesAno(dataAtual)}
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navegarMes('anterior')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navegarMes('proximo')}
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

      {/* Grid do Calendário */}
      <div className="p-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diasSemana.map(dia => (
            <div
              key={dia}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid dos dias */}
        <div className="grid grid-cols-7 gap-1">
          {diasCalendario.map((diaData, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] p-1 border border-gray-100 rounded cursor-pointer
                transition-colors hover:bg-gray-50
                ${!diaData.isCurrentMonth ? 'opacity-40' : ''}
                ${diaData.isToday ? 'bg-primary-50 border-primary-200' : ''}
                ${diaData.isWeekend ? 'bg-gray-25' : ''}
              `}
              onClick={() => onDayClick(diaData.date)}
            >
              {/* Número do dia */}
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium
                  ${diaData.isToday ? 'text-primary-600' : 'text-gray-900'}
                  ${!diaData.isCurrentMonth ? 'text-gray-400' : ''}
                `}>
                  {diaData.date.getDate()}
                </span>
                
                {diaData.agendamentos.length > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-600 px-1 rounded">
                    {diaData.agendamentos.length}
                  </span>
                )}
              </div>

              {/* Agendamentos do dia */}
              <div className="space-y-1">
                {diaData.agendamentos.slice(0, 3).map((agendamento, idx) => (
                  <div
                    key={agendamento.id}
                    className={`
                      text-xs p-1 rounded text-white cursor-pointer
                      ${obterCorPorStatus(agendamento.status)}
                      hover:opacity-80 transition-opacity
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAgendamentoClick(agendamento);
                    }}
                    title={`${agendamento.nomeCliente} - ${agendamento.servicoTitulo}`}
                  >
                    <div className="truncate">
                      {dateUtils.formatTimeLocal(agendamento.dataHora)} {agendamento.nomeCliente}

                    </div>
                  </div>
                ))}
                
                {diaData.agendamentos.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{diaData.agendamentos.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}