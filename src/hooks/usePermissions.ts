// src/hooks/usePermissions.ts
import { useAuthStore } from '@/store/authStore';

type Role = 'OWNER' | 'ADMIN' | 'USER';

interface Permissions {
  // Permissões para Serviços
  servicos: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  // Permissões para Empresa (preparado para futuro)
  empresa: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  // Permissões para Profissionais (preparado para futuro)
  profissionais: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  // Permissões para Agendamentos (preparado para futuro)
  agendamentos: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  // Permissões para Disponibilidades (preparado para futuro)
  disponibilidades: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export function usePermissions(): Permissions {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role as Role;

  // Função helper para definir permissões por recurso e papel
  const getResourcePermissions = (resource: 'servicos' | 'empresa' | 'profissionais' | 'agendamentos' | 'disponibilidades') => {
    switch (userRole) {
      case 'OWNER':
        // OWNER pode tudo em todos os recursos
        return {
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
        };

      case 'ADMIN':
        // ADMIN pode tudo, exceto dados de empresa
        if (resource === 'empresa') {
          return {
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
          };
        }
        return {
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
        };

      case 'USER':
        // USER pode apenas ler
        return {
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        };

      default:
        // Sem permissões se não tiver role
        return {
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        };
    }
  };

  return {
    servicos: getResourcePermissions('servicos'),
    empresa: getResourcePermissions('empresa'),
    profissionais: getResourcePermissions('profissionais'),
    agendamentos: getResourcePermissions('agendamentos'),
    disponibilidades: getResourcePermissions('disponibilidades'),
  };
}

// Hook específico para verificar permissão de um recurso
export function useCanAccess(resource: keyof Permissions, action: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'): boolean {
  const permissions = usePermissions();
  return permissions[resource][action];
}

// Hook específico para serviços (por conveniência)
export function useServicosPermissions() {
  const permissions = usePermissions();
  return permissions.servicos;
}