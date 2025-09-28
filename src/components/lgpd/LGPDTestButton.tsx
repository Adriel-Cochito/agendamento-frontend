import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ForcedAcceptanceModal } from './ForcedAcceptanceModal';

/**
 * Componente de teste para forçar o modal de aceite LGPD
 * Use apenas para desenvolvimento e testes
 */
export function LGPDTestButton() {
  const [showModal, setShowModal] = useState(false);

  const handleTestModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <Button
        onClick={handleTestModal}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white hover:bg-red-600"
      >
        Testar Modal LGPD
      </Button>
      
      <ForcedAcceptanceModal 
        isOpen={showModal} 
        onComplete={() => setShowModal(false)} 
      />
    </>
  );
}
