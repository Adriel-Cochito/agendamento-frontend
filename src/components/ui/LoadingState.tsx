// src/components/ui/LoadingState.tsx - Loading estável para agendamento público
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  type?: 'initial' | 'data' | 'submit';
  className?: string;
}

export function LoadingState({ message, type = 'data', className = '' }: LoadingStateProps) {
  const getLoadingContent = () => {
    switch (type) {
      case 'initial':
        return {
          icon: Calendar,
          message: message || 'Carregando informações...',
          description: 'Preparando seu agendamento'
        };
      case 'data':
        return {
          icon: Clock,
          message: message || 'Buscando horários...',
          description: 'Verificando disponibilidade'
        };
      case 'submit':
        return {
          icon: User,
          message: message || 'Confirmando agendamento...',
          description: 'Processando seus dados'
        };
      default:
        return {
          icon: Calendar,
          message: message || 'Carregando...',
          description: ''
        };
    }
  };

  const { icon: Icon, message: loadingMessage, description } = getLoadingContent();

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Ícone animado */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          {/* Pulso animado */}
          <div className="absolute inset-0 w-16 h-16 bg-primary-400 rounded-2xl animate-ping opacity-20"></div>
        </div>

        {/* Mensagem principal */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {loadingMessage}
        </h3>

        {/* Descrição */}
        {description && (
          <p className="text-sm text-gray-600 mb-6">
            {description}
          </p>
        )}

        {/* Barra de progresso animada */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Pontos de loading */}
        <div className="flex items-center justify-center space-x-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary-500 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Componente específico para loading inicial da página
export function InitialLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <LoadingState 
        type="initial" 
        message="Preparando seu agendamento"
        className="max-w-md mx-auto"
      />
    </div>
  );
}

// Componente para loading inline (dentro de cards)
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 text-sm">
          {message || 'Carregando...'}
        </span>
      </div>
    </div>
  );
}