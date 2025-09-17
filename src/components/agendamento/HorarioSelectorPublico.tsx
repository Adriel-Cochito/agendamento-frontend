import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertCircle, Calendar, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useAgendamentoPublicoHorarios } from '@/hooks/useAgendamentoPublicoHorarios';
import { HorarioDisponivel } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { criarDataHora } from '@/utils/horariosDisponiveis';

interface HorarioSelectorPublicoProps {
  empresaId: number;
  servico: Servico;
  profissional: Profissional;
  data: string;
  onHorarioSelect: (dataHora: string) => void;
}

export function HorarioSelectorPublico({
  empresaId,
  servico,
  profissional,
  data,
  onHorarioSelect
}: HorarioSelectorPublicoProps) {
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
  
  const {
    horarios,
    loading,
    error,
    refetch
  } = useAgendamentoPublicoHorarios({
    empresaId,
    servicoId: servico.id,
    profissionalId: profissional.id,
    data,
    duracaoServico: servico.duracao
  });

  // Filtrar apenas horários disponíveis
  const horariosDisponiveis = useMemo(() => {
    return horarios.filter(h => h.disponivel);
  }, [horarios]);

  const handleHorarioClick = (horario: string) => {
    setSelectedHorario(horario === selectedHorario ? null : horario);
  };

  const handleConfirmarHorario = (horario: string) => {
    const dataHora = criarDataHora(data, horario);
    onHorarioSelect(dataHora);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading size="sm" />
        <span className="ml-2 text-sm text-gray-600">
          Carregando horários disponíveis...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-sm mb-4">Erro ao carregar horários disponíveis</span>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (horariosDisponiveis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Calendar className="w-8 h-8 mb-2" />
        <span className="text-sm mb-2">Nenhum horário disponível para esta data</span>
        <p className="text-xs text-gray-400 text-center max-w-sm">
          Não há horários livres para {profissional.nome} em {data}. 
          Tente escolher outra data ou entre em contato conosco.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium flex items-center justify-center">
          <Clock className="w-5 h-5 mr-2" />
          Horários Disponíveis
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Profissional: <strong>{profissional.nome}</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {horariosDisponiveis.map((horarioData) => {
          const isSelected = selectedHorario === horarioData.hora;

          return (
            <div key={horarioData.hora} className="space-y-2">
              {/* Botão do horário */}
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`w-full text-sm ${
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => handleHorarioClick(horarioData.hora)}
              >
                <Clock className="w-4 h-4 mr-1" />
                {horarioData.hora}
              </Button>

              {/* Botão de confirmação (aparece quando selecionado) */}
              {isSelected && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full text-xs bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleConfirmarHorario(horarioData.hora)}
                >
                  <User className="w-3 h-3 mr-1" />
                  Confirmar
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Informações do rodapé */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {horariosDisponiveis.length} horários disponíveis
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Duração: {servico.duracao} minutos
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Clique em um horário e confirme para selecionar
        </div>
      </div>
    </div>
  );
}
