// src/utils/apiErrorHandler.ts

export interface ApiErrorResponse {
  success: boolean;
  error: {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    method: string;
    traceId: string;
    details: {
      code: string;
      suggestion: string;
    };
  };
}

export interface ErrorResult {
  message: string;
  type: 'email_exists' | 'validation' | 'server' | 'network' | 'unknown';
  suggestion?: string;
  traceId?: string;
}

/**
 * Trata erros da API padronizando as mensagens
 */
export function handleApiError(error: any): ErrorResult {
  console.log('Tratando erro da API:', error);
  
  // Erro de rede ou sem resposta
  if (!error.response) {
    return {
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
      type: 'network'
    };
  }

  const response = error.response;
  
  // Estrutura nova do GlobalExceptionHandler
  if (response.data?.error) {
    const errorData = response.data.error;
    
    switch (errorData.details?.code) {
      case 'EMAIL_ALREADY_EXISTS':
        return {
          message: errorData.message,
          type: 'email_exists',
          suggestion: errorData.details.suggestion,
          traceId: errorData.traceId
        };
        
      case 'VALIDATION_ERROR':
        return {
          message: errorData.message,
          type: 'validation',
          suggestion: errorData.details.suggestion,
          traceId: errorData.traceId
        };
        
      default:
        return {
          message: errorData.message || 'Erro interno do servidor',
          type: 'server',
          suggestion: errorData.details?.suggestion,
          traceId: errorData.traceId
        };
    }
  }
  
  // Estrutura antiga ou outros formatos
  if (response.data?.message) {
    return {
      message: response.data.message,
      type: 'unknown'
    };
  }
  
  // Status específicos
  switch (response.status) {
    case 400:
      return {
        message: 'Dados inválidos. Verifique os campos e tente novamente.',
        type: 'validation'
      };
    case 409:
      return {
        message: 'Conflito de dados. O email pode já estar em uso.',
        type: 'email_exists'
      };
    case 500:
      return {
        message: 'Erro interno do servidor. Tente novamente em alguns instantes.',
        type: 'server'
      };
    default:
      return {
        message: 'Erro inesperado. Tente novamente.',
        type: 'unknown'
      };
  }
}

/**
 * Hook para usar o tratamento de erros em componentes React
 */
export function useApiErrorHandler() {
  return {
    handleError: handleApiError,
    
    // Funções específicas para tipos de erro
    isEmailExists: (error: any) => handleApiError(error).type === 'email_exists',
    isValidation: (error: any) => handleApiError(error).type === 'validation',
    isServerError: (error: any) => handleApiError(error).type === 'server',
  };
}