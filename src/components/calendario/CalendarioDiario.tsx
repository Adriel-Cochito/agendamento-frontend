import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Agendamento } from '@/types/agendamento';
import { obterCorPorStatus } from '@/utils/calendario';

interface CalendarioDiarioProps {
  agendamentos: Agendamento[];
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  dataAtual: Date; // NOVA PROP
  onDataAtualChange: (data: Date) => void; // NOVA PROP
}

export function CalendarioDiario({
  agendamentos,
  onNovoAgendamento,
  onAgendamentoClick,
  dataAtual,
  onDataAtualChange
}: CalendarioDiarioProps) {
  const [agendamentosDoDia, setAgendamentosDoDia] = useState<Agendamento[]>([]);

  useEffect(() => {
    // Filtrar agendamentos do dia atual
    const agendamentosFiltrados = agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora);
      return (
        dataAgendamento.getFullYear() === dataAtual.getFullYear() &&
        dataAgendamento.getMonth() === dataAtual.getMonth() &&
        dataAgendamento.getDate() === dataAtual.getDate()
      );
    });
    
    // Ordenar por horário
    agendamentosFiltrados.sort((a, b) => 
      new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    );
    
    setAgendamentosDoDia(agendamentosFiltrados);
  }, [dataAtual, agendamentos]);

  const navegarDia = (direcao: 'anterior' | 'proximo') => {
    const nova = new Date(dataAtual);
    const dias = direcao === 'anterior' ? -1 : 1;
    nova.setDate(nova.getDate() + dias);
    onDataAtualChange(nova);
  };

  const irParaHoje = () => {
    onDataAtualChange(new Date());
  };

  const formatarDataCompleta = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dataAtual);
  };

  // Gerar horários do dia (6h às 22h, intervalos de 30min)
  const horarios = [];
  for (let hora = 6; hora <= 22; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
    }
  }

  const obterAgendamentosNoHorario = (horario: string) => {
    return agendamentosDoDia.filter(agendamento => {
      const horaAgendamento = new Date(agendamento.dataHora).toTimeString().slice(0, 5);
      return horaAgendamento === horario;
    });
  };

  const criarDataHorario = (horario: string): Date => {
    console.log("horario: ", horario);
    const [hora, minuto] = horario.split(':').map(Number);
    const data = new Date(dataAtual);
    data.setHours(hora, minuto, 0, 0);
    console.log("data: ", data);
    return data;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'AGENDADO': 'Agendado',
      'CONFIRMADO': 'Confirmado',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {formatarDataCompleta()}
            </h2>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navegarDia('anterior')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navegarDia('proximo')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={irParaHoje}>
              Hoje
            </Button>
            <Button onClick={() => onNovoAgendamento(dataAtual)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Resumo do dia */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {agendamentosDoDia.length}
            </div>
            <div className="text-sm text-gray-500">Total de Agendamentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {agendamentosDoDia.filter(a => a.status === 'CONFIRMADO').length}
            </div>
            <div className="text-sm text-gray-500">Confirmados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {agendamentosDoDia.filter(a => a.status === 'AGENDADO').length}
            </div>
            <div className="text-sm text-gray-500">Agendados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {agendamentosDoDia.filter(a => a.status === 'CONCLUIDO').length}
            </div>
            <div className="text-sm text-gray-500">Concluídos</div>
          </div>
        </div>
      </div>

      {/* Timeline dos agendamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Agenda do Dia</h3>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {horarios.map(horario => {
            const agendamentosNoHorario = obterAgendamentosNoHorario(horario);
            const temAgendamentos = agendamentosNoHorario.length > 0;

            return (
              <div key={horario} className="flex">
                {/* Coluna do horário */}
                <div className="w-20 flex-shrink-0 p-4 text-center border-r border-gray-100">
                  <div className={`text-sm font-medium ${temAgendamentos ? 'text-primary-600' : 'text-gray-400'}`}>
                    {horario}
                  </div>
                </div>

                {/* Conteúdo do horário */}
                <div className="flex-1 p-4">
                  {agendamentosNoHorario.length === 0 ? (
                    <div 
                      className="h-8 flex items-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                      onClick={() => onNovoAgendamento(criarDataHorario(horario))}
                    >
                      Horário livre - Clique para agendar
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {agendamentosNoHorario.map(agendamento => (
                        <div
                          key={agendamento.id}
                          className="bg-gray-50 rounded-lg p-4 border-l-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          style={{ 
                            borderLeftColor: obterCorPorStatus(agendamento.status).includes('blue') ? '#3b82f6' :
                                            obterCorPorStatus(agendamento.status).includes('green') ? '#10b981' :
                                            obterCorPorStatus(agendamento.status).includes('yellow') ? '#f59e0b' :
                                            obterCorPorStatus(agendamento.status).includes('red') ? '#ef4444' : '#6b7280'
                          }}
                          onClick={() => onAgendamentoClick(agendamento)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-semibold text-gray-900">
                                  {agendamento.nomeCliente}
                                </span>
                                <span className={`
                                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                  ${agendamento.status === 'AGENDADO' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${agendamento.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' : ''}
                                  ${agendamento.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${agendamento.status === 'CONCLUIDO' ? 'bg-gray-100 text-gray-800' : ''}
                                  ${agendamento.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {getStatusLabel(agendamento.status)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Tag className="w-3 h-3" />
                                  <span>{agendamento.servicoTitulo}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{agendamento.profissionalNome}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>

                              {agendamento.telefoneCliente && (
                                <div className="mt-2 text-sm text-gray-500">
                                  📞 {agendamento.telefoneCliente}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Botão para adicionar mais agendamentos no mesmo horário */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        onClick={() => onNovoAgendamento(criarDataHorario(horario))}
                      >
                        <span className="text-sm text-gray-500 hover:text-primary-600">
                          + Adicionar outro agendamento
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com resumo */}
        {agendamentosDoDia.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento para este dia
            </h3>
            <p className="text-gray-500 mb-4">
              Que tal aproveitar para organizar a agenda ou criar novos agendamentos?
            </p>
            <Button onClick={() => onNovoAgendamento(dataAtual)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}