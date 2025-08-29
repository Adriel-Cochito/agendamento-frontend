// src/hooks/useEmpresa.ts (adicionar ao arquivo existente)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { empresasApi } from '@/api/empresas';

export function useEmpresa(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['empresa', finalEmpresaId],
    queryFn: () => empresasApi.getById(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}

export function useEmpresaAtual() {
  const user = useAuthStore((state) => state.user);
  return useEmpresa(user?.empresaId);
}

// NOVO: Hook para atualizar empresa
export function useUpdateEmpresa() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  return useMutation({
    mutationFn: async (data: {
      nome: string;
      email: string;
      telefone: string;
      cnpj: string;
      ativo: boolean;
    }) => {
      const empresaId = user?.empresaId;
      if (!empresaId) {
        throw new Error('ID da empresa não encontrado');
      }
      return empresasApi.update(empresaId, data);
    },
    onSuccess: (data) => {
      // Atualizar cache da empresa atual
      queryClient.setQueryData(['empresa', data.id], data);
      
      // Invalidar queries relacionadas para refetch
      queryClient.invalidateQueries({ queryKey: ['empresa'] });
    },
  });
}