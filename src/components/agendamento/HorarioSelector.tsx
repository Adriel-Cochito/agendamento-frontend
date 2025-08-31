import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertCircle, Calendar, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useDisponibilidadesByProfissional } from '@/hooks/useDisponibilidades';
import { useAgendamentosByData } from '@/hooks/useAgendamentos';
import { HorarioDisponivel } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { calcularHorariosDisponiveisPorProfissional, criarDataHora } from '@/utils/horariosDisponiveis';

interface HorarioSelectorProps {
  servico: Servico;
  profissionais: Profissional[];
  data: string;
  onHorarioSelect: (dataHora: string, profissionalId: number) => void;
}

interface HorarioComProfissionais {
  hora: string;
  profissionaisDisponiveis: Array<{
    profissional: Profissional;
    disponivel: boolean;
    motivo?: string;
  }>;
}

export function HorarioSelector({
  servico,
  profissionais,
  data,
  onHorarioSelect
}: HorarioSelectorProps) {
  const [horariosComProfissionais, setHorariosComProfissionais] = useState<HorarioComProfissionais[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
  
  // Buscar disponibilidades e agendamentos para cada profissional
  const disponibilidadeQueries = profissionais.map(prof => 
    useDisponibilidadesByProfissional(prof.id, data)
  );
  
  const agendamentoQueries = profissionais.map(prof => 
    useAgendamentosByData({
      servicoId: servico.id,
      profissionalId: prof.id,
      data
    })
  );

  // Memoizar os dados das queries para evitar re-renders desnecessários
  const queriesData = useMemo(() => {
    const disponibilidadesData = disponibilidadeQueries.map(q => q.data || []);
    const agendamentosData = agendamentoQueries.map(q => q.data || []);
    const isLoading = disponibilidadeQueries.some(q => q.isLoading) || 
                     agendamentoQueries.some(q => q.isLoading);
    
    return {
      disponibilidades: disponibilidadesData,
      agendamentos: agendamentosData,
      isLoading,
      hasError: disponibilidadeQueries.some(q => q.error) || 
               agendamentoQueries.some(q => q.error)
    };
  }, [
    // Dependências específicas dos dados das queries, não das queries em si
    ...disponibilidadeQueries.map(q => q.data),
    ...disponibilidadeQueries.map(q => q.isLoading),
    ...disponibilidadeQueries.map(q => q.error),
    ...agendamentoQueries.map(q => q.data),
    ...agendamentoQueries.map(q => q.isLoading),
    ...agendamentoQueries.map(q => q.error),
  ]);

  // Memoizar os IDs dos profissionais para comparação
  const profissionaisIds = useMemo(() => 
    profissionais.map(p => p.id).sort().join(','),
    [profissionais]
  );

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (queriesData.isLoading) {
      console.log('⏳ HorarioSelector: Aguardando carregamento das queries...');
      return;
    }

    // Se há erro, limpar horários
    if (queriesData.hasError) {
      console.log('❌ HorarioSelector: Erro nas queries, limpando horários');
      setHorariosComProfissionais([]);
      return;
    }

    console.log('🔄 HorarioSelector: Recalculando horários disponíveis', {
      data,
      servicoId: servico.id,
      servicoDuracao: servico.duracao,
      profissionaisCount: profissionais.length,
      profissionais: profissionais.map(p => p.nome)
    });

    // Calcular horários disponíveis para cada profissional
    const horariosPorProfissional = profissionais.map((prof, index) => {
      const disponibilidades = queriesData.disponibilidades[index] || [];
      const agendamentos = queriesData.agendamentos[index] || [];

      console.log(`👤 HorarioSelector: Calculando horários para ${prof.nome}:`, {
        disponibilidades: disponibilidades.length,
        agendamentos: agendamentos.length
      });

      const horarios = calcularHorariosDisponiveisPorProfissional(
        disponibilidades,
        agendamentos,
        data,
        servico.duracao
      );

      console.log(`✅ HorarioSelector: ${prof.nome}: ${horarios.length} slots calculados`, 
        horarios.filter(h => h.disponivel).length, 'disponíveis');

      return {
        profissional: prof,
        horarios,
      };
    });

    // Criar conjunto único de horários de TODOS os horários calculados (incluindo bloqueados)
    const todosHorarios = new Set<string>();
    horariosPorProfissional.forEach(({ horarios }) => {
      horarios.forEach(h => todosHorarios.add(h.hora));
    });

    // Ordenar horários
    const horariosOrdenados = Array.from(todosHorarios).sort();

    console.log(`📊 HorarioSelector: Total de horários únicos encontrados: ${horariosOrdenados.length}`);

    // Mapear cada horário com os profissionais disponíveis
    const horariosFinais: HorarioComProfissionais[] = horariosOrdenados.map(hora => {
      const profissionaisDisponiveis = profissionais.map(prof => {
        const dadosProfissional = horariosPorProfissional.find(p => p.profissional.id === prof.id);
        const horarioInfo = dadosProfissional?.horarios.find(h => h.hora === hora);
        
        return {
          profissional: prof,
          disponivel: horarioInfo?.disponivel || false,
          motivo: horarioInfo?.motivo
        };
      });

      return {
        hora,
        profissionaisDisponiveis
      };
    });

    // CORREÇÃO: Filtrar apenas horários que tenham pelo menos um profissional disponível
    // Isso remove os horários bloqueados da listagem
    const horariosComDisponibilidade = horariosFinais.filter(h => {
      const temAlguemDisponivel = h.profissionaisDisponiveis.some(p => p.disponivel);
      
      if (!temAlguemDisponivel) {
        console.log(`🚫 HorarioSelector: Removendo horário ${h.hora} - nenhum profissional disponível`);
      }
      
      return temAlguemDisponivel;
    });

    console.log(`✅ HorarioSelector: Horários finais com disponibilidade: ${horariosComDisponibilidade.length}`);
    console.log('📋 HorarioSelector: Horários disponíveis:', horariosComDisponibilidade.map(h => h.hora).join(', '));

    setHorariosComProfissionais(horariosComDisponibilidade);
  }, [
    // CORREÇÃO: Usar dependências mais específicas para evitar loops infinitos
    queriesData.isLoading,
    queriesData.hasError,
    JSON.stringify(queriesData.disponibilidades), // Serializar arrays para comparação
    JSON.stringify(queriesData.agendamentos),
    profissionaisIds, // IDs serializados dos profissionais
    data,
    servico.id,
    servico.duracao
  ]);

  const handleHorarioClick = (horario: string) => {
    setSelectedHorario(horario === selectedHorario ? null : horario);
  };

  const handleProfissionalSelect = (horario: string, profissionalId: number) => {
    const dataHora = criarDataHora(data, horario);
    onHorarioSelect(dataHora, profissionalId);
  };

  const isLoading = queriesData.isLoading;
  const hasError = queriesData.hasError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading size="sm" />
        <span className="ml-2 text-sm text-gray-600">
          Carregando horários disponíveis...
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Erro ao carregar horários disponíveis</span>
      </div>
    );
  }

  if (horariosComProfissionais.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Calendar className="w-5 h-5 mr-2" />
        <span className="text-sm">Nenhum horário disponível para esta data</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Selecione um Horário
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {horariosComProfissionais.map((horarioData) => {
          const profissionaisDisponiveis = horarioData.profissionaisDisponiveis.filter(
            p => p.disponivel
          );
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

              {/* Lista de profissionais disponíveis (expandida quando selecionado) */}
              {isSelected && (
                <div className="space-y-1 bg-gray-50 p-2 rounded-lg border">
                  <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Profissionais ({profissionaisDisponiveis.length})
                  </div>
                  {profissionaisDisponiveis.map((profData) => (
                    <Button
                      key={profData.profissional.id}
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs justify-start px-2 py-1 h-auto hover:bg-blue-100"
                      onClick={() => handleProfissionalSelect(
                        horarioData.hora, 
                        profData.profissional.id
                      )}
                    >
                      <User className="w-3 h-3 mr-1" />
                      {profData.profissional.nome}
                    </Button>
                  ))}
                </div>
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
            {horariosComProfissionais.length} horários disponíveis
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Duração: {servico.duracao} minutos
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Clique em um horário para ver os profissionais disponíveis
        </div>
      </div>
    </div>
  );
}