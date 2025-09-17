// src/components/calendario/CalendarioSemanal.tsx - Com navegação e semana começando no dia atual
import { useState, useMemo } from 'react';
import { format, isToday, parseISO, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Agendamento } from '@/types/agendamento';
import { dateUtils } from '@/utils/dateUtils';
import { agruparAgendamentosPorData, HorarioAgrupado } from '@/utils/calendario';

export interface CalendarioSemanalProps {
  agendamentos: Agendamento[];
  dataAtual: Date;
  onDataAtualChange: (data: Date) => void;
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  onDayClick: (data: Date) => void;
}

export function CalendarioSemanal({
  agendamentos,
  dataAtual,
  onDataAtualChange,
  onNovoAgendamento,
  onAgendamentoClick,
  onDayClick
}: CalendarioSemanalProps) {
  const [horaExpandida, setHoraExpandida] = useState<string | null>(null);

  // Dias da semana (começando no dia atual e mostrando os próximos 6 dias)
  const diasSemana = useMemo(() => {
    // Usamos o dia atual como ponto de partida
    return [0, 1, 2, 3, 4, 5, 6].map(offset => dateUtils.adicionarDias(dataAtual, offset));
  }, [dataAtual]);

  // Função para navegar entre semanas
  const navegarSemana = (direcao: 'anterior' | 'proxima') => {
    const dias = direcao === 'anterior' ? -7 : 7;
    const novaData = dateUtils.adicionarDias(dataAtual, dias);
    onDataAtualChange(novaData);
  };

  // Função para voltar para o dia atual
  const irParaHoje = () => {
    onDataAtualChange(new Date());
  };

  // Agrupar agendamentos por dia e hora
  const agendamentosPorDia = useMemo(() => {
    const resultado: Record<string, Agendamento[]> = {};
    
    // Inicializar arrays vazios para cada dia da semana
    diasSemana.forEach(dia => {
      resultado[format(dia, 'yyyy-MM-dd')] = [];
    });

    // Adicionar agendamentos
    agendamentos.forEach(agendamento => {
      if (agendamento.dataHoraInicio) { // Verifica se dataHoraInicio existe
        try {
          const dataFormatada = format(parseISO(agendamento.dataHoraInicio), 'yyyy-MM-dd');
          
          // Verificar se é um dia desta semana
          if (resultado[dataFormatada]) {
            resultado[dataFormatada].push(agendamento);
          }
        } catch (e) {
          // Silenciosamente ignora agendamentos com data inválida
        }
      }
    });

    return resultado;
  }, [agendamentos, diasSemana]);

  // Agendamentos agrupados por hora (para a visualização detalhada)
  const horariosPorDia = useMemo(() => {
    const resultado: Record<string, HorarioAgrupado[]> = {};
    
    Object.keys(agendamentosPorDia).forEach(data => {
      const agendamentosDodia = agendamentosPorDia[data];
      // Correção: Definir explicitamente o tipo para evitar o erro TS7034
      const horarios: HorarioAgrupado[] = [];

      // Criar horários agrupados
      if (agendamentosDodia.length > 0) {
        // Agrupar agendamentos por hora
        const horariosAgrupados = dateUtils.agruparPorHora(agendamentosDodia);
        
        Object.keys(horariosAgrupados).forEach(hora => {
          horarios.push({
            hora,
            agendamentos: horariosAgrupados[hora]
          });
        });
      }
      
      resultado[data] = horarios.sort((a, b) => {
        // Ordenar por hora (09:00, 10:00, etc.)
        return a.hora.localeCompare(b.hora);
      });
    });
    
    return resultado;
  }, [agendamentosPorDia]);

  const toggleHoraExpandida = (hora: string) => {
    if (hora === horaExpandida) {
      setHoraExpandida(null);
    } else {
      setHoraExpandida(hora);
    }
  };

  const renderDiaHeader = (dia: Date) => {
    const diaSemana = format(dia, 'EEEE', { locale: ptBR });
    const diaDoMes = format(dia, 'd');
    
    const ehHoje = isToday(dia);
    
    return (
      <div 
        className={`py-2 px-3 border-b ${
          ehHoje ? 'bg-primary-50 border-primary-200' : 'border-gray-200'
        }`}
      >
        <p className={`font-semibold ${ehHoje ? 'text-primary-800' : 'text-gray-800'}`}>
          {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}
        </p>
        <p className={`text-lg font-bold ${ehHoje ? 'text-primary-700' : 'text-gray-600'}`}>
          {diaDoMes}
        </p>
        <button
          onClick={() => onDayClick(dia)}
          className="mt-1 text-xs text-gray-500 hover:text-primary-500 hover:underline"
        >
          Ver detalhes
        </button>
      </div>
    );
  };

  const renderHorarios = (dia: string) => {
    // Correção: Definir explicitamente o tipo para evitar o erro TS7005
    const horarios: HorarioAgrupado[] = horariosPorDia[dia] || [];

    if (horarios.length === 0) {
      return (
        <div className="p-3 text-center text-gray-500 text-sm">
          Nenhum agendamento
        </div>
      );
    }

    return horarios.map((horario) => {
      const expanded = horaExpandida === horario.hora;
      
      return (
        <div
          key={`${dia}-${horario.hora}`}
          className={`p-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            expanded ? 'bg-gray-50' : ''
          }`}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleHoraExpandida(horario.hora)}
          >
            <div className="flex items-center text-gray-800">
              <Clock className="w-4 h-4 mr-2 text-primary-500" />
              <span className="font-medium">{horario.hora}</span>
            </div>
            <span className="text-sm text-gray-600">
              {horario.agendamentos.length} {horario.agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
            </span>
          </div>
          
          {expanded && (
            <div className="mt-2 pl-6 space-y-2">
              {horario.agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="text-sm p-2 border border-gray-200 rounded bg-white shadow-sm hover:border-primary-300 cursor-pointer"
                  onClick={() => onAgendamentoClick(agendamento)}
                >
                  <p className="font-medium text-gray-800">
                    {agendamento.cliente?.nome || "Cliente não informado"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {agendamento.servico?.titulo || "Serviço não informado"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Prof.: {agendamento.profissional?.nome || "Não informado"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Formatação para exibir o intervalo de datas da semana atual
  const periodoSemanaFormatado = useMemo(() => {
    const primeiroDia = diasSemana[0];
    const ultimoDia = diasSemana[6];
    
    const formatoPrimeiroDia = format(primeiroDia, "d 'de' MMMM", { locale: ptBR });
    const formatoUltimoDia = format(ultimoDia, "d 'de' MMMM", { locale: ptBR });
    
    return `${formatoPrimeiroDia} - ${formatoUltimoDia}`;
  }, [diasSemana]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <CalendarDays className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Agenda Semanal
          </h3>
          <span className="hidden sm:inline text-sm text-gray-500 ml-2">
            {periodoSemanaFormatado}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarSemana('anterior')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
        
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarSemana('proxima')}
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          

        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x">
        {diasSemana.map((dia) => (
          <div key={format(dia, 'yyyy-MM-dd')} className="min-h-[150px]">
            {renderDiaHeader(dia)}
            <div className="max-h-[300px] overflow-y-auto">
              {renderHorarios(format(dia, 'yyyy-MM-dd'))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}