import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Agendamento } from '@/types/agendamento';
import { obterCorPorStatus } from '@/utils/calendario';
import { dateUtils } from '../../utils/dateUtils';
import { useDisponibilidades } from '@/hooks/useDisponibilidades';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useAuthStore } from '@/store/authStore';
import { calcularRangeHorarioGeral } from '@/utils/horariosDisponiveis';

interface CalendarioDiarioProps {
  agendamentos: Agendamento[];
  onNovoAgendamento: (data?: Date) => void;
  onAgendamentoClick: (agendamento: Agendamento) => void;
  dataAtual: Date;
  onDataAtualChange: (data: Date) => void;
  profissionalFiltro?: number | 'TODOS';
}

export function CalendarioDiario({
  agendamentos,
  onNovoAgendamento,
  onAgendamentoClick,
  dataAtual,
  onDataAtualChange,
  profissionalFiltro = 'TODOS',
}: CalendarioDiarioProps) {
  const [agendamentosDoDia, setAgendamentosDoDia] = useState<Agendamento[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [diaTemProfissionaisDisponiveis, setDiaTemProfissionaisDisponiveis] = useState<boolean>(true);

  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;

  // Buscar disponibilidades e profissionais
  const { data: disponibilidades } = useDisponibilidades({ empresaId });
  const { data: profissionais } = useProfissionais(empresaId);

  const verificarSeDiaTemProfissionaisComGrade = (data: Date): boolean => {
    if (!disponibilidades || !profissionais) return false;

    const diaSemana = data.getDay();
    
    console.log('🗓️ Verificando se o dia da semana', diaSemana, 'tem profissionais com grade');

    // Filtrar profissionais se necessário
    let profissionaisFiltrados = profissionais;
    if (profissionalFiltro !== 'TODOS') {
      profissionaisFiltrados = profissionais.filter(p => p.id === profissionalFiltro);
    }

    const temProfissionaisComGrade = profissionaisFiltrados.some(prof => {
      const disponibilidadesDoProfissional = disponibilidades.filter(d => 
        d.profissional.id === prof.id && d.tipo === 'GRADE'
      );
      
      const temGradeParaEsteDia = disponibilidadesDoProfissional.some(disp => {
        // Verificar se a grade é válida e tem dias da semana configurados
        if (disp.gradeValida && disp.diasSemana && disp.diasSemana.length > 0) {
          const incluiEsteDia = disp.diasSemana.includes(diaSemana);
          console.log(`👤 ${prof.nome} - Grade ID ${disp.id}:`, {
            diasSemana: disp.diasSemana,
            diaBuscado: diaSemana,
            incluiEsteDia,
            gradeValida: disp.gradeValida
          });
          return incluiEsteDia;
        }
        return false;
      });

      if (temGradeParaEsteDia) {
        console.log(`✅ ${prof.nome} está disponível no dia da semana ${diaSemana}`);
      } else {
        console.log(`❌ ${prof.nome} NÃO está disponível no dia da semana ${diaSemana}`);
      }

      return temGradeParaEsteDia;
    });

    console.log(`📊 Dia da semana ${diaSemana}: ${temProfissionaisComGrade ? 'TEM' : 'NÃO TEM'} profissionais com grade`);
    
    return temProfissionaisComGrade;
  };

  useEffect(() => {
    // Verificar se o dia atual tem profissionais com grade
    const temProfissionais = verificarSeDiaTemProfissionaisComGrade(dataAtual);
    setDiaTemProfissionaisDisponiveis(temProfissionais);

    // Filtrar agendamentos do dia atual
    const dataAtualString = dateUtils.toDateString(dataAtual);
    
    const agendamentosFiltrados = agendamentos.filter((agendamento) => {
      const dataAgendamentoString = dateUtils.extractDateString(agendamento.dataHora);
      return dataAgendamentoString === dataAtualString;
    });

    // Ordenar por horário
    agendamentosFiltrados.sort((a, b) => a.dataHora.localeCompare(b.dataHora));

    setAgendamentosDoDia(agendamentosFiltrados);
  }, [dataAtual, agendamentos, disponibilidades, profissionais, profissionalFiltro]);

  useEffect(() => {
    if (!disponibilidades || !profissionais) return;

    // Se o dia não tem profissionais com grade, não calcular horários
    if (!diaTemProfissionaisDisponiveis) {
      setHorariosDisponiveis([]);
      return;
    }

    console.log('📊 CalendarioDiario: Recalculando horários', {
      data: dateUtils.toDateString(dataAtual),
      profissionalFiltro,
      totalProfissionais: profissionais.length,
      totalDisponibilidades: disponibilidades.length,
      diaTemProfissionais: diaTemProfissionaisDisponiveis
    });

    // Filtrar profissionais se necessário
    let profissionaisFiltrados = profissionais;
    if (profissionalFiltro !== 'TODOS') {
      profissionaisFiltrados = profissionais.filter(p => p.id === profissionalFiltro);
      console.log(`🔍 Filtrado para profissional ${profissionalFiltro}:`, profissionaisFiltrados.map(p => p.nome));
    } else {
      console.log('👥 Usando TODOS os profissionais:', profissionais.map(p => p.nome));
    }

    // Calcular range de horários baseado nas disponibilidades
    const dataString = dateUtils.toDateString(dataAtual);
    const todosProfissionaisComDisp = profissionaisFiltrados.map(prof => {
      const disponibilidadesDoProfissional = disponibilidades.filter(d => d.profissional.id === prof.id);
      console.log(`👤 ${prof.nome}: ${disponibilidadesDoProfissional.length} disponibilidades`);
      return {
        profissional: prof,
        disponibilidades: disponibilidadesDoProfissional
      };
    });

    const rangeHorarios = calcularRangeHorarioGeral(todosProfissionaisComDisp, dataString);

    if (rangeHorarios) {
      console.log('✅ Range calculado:', rangeHorarios);
      // Gerar horários baseados no range das disponibilidades
      const horarios = gerarHorariosDinamicos(rangeHorarios.horaMinima, rangeHorarios.horaMaxima);
      setHorariosDisponiveis(horarios);
    } else {
      console.log('⚠️ Nenhum range encontrado, usando horários padrão');
      // Fallback para horários padrão se não houver disponibilidades
      setHorariosDisponiveis(gerarHorariosPadrao());
    }
  }, [dataAtual, disponibilidades, profissionais, profissionalFiltro, diaTemProfissionaisDisponiveis]);

  const gerarHorariosDinamicos = (horaInicio: string, horaFim: string): string[] => {
    const horarios: string[] = [];
    
    // Parse das horas de início e fim
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [fimHora, fimMin] = horaFim.split(':').map(Number);
    
    // Converter para minutos
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const fimMinutos = fimHora * 60 + fimMin;
    
    // Gerar horários de 30 em 30 minutos
    for (let minutos = inicioMinutos; minutos <= fimMinutos; minutos += 30) {
      const hora = Math.floor(minutos / 60);
      const min = minutos % 60;
      const horarioStr = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      horarios.push(horarioStr);
    }
    
    return horarios;
  };

  const gerarHorariosPadrao = (): string[] => {
    const horarios: string[] = [];
    
    // Horários padrão (9h às 18h) caso não haja disponibilidades
    for (let hora = 9; hora <= 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        horarios.push(
          `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
        );
      }
    }
    
    return horarios;
  };

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
      year: 'numeric',
    }).format(dataAtual);
  };

  const obterAgendamentosNoHorario = (horario: string) => {
    return agendamentosDoDia.filter((agendamento) => {
      const horaAgendamento = dateUtils.formatTimeLocal(agendamento.dataHora);
      return horaAgendamento === horario;
    });
  };

  const criarDataHorario = (horario: string): Date => {
    const dataLocal = dateUtils.createFromTimeString(dataAtual, horario);
    return dataLocal;
  };

  const validarProfissionaisDisponiveis = (horarioSelecionado: string): any[] => {
    if (!disponibilidades || !profissionais) return [];

    const dataString = dateUtils.toDateString(dataAtual);
    const diaSemana = dataAtual.getDay();
    const [hora, minuto] = horarioSelecionado.split(':').map(Number);
    const horarioEmMinutos = hora * 60 + minuto;

    console.log(`🔍 Validando profissionais para horário ${horarioSelecionado} (${horarioEmMinutos} min)`);

    const profissionaisValidos = profissionais.filter(prof => {
      // Filtrar por profissional se necessário
      if (profissionalFiltro !== 'TODOS' && prof.id !== profissionalFiltro) {
        return false;
      }

      const disponibilidadesDoProfissional = disponibilidades.filter(d => d.profissional.id === prof.id);
      
      console.log(`👤 Verificando ${prof.nome}:`, disponibilidadesDoProfissional.length, 'disponibilidades');

      // Verificar se o profissional tem disponibilidade neste horário
      const temDisponibilidade = disponibilidadesDoProfissional.some(disp => {
        if (disp.tipo === 'GRADE' && disp.gradeValida && disp.diasSemana && disp.diasSemana.includes(diaSemana)) {
          if (disp.horaInicio && disp.horaFim) {
            const [inicioHora, inicioMin] = disp.horaInicio.split(':').map(Number);
            const [fimHora, fimMin] = disp.horaFim.split(':').map(Number);
            const inicioEmMinutos = inicioHora * 60 + inicioMin;
            const fimEmMinutos = fimHora * 60 + fimMin;
            
            const disponivel = horarioEmMinutos >= inicioEmMinutos && horarioEmMinutos < fimEmMinutos;
            
            console.log(`  📅 GRADE ${prof.nome}: ${disp.horaInicio}-${disp.horaFim} = ${disponivel ? '✅' : '❌'}`);
            
            return disponivel;
          }
        } else if (disp.tipo === 'LIBERADO' && disp.dataHoraInicio && disp.dataHoraFim) {
          if (dateUtils.extractDateString(disp.dataHoraInicio) === dataString) {
            const inicio = dateUtils.fromISOString(disp.dataHoraInicio);
            const fim = dateUtils.fromISOString(disp.dataHoraFim);
            const horarioCompleto = new Date(`${dataString}T${horarioSelecionado}:00`);
            
            const disponivel = horarioCompleto >= inicio && horarioCompleto < fim;
            
            console.log(`  🔓 LIBERADO ${prof.nome}: ${inicio.toTimeString().slice(0,5)}-${fim.toTimeString().slice(0,5)} = ${disponivel ? '✅' : '❌'}`);
            
            return disponivel;
          }
        }
        return false;
      });

      // Verificar se NÃO há bloqueio neste horário
      const temBloqueio = disponibilidadesDoProfissional.some(disp => {
        if (disp.tipo === 'BLOQUEIO' && disp.dataHoraInicio && disp.dataHoraFim) {
          if (dateUtils.extractDateString(disp.dataHoraInicio) === dataString) {
            const inicio = dateUtils.fromISOString(disp.dataHoraInicio);
            const fim = dateUtils.fromISOString(disp.dataHoraFim);
            const horarioCompleto = new Date(`${dataString}T${horarioSelecionado}:00`);
            
            const bloqueado = horarioCompleto >= inicio && horarioCompleto < fim;
            
            if (bloqueado) {
              console.log(`  🚫 BLOQUEIO ${prof.nome}: ${inicio.toTimeString().slice(0,5)}-${fim.toTimeString().slice(0,5)} = BLOQUEADO`);
            }
            
            return bloqueado;
          }
        }
        return false;
      });

      const finalDisponivel = temDisponibilidade && !temBloqueio;
      console.log(`  ✨ ${prof.nome} final: ${finalDisponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`);
      
      return finalDisponivel;
    });

    return profissionaisValidos;
  };

  const criarDataHorarioComFiltro = (horario: string): Date => {
    const dataLocal = dateUtils.createFromTimeString(dataAtual, horario);
    
    // Validar quais profissionais estão disponíveis neste horário específico
    const profissionaisDisponiveisNoHorario = validarProfissionaisDisponiveis(horario);
    
    console.log(`🕐 Horário ${horario} selecionado:`, {
      totalProfissionais: profissionais?.length || 0,
      profissionaisDisponiveis: profissionaisDisponiveisNoHorario.length,
      profissionaisNomes: profissionaisDisponiveisNoHorario.map(p => p.nome)
    });
    
    // Armazenar os profissionais disponíveis no horário para filtrar no modal
    // MAS SEM PRÉ-SELECIONÁ-LOS
    (dataLocal as any).profissionaisDisponiveisParaFiltro = profissionaisDisponiveisNoHorario;
    
    return dataLocal;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      AGENDADO: 'Agendado',
      CONFIRMADO: 'Confirmado',
      REALIZADO: 'Realizado',
      CANCELADO: 'Cancelado',
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
              <Button variant="ghost" size="sm" onClick={() => navegarDia('anterior')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navegarDia('proximo')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={irParaHoje}>
              Hoje
            </Button>
            {diaTemProfissionaisDisponiveis && (
              <Button onClick={() => onNovoAgendamento(dataAtual)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            )}
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
              {agendamentosDoDia.filter((a) => a.status === 'CONFIRMADO').length}
            </div>
            <div className="text-sm text-gray-500">Confirmados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {agendamentosDoDia.filter((a) => a.status === 'AGENDADO').length}
            </div>
            <div className="text-sm text-gray-500">Agendados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {agendamentosDoDia.filter((a) => a.status === 'REALIZADO').length}
            </div>
            <div className="text-sm text-gray-500">Realizados</div>
          </div>
        </div>

        {/* Info sobre horários */}
        {diaTemProfissionaisDisponiveis ? (
          horariosDisponiveis.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Horários baseados nas disponibilidades dos profissionais: 
                <span className="font-medium ml-1">
                  {horariosDisponiveis[0]} às {horariosDisponiveis[horariosDisponiveis.length - 1]}
                </span>
              </p>
            </div>
          )
        ) : (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Dia sem atendimento:</strong> Nenhum profissional possui grade configurada para este dia da semana.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline dos agendamentos */}
      {!diaTemProfissionaisDisponiveis ? (
        // Mensagem quando não há profissionais com grade para este dia da semana
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Dia sem atendimento
            </h3>
            <p className="text-gray-600 mb-4">
              Nenhum profissional possui grade de horários configurada para este dia da semana.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>💡 Para habilitar agendamentos neste dia:</p>
              <p>1. Acesse a seção "Disponibilidades"</p>
              <p>2. Configure uma grade horária incluindo este dia da semana</p>
              <p>3. Ou configure um horário liberado específico para esta data</p>
            </div>
            <div className="mt-6 flex justify-center space-x-2">
              <Button variant="outline" onClick={() => navegarDia('anterior')}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Dia Anterior
              </Button>
              <Button variant="outline" onClick={() => navegarDia('proximo')}>
                Dia Seguinte
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Agenda do Dia</h3>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {horariosDisponiveis.map((horario) => {
            const agendamentosNoHorario = obterAgendamentosNoHorario(horario);
            const temAgendamentos = agendamentosNoHorario.length > 0;

            return (
              <div key={horario} className="flex">
                {/* Coluna do horário */}
                <div className="w-20 flex-shrink-0 p-4 text-center border-r border-gray-100">
                  <div
                    className={`text-sm font-medium ${temAgendamentos ? 'text-primary-600' : 'text-gray-400'}`}
                  >
                    {horario}
                  </div>
                </div>

                {/* Conteúdo do horário */}
                <div className="flex-1 p-4">
                  {agendamentosNoHorario.length === 0 ? (
                    <div
                      className="h-8 flex items-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                      onClick={() => onNovoAgendamento(criarDataHorarioComFiltro(horario))}
                    >
                      Horário livre - Clique para agendar
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {agendamentosNoHorario.map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="bg-gray-50 rounded-lg p-4 border-l-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          style={{
                            borderLeftColor: obterCorPorStatus(
                              agendamento.status
                            ).includes('blue')
                              ? '#3b82f6'
                              : obterCorPorStatus(agendamento.status).includes('green')
                                ? '#10b981'
                                : obterCorPorStatus(agendamento.status).includes('yellow')
                                  ? '#f59e0b'
                                  : obterCorPorStatus(agendamento.status).includes('red')
                                    ? '#ef4444'
                                    : '#6b7280',
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
                                <span
                                  className={`
                                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                  ${agendamento.status === 'AGENDADO' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${agendamento.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' : ''}
                                  ${agendamento.status === 'REALIZADO' ? 'bg-gray-100 text-gray-800' : ''}
                                  ${agendamento.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : ''}
                                `}
                                >
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
                                    {dateUtils.formatTimeLocal(agendamento.dataHora)}
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
                        onClick={() => onNovoAgendamento(criarDataHorarioComFiltro(horario))}
                      >
                        <span className="text-sm text-gray-500 hover:text-primary-600">
                          + Adicionar outro agendamento neste horário
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com resumo - apenas quando há profissionais disponíveis */}
        {agendamentosDoDia.length === 0 && diaTemProfissionaisDisponiveis && (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento para este dia
            </h3>
            <p className="text-gray-500 mb-4">
              Que tal aproveitar para organizar a agenda ou criar novos agendamentos?
            </p>
            <Button onClick={() => onNovoAgendamento(criarDataHorarioComFiltro('09:00'))}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Agendamento
            </Button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}