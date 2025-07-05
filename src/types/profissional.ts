export interface Profissional {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  perfil: 'OWNER' | 'ADMIN' | 'USER';
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  empresaId: number;
  ativo: boolean;
}

export interface CreateProfissionalRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: 'OWNER';
  googleAccessToken?: null;
  googleRefreshToken?: null;
  empresaId: number;
  ativo: boolean;
}