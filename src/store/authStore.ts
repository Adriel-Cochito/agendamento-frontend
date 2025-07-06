import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth';
import { authApi } from '@/api/auth';

// Função para decodificar JWT
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);
          
          // Decodificar o token para extrair informações
          const payload = decodeJWT(response.token);
          console.log('Token payload:', payload);
          
          // Criar o usuário com as informações do token
          // Ajuste conforme o que vem no seu token
          const user: User = {
            id: payload.id || payload.sub || '1',
            name: payload.name || credentials.email.split('@')[0],
            email: payload.sub || credentials.email,
            role: payload.role || 'OWNER',
            empresaId: payload.empresaId || 1,
          };
          
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
      
      // Verificar se o token ainda é válido
      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        
        const payload = decodeJWT(token);
        if (!payload || !payload.exp) return false;
        
        // Verificar se o token expirou
        const now = Date.now() / 1000;
        return payload.exp > now;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const authStore = useAuthStore;