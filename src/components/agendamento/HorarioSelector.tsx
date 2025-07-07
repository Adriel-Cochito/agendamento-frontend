import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useDisponibilidadesByProfissional } from '@/hooks/useDisponibilidades';
import { useAgendamentosByData } from '@/hooks/useAgendamentos';
import { HorarioDisponivel } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { calcularHorariosDisponiveis, criarDataHora } from '@/utils/horariosDisponiveis';

interface HorarioSelectorProps {
  servico: Servico;
  profissional: Profissional;
  data: string;
  onHorarioSelect: (dataHora: string) => void;
}

export function HorarioSelector({
  servico,
  profissional,
  data,
  onHorarioSelect
}: HorarioSelectorProps) {
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);
  
  const { data: disponibilidades, isLoading: isLoadingDisp } = useDisponibilidadesByProfissional(profissional.id, data);
  const { data: agendamentos, isLoading: isLoadingAgend } = useAgendamentosByData({
    servicoId: servico.id,
    profissionalId: profissional.id,
    data
  });

  useEffect(() => {
    if (disponibilidades && agendamentos) {
      const horarios = calcularHorariosDisponiveis(
        disponibilidades,
        agendamentos,
        data,
        servico.duracao
      );
      setHorariosDisponiveis(horarios);
    }
  }, [disponibilidades, agendamentos, data, servico.duracao]);

  const handleHorarioClick = (horario: string) => {
    const dataHora = criarDataHora(data, horario);
    onHorarioSelect(dataHora);
  };

  const isLoading = isLoadingDisp || isLoadingAgend;
  const horariosLivres = horariosDisponiveis.filter(h => h.disponivel);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loading size="md" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Horários Disponíveis
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {formatDate(data)} - {profissional.nome}
        </p>
        <p className="text-sm text-gray-500">
          Serviço: {servico.titulo} ({servico.duracao} min)
        </p>
      </div>

      {/* Horários */}
      {horariosLivres.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum horário disponível
          </h3>
          <p className="text-gray-500">
            Não há horários livres para este profissional na data selecionada.
            Tente escolher outra data ou outro profissional.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {horariosLivres.length} horário(s) disponível(is):
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {horariosDisponiveis.map((horario) => (
              <Button
                key={horario.hora}
                variant={horario.disponivel ? "outline" : "ghost"}
                size="sm"
                disabled={!horario.disponivel}
                onClick={() => handleHorarioClick(horario.hora)}
                className={`${
                  horario.disponivel
                    ? 'hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'
                    : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
                title={horario.disponivel ? 'Clique para agendar' : horario.motivo || 'Indisponível'}
              >
                <Clock className="w-3 h-3 mr-1" />
                {horario.hora}
              </Button>
            ))}
          </div>
          
          {horariosDisponiveis.some(h => !h.disponivel) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Horários em cinza estão ocupados ou bloqueados
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}