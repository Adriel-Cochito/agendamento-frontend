export interface Profissional {
  id: number;
  nome: string;
  email: string;
  perfil: 'OWNER' | 'ADMIN' | 'USER';
  ativo: boolean;
  empresaId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfissionalRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: 'OWNER' | 'ADMIN' | 'USER';
  empresaId: number;
  ativo: boolean;
  googleAccessToken?: null;
  googleRefreshToken?: null;
}

export interface UpdateProfissionalRequest {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: 'OWNER' | 'ADMIN' | 'USER';
  ativo?: boolean;
}