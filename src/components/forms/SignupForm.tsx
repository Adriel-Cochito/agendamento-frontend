import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Building2, Phone, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { empresasApi } from '@/api/empresas';
import { useAuthStore } from '@/store/authStore';
import { maskCNPJ, maskPhone, unmaskCNPJ } from '@/lib/masks';

const signupSchema = z.object({
  // Dados da Empresa
  nomeEmpresa: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  emailEmpresa: z.string().email('Email da empresa inválido'),
  telefoneEmpresa: z.string().regex(
    /^\+\d{2}\s\d{2}\s\d{5}-\d{4}$/,
    'Telefone inválido. Formato: +55 31 99999-8888'
  ),
  cnpjEmpresa: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 14;
  }, 'CNPJ inválido. Deve ter 14 dígitos'),
  nomeUnicoEmpresa: z.string()
    .min(3, 'Nome único deve ter no mínimo 3 caracteres')
    .max(50, 'Nome único deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9]+$/, 'Nome único deve conter apenas letras minúsculas e números, sem espaços ou caracteres especiais'),
  
  // Dados do Profissional
  nomeProfissional: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  emailProfissional: z.string().email('Email inválido'),
  senhaProfissional: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.senhaProfissional === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

// Utilitário para tratar erros da API
interface ErrorResult {
  message: string;
  type: 'email_exists' | 'validation' | 'server' | 'network' | 'unknown';
  suggestion?: string;
  traceId?: string;
}

function handleApiError(error: any): ErrorResult {
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
  
  // Fallback para estrutura antiga ou outros formatos
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

export function SignupForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'email_exists' | 'validation' | 'server' | 'network' | 'unknown' | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    control,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      cnpjEmpresa: '',
      telefoneEmpresa: '+55 ',
    }
  });

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['nomeEmpresa', 'emailEmpresa', 'telefoneEmpresa', 'cnpjEmpresa'] as const
      : ['nomeProfissional', 'emailProfissional', 'senhaProfissional', 'confirmPassword'] as const;
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError('');
    setErrorType(null);
    setErrorSuggestion('');

    try {
      // Formatar CNPJ para o padrão esperado pela API
      const formattedCNPJ = data.cnpjEmpresa 
        ? maskCNPJ(data.cnpjEmpresa)
        : null;

      // Criar empresa com owner
      await empresasApi.createWithOwner({
        nomeEmpresa: data.nomeEmpresa,
        emailEmpresa: data.emailEmpresa,
        telefoneEmpresa: data.telefoneEmpresa,
        cnpjEmpresa: formattedCNPJ || '',
        nomeUnicoEmpresa: data.nomeUnicoEmpresa,
        ativoEmpresa: true,
        nomeProfissional: data.nomeProfissional,
        emailProfissional: data.emailProfissional,
        senhaProfissional: data.senhaProfissional,
        perfilProfissional: 'OWNER',
        ativoProfissional: true,
        googleAccessToken: null,
        googleRefreshToken: null,
      });

      setSuccess(true);

      // Fazer login automaticamente
      setTimeout(async () => {
        try {
          await login({
            email: data.emailProfissional,
            password: data.senhaProfissional,
          });
          navigate('/inicio');
        } catch (loginError) {
          // Se falhar o login automático, redireciona para a tela de login
          navigate('/login');
        }
      }, 1500);

    } catch (err: any) {
      // Usar o utilitário para tratar o erro
      const errorResult = handleApiError(err);
      
      setError(errorResult.message);
      setErrorType(errorResult.type);
      setErrorSuggestion(errorResult.suggestion || '');
      
      // Log para debug (pode remover em produção)
      if (errorResult.traceId) {
        console.log(`Erro capturado - TraceId: ${errorResult.traceId}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para mostrar erro com estilo específico
  const ErrorDisplay = () => {
    if (!error) return null;

    const getErrorIcon = () => {
      switch (errorType) {
        case 'email_exists':
          return <Mail className="w-5 h-5 text-amber-500" />;
        case 'validation':
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'network':
          return <AlertTriangle className="w-5 h-5 text-blue-500" />;
        default:
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
      }
    };

    const getErrorStyle = () => {
      switch (errorType) {
        case 'email_exists':
          return 'bg-amber-50 border-amber-200 text-amber-800';
        case 'validation':
          return 'bg-red-50 border-red-200 text-red-800';
        case 'network':
          return 'bg-blue-50 border-blue-200 text-blue-800';
        default:
          return 'bg-red-50 border-red-200 text-red-800';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border flex items-start space-x-3 ${getErrorStyle()}`}
      >
        {getErrorIcon()}
        <div className="flex-1">
          <p className="text-sm">{error}</p>
          {errorSuggestion && (
            <p className="text-sm mt-2 font-medium">{errorSuggestion}</p>
          )}
          {errorType === 'email_exists' && (
            <div className="mt-3">
              <Link 
                to="/login" 
                className="text-sm font-medium hover:underline inline-flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                Já tem conta? Faça login aqui
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Conta criada com sucesso!</h3>
        <p className="text-gray-600">Redirecionando para o painel...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            2
          </div>
        </div>
      </div>

      {currentStep === 1 ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h3>
          
          <div>
            <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <Input
              id="nomeEmpresa"
              type="text"
              placeholder="Tech Solutions"
              icon={Building2}
              error={errors.nomeEmpresa?.message}
              {...register('nomeEmpresa')}
            />
          </div>

          <div>
            <label htmlFor="emailEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              Email da Empresa
            </label>
            <Input
              id="emailEmpresa"
              type="email"
              placeholder="contato@empresa.com"
              icon={Mail}
              error={errors.emailEmpresa?.message}
              {...register('emailEmpresa')}
            />
          </div>

          <div>
            <label htmlFor="telefoneEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <Controller
              name="telefoneEmpresa"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  id="telefoneEmpresa"
                  type="tel"
                  placeholder="+55 31 99999-8888"
                  icon={Phone}
                  error={errors.telefoneEmpresa?.message}
                  mask={maskPhone}
                  value={field.value}
                  onChange={(masked) => field.onChange(masked)}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="cnpjEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ (opcional)
            </label>
            <Controller
              name="cnpjEmpresa"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  id="cnpjEmpresa"
                  type="text"
                  placeholder="12.345.678/0001-99"
                  icon={FileText}
                  error={errors.cnpjEmpresa?.message}
                  mask={maskCNPJ}
                  unmask={unmaskCNPJ}
                  value={field.value || ''}
                  onChange={(masked) => field.onChange(masked)}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="nomeUnicoEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
              Nome único para agendamentos
              <span className="text-xs text-gray-500 block mt-1">
                Será usado no link: agendasim/seunomedaempresa
              </span>
            </label>
            <Input
              id="nomeUnicoEmpresa"
              type="text"
              placeholder="salaodebeleza"
              icon={Building2}
              error={errors.nomeUnicoEmpresa?.message}
              {...register('nomeUnicoEmpresa')}
              style={{ textTransform: 'lowercase' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Apenas letras minúsculas e números, sem espaços ou caracteres especiais
            </p>
          </div>

          <Button
            type="button"
            onClick={handleNextStep}
            className="w-full"
            size="lg"
          >
            Próximo
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Proprietário</h3>
          
          <div>
            <label htmlFor="nomeProfissional" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <Input
              id="nomeProfissional"
              type="text"
              placeholder="João Silva"
              icon={User}
              error={errors.nomeProfissional?.message}
              {...register('nomeProfissional')}
            />
          </div>

          <div>
            <label htmlFor="emailProfissional" className="block text-sm font-medium text-gray-700 mb-1">
              Email Pessoal
            </label>
            <Input
              id="emailProfissional"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              error={errors.emailProfissional?.message}
              {...register('emailProfissional')}
            />
          </div>

          <div>
            <label htmlFor="senhaProfissional" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Input
                id="senhaProfissional"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.senhaProfissional?.message}
                {...register('senhaProfissional')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[22px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[22px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Componente de erro melhorado */}
          <ErrorDisplay />

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
              size="lg"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              loading={isLoading}
            >
              Criar Conta
            </Button>
          </div>
        </motion.div>
      )}

      {currentStep === 1 && (
        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Faça login
          </Link>
        </p>
      )}
    </form>
  );
}