// Tipos para documentos LGPD estáticos
export interface TermoUso {
  versao: string;
  titulo: string;
  conteudo: string;
  dataAtualizacao: string;
}

export interface PoliticaPrivacidade {
  versao: string;
  titulo: string;
  conteudo: string;
  dataAtualizacao: string;
}

// Tipos para aceites de documentos estáticos
export interface AceiteTermo {
  id: number;
  termoId: number;
  versao: string;
  titulo: string;
  aceito: boolean;
  dataAceite: string;
  versaoAceita?: string;
  ipAddress?: string;
  userAgent?: string;
  dataCriacao: string;
}

export interface AceitePolitica {
  id: number;
  politicaId: number;
  versao: string;
  titulo: string;
  aceito: boolean;
  dataAceite: string;
  versaoAceita?: string;
  ipAddress?: string;
  userAgent?: string;
  dataCriacao: string;
}

// Tipos para requisições de aceite
export interface AceitarTermoRequest {
  versao: string;
  aceito: boolean;
}

export interface AceitarPoliticaRequest {
  versao: string;
  aceito: boolean;
}

// Tipos para consentimentos granulares (futuros)
export interface ConfiguracaoConsentimento {
  tipo: string;
  titulo: string;
  descricao: string;
  obrigatorio: boolean;
  finalidade: string;
  categoria: 'necessario' | 'funcionalidade' | 'analytics' | 'marketing';
}

// Tipos para respostas da API
export interface LGPDResponse {
  message: string;
  timestamp: string;
}

export interface VerificacaoAceiteResponse {
  aceitou: boolean;
  timestamp: string;
}
