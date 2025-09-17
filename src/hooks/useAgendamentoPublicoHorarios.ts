import { useState, useEffect, useMemo } from 'react';
import { agendamentosPublicosApi } from '@/api/agendamentosPublicos';
import { Disponibilidade } from '@/types/disponibilidade';
import { HorarioDisponivel } from '@/types/agendamento';
import { calcularHorariosDisponiveisPorProfissional, criarDataHora } from '@/utils/horariosDisponiveis';

interface UseAgendamentoPublicoHorariosProps {
  empresaId: number;
  servicoId: number;
  profissionalId: number;
  data: string;
  duracaoServico: number;
}

interface UseAgendamentoPublicoHorariosReturn {
  horarios: HorarioDisponivel[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAgendamentoPublicoHorarios({
  empresaId,
  servicoId,
  profissionalId,
  data,
  duracaoServico
}: UseAgendamentoPublicoHorariosProps): UseAgendamentoPublicoHorariosReturn {
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = async () => {
    if (!empresaId || !servicoId || !profissionalId || !data) {
      setHorarios([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [PUBLIC HORARIOS] Buscando horários disponíveis:', {
        empresaId,
        servicoId,
        profissionalId,
        data,
        duracaoServico
      });

      // Buscar disponibilidades do profissional
      const disponibilidades: Disponibilidade[] = await agendamentosPublicosApi.getDisponibilidadesProfissional(
        empresaId,
        profissionalId,
        data
      );

      console.log('📅 [PUBLIC HORARIOS] Disponibilidades encontradas:', disponibilidades.length);

      // Buscar agenda do profissional (agendamentos existentes)
      const agenda = await agendamentosPublicosApi.getAgenda(
        empresaId,
        servicoId,
        profissionalId,
        data
      );

      console.log('📋 [PUBLIC HORARIOS] Agenda encontrada:', agenda.length, 'agendamentos');

      // Converter agenda para formato de agendamentos
      const agendamentos = agenda.map((item: any) => ({
        id: 0, // ID não é necessário para o cálculo
        dataHora: item.dataHora,
        duracao: item.duracao || duracaoServico,
        servicoId,
        profissionalId,
        clienteId: 0, // Não necessário para o cálculo
        observacoes: '',
        status: 'CONFIRMADO' as const,
        empresaId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Calcular horários disponíveis
      const horariosCalculados = calcularHorariosDisponiveisPorProfissional(
        disponibilidades,
        agendamentos,
        data,
        duracaoServico
      );

      console.log('✅ [PUBLIC HORARIOS] Horários calculados:', {
        total: horariosCalculados.length,
        disponiveis: horariosCalculados.filter(h => h.disponivel).length,
        bloqueados: horariosCalculados.filter(h => !h.disponivel).length
      });

      setHorarios(horariosCalculados);
    } catch (err) {
      console.error('❌ [PUBLIC HORARIOS] Erro ao buscar horários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Refetch function
  const refetch = () => {
    fetchHorarios();
  };

  // Effect para buscar horários quando as dependências mudarem
  useEffect(() => {
    fetchHorarios();
  }, [empresaId, servicoId, profissionalId, data, duracaoServico]);

  return {
    horarios,
    loading,
    error,
    refetch
  };
}
