import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth';
import { authApi } from '@/api/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

login: async (credentials) => {
  set({ isLoading: true });
  try {
    const response = await authApi.login(credentials);
    
    console.log('Token recebido:', response.token);
    
    // Decodificar o token para pegar informações do usuário
    // Você pode usar uma biblioteca como jwt-decode ou fazer manualmente
    const tokenParts = response.token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', payload);
    }
    
    const user: User = {
      id: '1',
      name: credentials.email.split('@')[0],
      email: credentials.email,
      role: 'OWNER',
      empresaId: 1, // Adicione o empresaId aqui
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