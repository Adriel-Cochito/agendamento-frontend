import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useDisponibilidadesByProfissional } from '@/hooks/useDisponibilidades';
import { useAgendamentosByData } from '@/hooks/useAgendamentos';
import { HorarioDisponivel } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import {
  calcularHorariosDisponiveisPorProfissional,
  criarDataHora,
} from '@/utils/horariosDisponiveis';

interface HorarioSelectorCompactProps {
  servico: Servico;
  profissionais: Profissional[];
  data: string;
  onHorarioSelect: (dataHora: string, profissionalId?: number) => void;
  showProfissionalSelection?: boolean; // Nova prop para controlar se mostra seleção de profissional
}

interface HorarioComProfissionais {
  hora: string;
  profissionaisDisponiveis: Array<{
    profissional: Profissional;
    disponivel: boolean;
    motivo?: string;
  }>;
}

export function HorarioSelectorCompact({
  servico,
  profissionais,
  data,
  onHorarioSelect,
  showProfissionalSelection = false,
}: HorarioSelectorCompactProps) {
  const [horariosComProfissionais, setHorariosComProfissionais] = useState<
    HorarioComProfissionais[]
  >([]);
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);

  // Buscar disponibilidades e agendamentos para cada profissional
  const disponibilidadeQueries = profissionais.map((prof) =>
    useDisponibilidadesByProfissional(prof.id, data)
  );

  const agendamentoQueries = profissionais.map((prof) =>
    useAgendamentosByData({
      servicoId: servico.id,
      profissionalId: prof.id,
      data,
    })
  );

  useEffect(() => {
    // Verificar se todas as queries carregaram
    const allLoaded =
      disponibilidadeQueries.every((q) => !q.isLoading) &&
      agendamentoQueries.every((q) => !q.isLoading);

    if (!allLoaded) return;

    // Calcular horários disponíveis para cada profissional
    const horariosPorProfissional = profissionais.map((prof, index) => {
      const disponibilidades = disponibilidadeQueries[index].data || [];
      const agendamentos = agendamentoQueries[index].data || [];

      return {
        profissional: prof,
        horarios: calcularHorariosDisponiveisPorProfissional(
          disponibilidades,
          agendamentos,
          data,
          servico.duracao
        ),
      };
    });

    // Criar conjunto único de horários
    const todosHorarios = new Set<string>();
    horariosPorProfissional.forEach(({ horarios }) => {
      horarios.forEach((h) => todosHorarios.add(h.hora));
    });

    // Ordenar horários
    const horariosOrdenados = Array.from(todosHorarios).sort();

    // Mapear cada horário com os profissionais disponíveis
    const horariosFinais: HorarioComProfissionais[] = horariosOrdenados.map((hora) => {
      const profissionaisDisponiveis = profissionais.map((prof) => {
        const dadosProfissional = horariosPorProfissional.find(
          (p) => p.profissional.id === prof.id
        );
        const horarioInfo = dadosProfissional?.horarios.find((h) => h.hora === hora);

        return {
          profissional: prof,
          disponivel: horarioInfo?.disponivel || false,
          motivo: horarioInfo?.motivo,
        };
      });

      return {
        hora,
        profissionaisDisponiveis,
      };
    });

    // Filtrar apenas horários que tenham pelo menos um profissional disponível
    const horariosComDisponibilidade = horariosFinais.filter((h) =>
      h.profissionaisDisponiveis.some((p) => p.disponivel)
    );

    setHorariosComProfissionais(horariosComDisponibilidade);
  }, [disponibilidadeQueries, agendamentoQueries, profissionais, data, servico.duracao]);

  const handleProfissionalSelect = (horario: string, profissionalId: number) => {
    const dataHora = criarDataHora(data, horario);
    onHorarioSelect(dataHora, profissionalId);
  };

  const handleHorarioDirectSelect = (horario: string) => {
    const dataHora = criarDataHora(data, horario);
    // Se não deve mostrar seleção de profissional, usar o primeiro profissional disponível
    const profissionaisDisponiveis =
      horariosComProfissionais
        .find((h) => h.hora === horario)
        ?.profissionaisDisponiveis.filter((p) => p.disponivel) || [];

    const profissionalId = profissionaisDisponiveis[0]?.profissional.id;
    onHorarioSelect(dataHora, profissionalId);
  };

  const isLoading =
    disponibilidadeQueries.some((q) => q.isLoading) ||
    agendamentoQueries.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loading size="sm" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(localDate);
  };

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="pb-3 border-b">
        <div className="flex items-center space-x-2 mb-1">
          <Calendar className="w-4 h-4 text-primary-600" />
          <h3 className="text-base font-medium text-gray-900">Escolha o Horário</h3>
        </div>
        <p className="text-xs text-gray-600">
          {formatDate(data)} • {servico.titulo} ({servico.duracao} min)
        </p>
      </div>

      {/* Horários em formato compacto */}
      {horariosComProfissionais.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Nenhum horário disponível
          </h4>
          <p className="text-xs text-gray-500">Não há horários livres para esta data.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-600 mb-3">
            {horariosComProfissionais.length} horário(s) disponível(is):
          </p>

          {/* Grid compacto de horários */}
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {horariosComProfissionais.map((horarioData) => {
              const profissionaisDisponiveis =
                horarioData.profissionaisDisponiveis.filter((p) => p.disponivel);
              const isSelected = selectedHorario === horarioData.hora;

              return (
                <div key={horarioData.hora} className="space-y-1">
                  {/* Botão do horário compacto */}
                  <button
                    onClick={() => {
                      if (showProfissionalSelection) {
                        // Modo calendário: mostrar profissionais para seleção
                        setSelectedHorario(isSelected ? null : horarioData.hora);
                      } else {
                        // Modo botão normal: selecionar diretamente
                        handleHorarioDirectSelect(horarioData.hora);
                      }
                    }}
                    className={`w-full p-2 text-xs border rounded transition-colors ${
                      isSelected
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{horarioData.hora}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {profissionaisDisponiveis.length} disponível
                      {profissionaisDisponiveis.length !== 1 ? 'eis' : ''}
                    </div>
                  </button>

                  {/* Lista compacta de profissionais (apenas quando showProfissionalSelection = true e selecionado) */}
                  {showProfissionalSelection && isSelected && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1">
                      {profissionaisDisponiveis.map(({ profissional }) => (
                        <button
                          key={profissional.id}
                          onClick={() =>
                            handleProfissionalSelect(horarioData.hora, profissional.id)
                          }
                          className="w-full text-left p-1.5 text-xs bg-white border border-gray-200 rounded hover:bg-primary-50 hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-700">
                              {profissional.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{profissional.nome}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              {showProfissionalSelection
                ? '💡 Clique em um horário para ver os profissionais disponíveis'
                : '💡 Clique em um horário para selecioná-lo'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
