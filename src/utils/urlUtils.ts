// src/utils/urlUtils.ts - Utilitários para manipular parâmetros da URL
export const urlUtils = {
  /**
   * Codifica um parâmetro para ser usado na URL
   * Substitui espaços por hífens e faz URL encoding
   */
  encodeUrlParam: (param: string): string => {
    if (!param) return '';
    return encodeURIComponent(param.replace(/\s+/g, '-').toLowerCase());
  },

  /**
   * Decodifica um parâmetro da URL
   * Substitui hífens por espaços e faz URL decoding
   */
  decodeUrlParam: (param: string | undefined): string => {
    if (!param) return '';
    try {
      return decodeURIComponent(param.replace(/-/g, ' '));
    } catch (error) {
      console.error('Erro ao decodificar parâmetro da URL:', error);
      return param.replace(/-/g, ' ');
    }
  },

  /**
   * Gera uma URL completa para agendamento público
   */
  generatePublicSchedulingUrl: (
    baseUrl: string,
    empresaId: number,
    nomeEmpresa?: string,
    telefoneEmpresa?: string
  ): string => {
    if (nomeEmpresa && telefoneEmpresa) {
      const nomeEncoded = urlUtils.encodeUrlParam(nomeEmpresa);
      const telefoneEncoded = urlUtils.encodeUrlParam(telefoneEmpresa);
      return `${baseUrl}/agendamento/${empresaId}/${nomeEncoded}/${telefoneEncoded}`;
    } else if (nomeEmpresa) {
      const nomeEncoded = urlUtils.encodeUrlParam(nomeEmpresa);
      const telefoneEncoded = urlUtils.encodeUrlParam('sem-telefone');
      return `${baseUrl}/agendamento/${empresaId}/${nomeEncoded}/${telefoneEncoded}`;
    } else {
      // Fallback para URL simples
      return `${baseUrl}/agendamento/${empresaId}`;
    }
  },

  /**
   * Extrai informações da empresa dos parâmetros da URL
   */
  extractEmpresaInfoFromParams: (params: {
    empresaId?: string;
    nomeEmpresa?: string;
    telefoneEmpresa?: string;
  }) => {
    return {
      id: params.empresaId || '1',
      nomeFromUrl: params.nomeEmpresa ? urlUtils.decodeUrlParam(params.nomeEmpresa) : null,
      telefoneFromUrl: params.telefoneEmpresa && params.telefoneEmpresa !== 'sem-telefone' 
        ? urlUtils.decodeUrlParam(params.telefoneEmpresa) : null
    };
  },

  /**
   * Valida se um parâmetro de URL é válido
   */
  isValidUrlParam: (param: string | undefined): boolean => {
    return !!(param && param.length > 0 && param !== 'undefined' && param !== 'null');
  },

  /**
   * Limpa caracteres especiais para uso em URL
   */
  sanitizeForUrl: (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .toLowerCase()
      .trim();
  },

  /**
   * Restaura texto de URL sanitizada
   */
  restoreFromUrl: (urlText: string): string => {
    return urlText
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

/**
 * Interface para informações da empresa extraídas da URL
 */
export interface EmpresaUrlInfo {
  id: string;
  nomeFromUrl: string | null;
  telefoneFromUrl: string | null;
}

/**
 * Hook para extrair informações da empresa da URL
 */
export const useEmpresaFromUrl = (params: {
  empresaId?: string;
  nomeEmpresa?: string;
  telefoneEmpresa?: string;
}): EmpresaUrlInfo => {
  return urlUtils.extractEmpresaInfoFromParams(params);
};

/**
 * Utilitários para validação de parâmetros de agendamento público
 */
export const agendamentoUrlValidation = {
  /**
   * Valida se os parâmetros mínimos estão presentes
   */
  validateRequiredParams: (empresaId?: string): boolean => {
    return !!(empresaId && !isNaN(Number(empresaId)) && Number(empresaId) > 0);
  },

  /**
   * Valida formato do telefone na URL
   */
  validateTelefoneParam: (telefone?: string): boolean => {
    if (!telefone || telefone === 'sem-telefone') return true;
    
    const decoded = urlUtils.decodeUrlParam(telefone);
    // Validação básica - deve ter pelo menos formato de telefone brasileiro
    const phoneRegex = /^(\+55\s?)?\d{2}\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(decoded.replace(/\s+/g, ' '));
  },

  /**
   * Valida formato do nome da empresa na URL
   */
  validateNomeParam: (nome?: string): boolean => {
    if (!nome) return true;
    
    const decoded = urlUtils.decodeUrlParam(nome);
    return decoded.length >= 2 && decoded.length <= 100;
  },

  /**
   * Gera mensagem de erro para parâmetros inválidos
   */
  getValidationErrorMessage: (empresaId?: string, nome?: string, telefone?: string): string | null => {
    if (!agendamentoUrlValidation.validateRequiredParams(empresaId)) {
      return 'ID da empresa inválido no link.';
    }
    
    if (!agendamentoUrlValidation.validateNomeParam(nome)) {
      return 'Nome da empresa inválido no link.';
    }
    
    if (!agendamentoUrlValidation.validateTelefoneParam(telefone)) {
      return 'Telefone da empresa inválido no link.';
    }
    
    return null;
  }
};

/**
 * Constantes para URLs de agendamento
 */
export const URL_CONSTANTS = {
  // Placeholder para telefone não informado
  NO_PHONE_PLACEHOLDER: 'sem-telefone',
  
  // Tamanhos máximos para parâmetros
  MAX_COMPANY_NAME_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  
  // Caracteres permitidos em nomes de empresa para URL
  ALLOWED_NAME_CHARS: /^[a-zA-Z0-9\s\-\.]+$/,
  
  // Padrões de validação
  PHONE_PATTERN: /^(\+55\s?)?\d{2}\s?\d{4,5}-?\d{4}$/,
  EMPRESA_ID_PATTERN: /^\d+$/
};

/**
 * Classe para gerenciar URLs de agendamento público
 */
export class PublicSchedulingUrlManager {
  private baseUrl: string;

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Gera URL completa para agendamento
   */
  generateUrl(empresaId: number, nomeEmpresa?: string, telefoneEmpresa?: string): string {
    return urlUtils.generatePublicSchedulingUrl(this.baseUrl, empresaId, nomeEmpresa, telefoneEmpresa);
  }

  /**
   * Gera URL com validação
   */
  generateValidatedUrl(empresaId: number, nomeEmpresa?: string, telefoneEmpresa?: string): {
    url: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Validar e sanitizar nome
    let cleanNome = nomeEmpresa;
    if (nomeEmpresa) {
      if (nomeEmpresa.length > URL_CONSTANTS.MAX_COMPANY_NAME_LENGTH) {
        cleanNome = nomeEmpresa.substring(0, URL_CONSTANTS.MAX_COMPANY_NAME_LENGTH);
        warnings.push(`Nome da empresa foi truncado para ${URL_CONSTANTS.MAX_COMPANY_NAME_LENGTH} caracteres.`);
      }
      
      if (!URL_CONSTANTS.ALLOWED_NAME_CHARS.test(nomeEmpresa)) {
        warnings.push('Nome da empresa contém caracteres que podem não ser exibidos corretamente na URL.');
      }
    }
    
    // Validar telefone
    if (telefoneEmpresa && !URL_CONSTANTS.PHONE_PATTERN.test(telefoneEmpresa)) {
      warnings.push('Formato de telefone pode não ser reconhecido corretamente.');
    }
    
    return {
      url: this.generateUrl(empresaId, cleanNome, telefoneEmpresa),
      warnings
    };
  }

  /**
   * Parse URL existente para extrair parâmetros
   */
  parseUrl(url: string): {
    empresaId: number | null;
    nomeEmpresa: string | null;
    telefoneEmpresa: string | null;
    isValid: boolean;
    error?: string;
  } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Formato esperado: /agendamento/{empresaId}/{nome}/{telefone}
      if (pathParts[0] !== 'agendamento') {
        return {
          empresaId: null,
          nomeEmpresa: null,
          telefoneEmpresa: null,
          isValid: false,
          error: 'URL não é de agendamento'
        };
      }
      
      const empresaId = pathParts[1] ? parseInt(pathParts[1]) : null;
      const nomeEmpresa = pathParts[2] ? urlUtils.decodeUrlParam(pathParts[2]) : null;
      const telefoneEmpresa = pathParts[3] && pathParts[3] !== URL_CONSTANTS.NO_PHONE_PLACEHOLDER 
        ? urlUtils.decodeUrlParam(pathParts[3]) : null;
      
      if (!empresaId || isNaN(empresaId)) {
        return {
          empresaId: null,
          nomeEmpresa,
          telefoneEmpresa,
          isValid: false,
          error: 'ID da empresa inválido'
        };
      }
      
      return {
        empresaId,
        nomeEmpresa,
        telefoneEmpresa,
        isValid: true
      };
    } catch (error) {
      return {
        empresaId: null,
        nomeEmpresa: null,
        telefoneEmpresa: null,
        isValid: false,
        error: 'URL malformada'
      };
    }
  }
}

/**
 * Função de conveniência para gerar URLs de agendamento
 */
export const createSchedulingUrl = (
  empresaId: number, 
  nomeEmpresa?: string, 
  telefoneEmpresa?: string
): string => {
  const manager = new PublicSchedulingUrlManager();
  return manager.generateUrl(empresaId, nomeEmpresa, telefoneEmpresa);
};

/**
 * Função para validar parâmetros de URL de agendamento
 */
export const validateSchedulingUrlParams = (params: {
  empresaId?: string;
  nomeEmpresa?: string;
  telefoneEmpresa?: string;
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validar ID da empresa
  if (!params.empresaId || !URL_CONSTANTS.EMPRESA_ID_PATTERN.test(params.empresaId)) {
    errors.push('ID da empresa é obrigatório e deve ser um número válido.');
  }
  
  // Validar nome (opcional)
  if (params.nomeEmpresa) {
    const decoded = urlUtils.decodeUrlParam(params.nomeEmpresa);
    if (decoded.length > URL_CONSTANTS.MAX_COMPANY_NAME_LENGTH) {
      warnings.push(`Nome da empresa muito longo (máximo ${URL_CONSTANTS.MAX_COMPANY_NAME_LENGTH} caracteres).`);
    }
  }
  
  // Validar telefone (opcional)
  if (params.telefoneEmpresa && params.telefoneEmpresa !== URL_CONSTANTS.NO_PHONE_PLACEHOLDER) {
    const decoded = urlUtils.decodeUrlParam(params.telefoneEmpresa);
    if (!URL_CONSTANTS.PHONE_PATTERN.test(decoded)) {
      warnings.push('Formato de telefone pode estar incorreto.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};