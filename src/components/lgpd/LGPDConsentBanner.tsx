import { useState, useEffect } from 'react';
import { useLGPD } from '@/hooks/useLGPD';
import { Button } from '@/components/ui/Button';
import { Shield, X, AlertTriangle } from 'lucide-react';

export function LGPDConsentBanner() {
  const { 
    termoAtual, 
    politicaAtual, 
    aceitesTermos,
    aceitesPoliticas,
    aceitarTermo, 
    aceitarPolitica
  } = useLGPD();
  const [showBanner, setShowBanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aceiteStatus, setAceiteStatus] = useState({
    termoAceito: false,
    politicaAceita: false
  });

  useEffect(() => {
    if (!termoAtual || !politicaAtual) return;

    // Verificar aceite localmente usando dados do contexto
    const termoAceito = aceitesTermos.some(aceite => 
      aceite.versao === termoAtual.versao && aceite.aceito
    );
    const politicaAceita = aceitesPoliticas.some(aceite => 
      aceite.versao === politicaAtual.versao && aceite.aceito
    );
    
    setAceiteStatus({
      termoAceito,
      politicaAceita
    });

    // Mostrar banner se algum documento não foi aceito
    if (!termoAceito || !politicaAceita) {
      setShowBanner(true);
    }
  }, [termoAtual, politicaAtual, aceitesTermos, aceitesPoliticas]);

  const handleAceitarTodos = async () => {
    if (!termoAtual || !politicaAtual) return;

    setIsProcessing(true);

    try {
      await Promise.all([
        aceitarTermo({ versao: termoAtual.versao, aceito: true }),
        aceitarPolitica({ versao: politicaAtual.versao, aceito: true })
      ]);
      
      setAceiteStatus({
        termoAceito: true,
        politicaAceita: true
      });
      
      setShowBanner(false);
    } catch (error) {
      console.error('Erro ao aceitar documentos:', error);
      alert('Erro ao aceitar os documentos. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejeitar = () => {
    setShowBanner(false);
  };

  if (!showBanner || !termoAtual || !politicaAtual) {
    return null;
  }

  const documentosPendentes = [];
  if (!aceiteStatus.termoAceito) documentosPendentes.push('Termos de Uso');
  if (!aceiteStatus.politicaAceita) documentosPendentes.push('Política de Privacidade');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Atualização dos Documentos LGPD
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Você precisa aceitar os seguintes documentos para continuar usando a plataforma:
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {documentosPendentes.map((documento, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {documento}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleAceitarTodos}
                size="sm"
                className="w-full sm:w-auto"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Aceitar e Continuar'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRejeitar}
                size="sm"
                className="w-full sm:w-auto"
                disabled={isProcessing}
              >
                Rejeitar
              </Button>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={handleRejeitar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}