export interface ApiError {
  timestamp: string;
  status: number;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  path: string;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: any): never {
  console.error('API Error:', error);

  // Se for um erro de resposta da API
  if (error.response?.data?.errors) {
    const apiError = error.response.data as ApiError;
    const firstError = apiError.errors[0];
    
    throw new AppError(
      firstError.message,
      apiError.status,
      firstError.code,
      firstError.field
    );
  }

  // Se for um erro de rede
  if (error.code === 'ERR_NETWORK') {
    throw new AppError(
      'Erro de conexão. Verifique sua internet e tente novamente.',
      0,
      'NETWORK_ERROR'
    );
  }

  // Se for um erro genérico com mensagem
  if (error.response?.data?.message) {
    throw new AppError(
      error.response.data.message,
      error.response?.status || 500
    );
  }

  // Erro desconhecido
  throw new AppError(
    'Ocorreu um erro inesperado. Tente novamente.',
    error.response?.status || 500
  );
}

export function getErrorMessage(error: any): string {
  // Novo formato do backend: { success: false, error: { message: "..." } }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  // Formato antigo - manter compatibilidade
  if (error.response?.data?.errors?.[0]?.message) {
    return error.response.data.errors[0].message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Ocorreu um erro inesperado';
}