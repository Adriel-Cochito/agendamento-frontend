import { useState, useEffect, useRef } from 'react';
import { useLGPD } from '@/hooks/useLGPD';
import { useAuthStore } from '@/store/authStore';
import { ForcedAcceptanceModal } from './ForcedAcceptanceModal';

interface LGPDGuardProps {
  children: React.ReactNode;
}

export function LGPDGuard({ children }: LGPDGuardProps) {
  const { termoAtual, politicaAtual, aceitesTermos, aceitesPoliticas, loading, initialized, carregarDados } = useLGPD();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Só verificar se o usuário estiver autenticado
    if (!user) {
      hasChecked.current = false;
      return;
    }

    // Só verificar se não tiver verificado ainda e não estiver carregando
    if (hasChecked.current || isChecking) return;
    
    // Se não temos dados e não foram inicializados, carregar primeiro
    if (!initialized && !loading) {
      setIsChecking(true);
      carregarDados().finally(() => {
        setIsChecking(false);
      });
      return;
    }
    
    // Se temos todos os dados necessários, verificar localmente
    if (termoAtual && politicaAtual) {
      hasChecked.current = true;
      
      // Verificar aceite localmente
      const termoAceito = aceitesTermos.some(aceite => 
        aceite.versao === termoAtual.versao && aceite.aceito
      );
      const politicaAceita = aceitesPoliticas.some(aceite => 
        aceite.versao === politicaAtual.versao && aceite.aceito
      );
      
      if (!termoAceito || !politicaAceita) {
        setShowModal(true);
      }
    }
  }, [user, termoAtual, politicaAtual, aceitesTermos, aceitesPoliticas, initialized, loading, carregarDados, isChecking]);

  const handleComplete = () => {
    setShowModal(false);
    // Resetar o estado para permitir nova verificação se necessário
    hasChecked.current = false;
  };

  // Mostrar loading enquanto verifica
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando aceites LGPD...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <ForcedAcceptanceModal 
        isOpen={showModal} 
        onComplete={handleComplete} 
      />
    </>
  );
}
