import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentosApi } from '@/api/agendamentos';
import { 
  CreateAgendamentoRequest, 
  UpdateAgendamentoRequest,
  AgendamentoFilters 
} from '@/types/agendamento';
import { useAuthStore } from '@/store/authStore';

export function useAgendamentos(filters?: AgendamentoFilters) {
  const user = useAuthStore((state) => state.user);
  const finalFilters = {
    ...filters,
    empresaId: filters?.empresaId || user?.empresaId,
  };

  return useQuery({
    queryKey: ['agendamentos', finalFilters],
    queryFn: () => agendamentosApi.getAll(finalFilters),
    enabled: !!finalFilters.empresaId,
  });
}

export function useAgendamento(id: number) {
  return useQuery({
    queryKey: ['agendamento', id],
    queryFn: () => agendamentosApi.getById(id),
    enabled: !!id,
  });
}

export function useAgendamentosByData(filters: {
  servicoId?: number;
  profissionalId?: number;
  data?: string;
}) {
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId;

  return useQuery({
    queryKey: ['agendamentos', 'data', empresaId, filters],
    queryFn: () => agendamentosApi.getByData({
      empresaId: empresaId!,
      servicoId: filters.servicoId!,
      profissionalId: filters.profissionalId!,
      data: filters.data!,
    }),
    enabled: !!empresaId && !!filters.servicoId && !!filters.profissionalId && !!filters.data,
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: CreateAgendamentoRequest) => 
      agendamentosApi.create(data, user?.empresaId || 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
  });
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: UpdateAgendamentoRequest; 
    }) => agendamentosApi.update(id, data, user?.empresaId || 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['agendamento'] });
    },
  });
}

export function useDeleteAgendamento() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (id: number) => 
      agendamentosApi.delete(id, user?.empresaId || 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
  });
}