// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardData } from '@/api/dashboard';
import { useAuthStore } from '@/store/authStore';

export function useDashboard(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery<DashboardData>({
    queryKey: ['dashboard', finalEmpresaId],
    queryFn: () => dashboardApi.getResumo(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualiza a cada 10 minutos
  });
}

// Hook para métricas específicas (opcional)
export function useDashboardMetricas(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['dashboard-metricas', finalEmpresaId],
    queryFn: () => dashboardApi.getMetricas(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useDashboardIndicadores(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['dashboard-indicadores', finalEmpresaId],
    queryFn: () => dashboardApi.getIndicadores(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados mais estáveis)
  });
}

export function useDashboardGraficos(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['dashboard-graficos', finalEmpresaId],
    queryFn: () => dashboardApi.getGraficos(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

export function useDashboardAlertas(empresaId?: number) {
  const user = useAuthStore((state) => state.user);
  const finalEmpresaId = empresaId || user?.empresaId;

  return useQuery({
    queryKey: ['dashboard-alertas', finalEmpresaId],
    queryFn: () => dashboardApi.getAlertas(finalEmpresaId!),
    enabled: !!finalEmpresaId,
    staleTime: 1 * 60 * 1000, // 1 minuto (alertas precisam estar atualizados)
  });
}