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

export function useDisponibilidadesByProfissional(profissionalId?: number) {
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId;

  return useQuery({
    queryKey: ['disponibilidades', 'profissional', empresaId, profissionalId],
    queryFn: () => disponibilidadesApi.getByProfissional(empresaId!, profissionalId!),
    enabled: !!empresaId && !!profissionalId,
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
      data, 
      empresaId 
    }: { 
      id: number; 
      data: UpdateDisponibilidadeRequest; 
      empresaId: number 
    }) => disponibilidadesApi.update(id, data, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
    },
  });
}

export function useDeleteDisponibilidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, empresaId }: { id: number; empresaId: number }) =>
      disponibilidadesApi.delete(id, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
    },
  });
}