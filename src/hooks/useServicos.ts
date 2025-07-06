import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicosApi } from '@/api/servicos';
import { CreateServicoRequest, UpdateServicoRequest } from '@/types/servico';

import { useAuthStore } from '@/store/authStore';


export function useServicos(empresaId?: number) {
    const user = useAuthStore((state) => state.user);
    const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['servicos', finalEmpresaId],
    queryFn: () => servicosApi.getAll(finalEmpresaId),
    enabled: !!finalEmpresaId,
  });
}

export function useServico(id: number) {
  return useQuery({
    queryKey: ['servico', id],
    queryFn: () => servicosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServicoRequest) => servicosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
    },
  });
}

export function useUpdateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, empresaId }: { id: number; data: UpdateServicoRequest; empresaId: number }) =>
      servicosApi.update(id, data, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servico'] });
    },
  });
}


export function useDeleteServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, empresaId }: { id: number; empresaId: number }) =>
      servicosApi.delete(id, empresaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
    },
  });
}