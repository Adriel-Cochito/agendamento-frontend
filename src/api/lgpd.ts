import { apiClient } from './client';
import { 
  TermoUso, 
  PoliticaPrivacidade, 
  AceiteTermo, 
  AceitePolitica, 
  AceitarTermoRequest, 
  AceitarPoliticaRequest,
  LGPDResponse,
  VerificacaoAceiteResponse
} from '@/types/lgpd';

// Função auxiliar para carregar documentos HTML
const loadHtmlDocument = async (path: string): Promise<{ versao: string; titulo: string; conteudo: string }> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Erro ao carregar documento: ${response.status}`);
    }
    const html = await response.text();

    // Extrair versão e título do HTML
    const titleMatch = html.match(/<title>([^<]+)\s+v(\d+\.\d+(\.\d+)?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

    let titulo = "Documento";
    let versao = "1.0";

    if (titleMatch) {
      titulo = titleMatch[1].trim();
      versao = titleMatch[2];
    } else if (h1Match) {
      const h1TitleMatch = h1Match[1].match(/(.+?)\s+v(\d+\.\d+(\.\d+)?)/);
      if (h1TitleMatch) {
        titulo = h1TitleMatch[1].trim();
        versao = h1TitleMatch[2];
      } else {
        titulo = h1Match[1].trim();
      }
    }

    return { versao, titulo, conteudo: html };
  } catch (error) {
    console.error('Erro ao carregar documento HTML:', error);
    // Retornar conteúdo padrão em caso de erro
    return {
      versao: "1.0",
      titulo: "Documento",
      conteudo: "<html><body><h1>Documento</h1><p>Conteúdo não disponível no momento.</p></body></html>"
    };
  }
};

// Funções auxiliares para buscar documentos estáticos
const getTermoAtivo = async (): Promise<TermoUso> => {
  const { versao, titulo, conteudo } = await loadHtmlDocument('/lgpd/termos-uso-v1.0.html');
  return {
    versao,
    titulo,
    conteudo,
    dataAtualizacao: '2025-01-28'
  };
};

const getPoliticaAtiva = async (): Promise<PoliticaPrivacidade> => {
  const { versao, titulo, conteudo } = await loadHtmlDocument('/lgpd/politica-privacidade-v1.0.html');
  return {
    versao,
    titulo,
    conteudo,
    dataAtualizacao: '2025-01-28'
  };
};

export const lgpdApi = {
  // Termos de Uso
  getTermoAtivo: async (): Promise<TermoUso> => {
    return await getTermoAtivo();
  },

  aceitarTermo: async (request: AceitarTermoRequest): Promise<LGPDResponse> => {
    const response = await apiClient.post(`/api/lgpd/termos/aceitar?versao=${request.versao}&aceito=${request.aceito}`);
    return response.data;
  },

  getMeusAceitesTermos: async (): Promise<AceiteTermo[]> => {
    const response = await apiClient.get('/api/lgpd/termos/meus-aceites');
    return response.data;
  },

  verificarAceiteTermo: async (): Promise<VerificacaoAceiteResponse> => {
    const response = await apiClient.get('/api/lgpd/termos/verificar-aceite');
    return response.data;
  },

  // Políticas de Privacidade
  getPoliticaAtiva: async (): Promise<PoliticaPrivacidade> => {
    return await getPoliticaAtiva();
  },

  aceitarPolitica: async (request: AceitarPoliticaRequest): Promise<LGPDResponse> => {
    const response = await apiClient.post(`/api/lgpd/politicas/aceitar?versao=${request.versao}&aceito=${request.aceito}`);
    return response.data;
  },

  getMeusAceitesPoliticas: async (): Promise<AceitePolitica[]> => {
    const response = await apiClient.get('/api/lgpd/politicas/meus-aceites');
    return response.data;
  },

  verificarAceitePolitica: async (): Promise<VerificacaoAceiteResponse> => {
    const response = await apiClient.get('/api/lgpd/politicas/verificar-aceite');
    return response.data;
  }
};