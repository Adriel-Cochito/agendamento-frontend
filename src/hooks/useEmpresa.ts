// src/hooks/useEmpresa.ts
import { useQuery } from '@tanstack/react-query';
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