import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profissionaisApi } from '@/api/profissionais';
import { CreateProfissionalRequest, UpdateProfissionalRequest } from '@/types/profissional';

import { useAuthStore } from '@/store/authStore';

export function useProfissionais(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;
  
  return useQuery({
    queryKey: ['profissionais', finalEmpresaId],
    queryFn: () => profissionaisApi.getAll(finalEmpresaId),
    enabled: !!finalEmpresaId,
  });
}

export function useProfissional(id: number) {
  return useQuery({
    queryKey: ['profissional', id],
    queryFn: () => profissionaisApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfissionalRequest) => profissionaisApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
  });
}

export function useUpdateProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProfissionalRequest }) =>
      profissionaisApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['profissional'] });
    },
  });
}

export function useDeleteProfissional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => profissionaisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
  });
}