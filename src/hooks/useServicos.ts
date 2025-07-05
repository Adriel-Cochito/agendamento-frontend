import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicosApi } from '@/api/servicos';
import { CreateServicoRequest, UpdateServicoRequest } from '@/types/servico';

export function useServicos(empresaId?: number) {
  return useQuery({
    queryKey: ['servicos', empresaId],
    queryFn: () => servicosApi.getAll(empresaId),
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
    mutationFn: ({ id, data }: { id: number; data: UpdateServicoRequest }) =>
      servicosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servico'] });
    },
  });
}

export function useDeleteServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => servicosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
    },
  });
}