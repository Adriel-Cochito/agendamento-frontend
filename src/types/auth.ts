export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'OWNER' | 'ADMIN' | 'USER';
  empresaId?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: {
    id: number;
    nome: string;
    email: string;
    perfil: 'OWNER' | 'ADMIN' | 'USER';
    empresaId: number;
  };
  expiresIn?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}