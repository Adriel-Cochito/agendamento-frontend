import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disponibilidadesApi } from '@/api/disponibilidades';
import { 
  CreateDisponibilidadeRequest, 
  UpdateDisponibilidadeRequest,
  DisponibilidadeFilters 
} from '@/types/disponibilidade';
import { useAuthStore } from '@/store/authStore';

export function useDisponibilidades(filters?: DisponibilidadeFilters) {
  const user = useAuthStore((state) => state.user);
  const finalFilters = {
    ...filters,
    empresaId: filters?.empresaId || user?.empresaId,
  };

  return useQuery({
    queryKey: ['disponibilidades', finalFilters],
    queryFn: () => disponibilidadesApi.getAll(finalFilters),
    enabled: !!finalFilters.empresaId,
  });
}

export function useDisponibilidade(id: number) {
  return useQuery({
    queryKey: ['disponibilidade', id],
    queryFn: () => disponibilidadesApi.getById(id),
    enabled: !!id,
  });
}

// Nova função para buscar disponibilidades de um profissional específico numa data
export function useDisponibilidadesByProfissional(profissionalId?: number, data?: string) {
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId;

  return useQuery({
    queryKey: ['disponibilidades', 'profissional', empresaId, profissionalId, data],
    queryFn: () => disponibilidadesApi.getByProfissional(empresaId!, profissionalId!, data!),
    enabled: !!empresaId && !!profissionalId && !!data,
  });
}

export function useCreateDisponibilidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisponibilidadeRequest) => disponibilidadesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
    },
  });
}

export function useUpdateDisponibilidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: UpdateDisponibilidadeRequest; 
    }) => disponibilidadesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
    },
  });
}

export function useDeleteDisponibilidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => disponibilidadesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
    },
  });
}