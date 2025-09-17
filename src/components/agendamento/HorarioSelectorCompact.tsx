import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useDisponibilidadesByProfissional } from '@/hooks/useDisponibilidades';
import { useAgendamentosByData } from '@/hooks/useAgendamentos';
import { useAgendamentoPublicoHorarios } from '@/hooks/useAgendamentoPublicoHorarios';
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
  showProfissionalSelection?: boolean;
  usePublicApi?: boolean; // Nova prop para indicar se deve usar API pública
  empresaId?: number; // ID da empresa para API pública
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
  usePublicApi = false,
  empresaId,
}: HorarioSelectorCompactProps) {
  const [horariosComProfissionais, setHorariosComProfissionais] = useState<
    HorarioComProfissionais[]
  >([]);
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);

  // Hook para API pública - usar apenas o primeiro profissional
  const publicHorarios = usePublicApi && empresaId && profissionais.length > 0 ? 
    useAgendamentoPublicoHorarios({
      empresaId,
      servicoId: servico.id,
      profissionalId: profissionais[0].id,
      data,
      duracaoServico: servico.duracao
    }) : null;

  // Buscar disponibilidades e agendamentos para cada profissional
  // Se usePublicApi for true, não usar os hooks autenticados
  const disponibilidadeQueries = usePublicApi ? [] : profissionais.map((prof) =>
    useDisponibilidadesByProfissional(prof.id, data)
  );

  const agendamentoQueries = usePublicApi ? [] : profissionais.map((prof) =>
    useAgendamentosByData({
      servicoId: servico.id,
      profissionalId: prof.id,
      data,
    })
  );

  // Memoizar os dados das queries para evitar re-renders desnecessários
  const queriesData = useMemo(() => {
    if (usePublicApi && publicHorarios) {
      // Para API pública, usar dados do hook público
      console.log('🌐 [HORARIO SELECTOR] Usando API pública - dados reais');
      return {
        disponibilidades: [[]], // Não usado para API pública
        agendamentos: [[]], // Não usado para API pública
        isLoading: publicHorarios.loading,
        hasError: !!publicHorarios.error,
        publicHorarios: publicHorarios.horarios
      };
    }
    
    const disponibilidadesData = disponibilidadeQueries.map(q => q.data || []);
    const agendamentosData = agendamentoQueries.map(q => q.data || []);
    const isLoading = disponibilidadeQueries.some(q => q.isLoading) || 
                     agendamentoQueries.some(q => q.isLoading);
    
    return {
      disponibilidades: disponibilidadesData,
      agendamentos: agendamentosData,
      isLoading,
      hasError: disponibilidadeQueries.some(q => q.error) || 
               agendamentoQueries.some(q => q.error),
      publicHorarios: null
    };
  }, [
    usePublicApi,
    publicHorarios?.loading,
    publicHorarios?.error,
    publicHorarios?.horarios,
    profissionais,
    data,
    servico.empresaId,
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
      console.log('⏳ Aguardando carregamento das queries...');
      return;
    }

    // Se há erro, limpar horários
    if (queriesData.hasError) {
      console.log('❌ Erro nas queries, limpando horários');
      setHorariosComProfissionais([]);
      return;
    }

    // Se usando API pública, processar dados diretamente
    if (usePublicApi && queriesData.publicHorarios) {
      console.log('🌐 [HORARIO SELECTOR] Processando horários da API pública');
      
      const horariosFinais: HorarioComProfissionais[] = queriesData.publicHorarios
        .filter(h => h.disponivel) // Apenas horários disponíveis
        .map(horario => ({
          hora: horario.hora,
          profissionaisDisponiveis: profissionais.map(prof => ({
            profissional: prof,
            disponivel: true, // Todos os profissionais estão disponíveis para horários da API pública
            motivo: undefined
          }))
        }));

      console.log(`✅ [HORARIO SELECTOR] Horários da API pública: ${horariosFinais.length}`);
      setHorariosComProfissionais(horariosFinais);
      return;
    }

    console.log('🔄 Recalculando horários disponíveis', {
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

      console.log(`👤 Calculando horários para ${prof.nome}:`, {
        disponibilidades: disponibilidades.length,
        agendamentos: agendamentos.length
      });

      const horarios = calcularHorariosDisponiveisPorProfissional(
        disponibilidades,
        agendamentos,
        data,
        servico.duracao
      );

      console.log(`✅ ${prof.nome}: ${horarios.length} slots calculados`, 
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

    console.log(`📊 Total de horários únicos encontrados: ${horariosOrdenados.length}`);

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
        console.log(`🚫 Removendo horário ${h.hora} - nenhum profissional disponível`);
      }
      
      return temAlguemDisponivel;
    });

    console.log(`✅ Horários finais com disponibilidade: ${horariosComDisponibilidade.length}`);
    console.log('📋 Horários disponíveis:', horariosComDisponibilidade.map(h => h.hora).join(', '));

    setHorariosComProfissionais(horariosComDisponibilidade);
  }, [
    // CORREÇÃO: Usar dependências mais específicas para evitar loops infinitos
    queriesData.isLoading,
    queriesData.hasError,
    queriesData.publicHorarios,
    usePublicApi,
    JSON.stringify(queriesData.disponibilidades), // Serializar arrays para comparação
    JSON.stringify(queriesData.agendamentos),
    profissionaisIds, // IDs serializados dos profissionais
    data,
    servico.id,
    servico.duracao
  ]);

  const handleProfissionalSelect = (horario: string, profissionalId: number) => {
    const dataHora = criarDataHora(data, horario);
    onHorarioSelect(dataHora, profissionalId);
  };

  const handleHorarioDirectSelect = (horario: string) => {
    const dataHora = criarDataHora(data, horario);
    // Se não precisa escolher profissional específico, passa sem profissionalId
    onHorarioSelect(dataHora);
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
        <span className="text-sm">Erro ao carregar horários</span>
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Horários Disponíveis
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {horariosComProfissionais.map((horarioData) => {
          const profissionaisDisponiveis = horarioData.profissionaisDisponiveis.filter(
            (p) => p.disponivel
          );

          return (
            <div key={horarioData.hora} className="relative">
              {!showProfissionalSelection ? (
                // Modo simples: clique direto no horário
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full text-sm ${
                    selectedHorario === horarioData.hora
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedHorario(
                      selectedHorario === horarioData.hora ? null : horarioData.hora
                    );
                    handleHorarioDirectSelect(horarioData.hora);
                  }}
                >
                  {horarioData.hora}
                </Button>
              ) : (
                // Modo com seleção de profissional
                <div className="space-y-1">
                  <div className="text-sm font-medium text-center p-1 bg-gray-100 rounded">
                    {horarioData.hora}
                  </div>
                  <div className="space-y-1">
                    {profissionaisDisponiveis.map((profData) => (
                      <Button
                        key={profData.profissional.id}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs px-2 py-1 hover:border-blue-400"
                        onClick={() =>
                          handleProfissionalSelect(
                            horarioData.hora,
                            profData.profissional.id
                          )
                        }
                      >
                        {profData.profissional.nome}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <div className="flex items-center justify-between">
          <span>{horariosComProfissionais.length} horários disponíveis</span>
          <span>Duração: {servico.duracao} min</span>
        </div>
      </div>
    </div>
  );
}