export interface CreateEmpresaWithOwnerRequest {
  nomeEmpresa: string;
  emailEmpresa: string;
  telefoneEmpresa: string;
  cnpjEmpresa: string;
  nomeUnicoEmpresa: string;
  ativoEmpresa: boolean;
  nomeProfissional: string;
  emailProfissional: string;
  senhaProfissional: string;
  perfilProfissional: 'OWNER';
  ativoProfissional: boolean;
  googleAccessToken: null;
  googleRefreshToken: null;
}

export interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  nomeUnico: string;
  ativo: boolean;
}