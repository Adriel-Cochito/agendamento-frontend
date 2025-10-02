import { useState, useEffect } from 'react';
import { useLGPD } from '@/hooks/useLGPD';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Shield, AlertTriangle, LogOut, ExternalLink, FileText, X } from 'lucide-react';
import { openDocumentInNewTab } from '@/utils/lgpdDocumentUtils';

interface ForcedAcceptanceModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ForcedAcceptanceModal({ isOpen, onComplete }: ForcedAcceptanceModalProps) {
  const { 
    termoAtual, 
    politicaAtual, 
    aceitarTermo, 
    aceitarPolitica,
    verificarAceiteTermo,
    verificarAceitePolitica
  } = useLGPD();
  const { logout } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [aceiteStatus, setAceiteStatus] = useState({
    termoAceito: false,
    politicaAceita: false
  });

  // Verificar status dos aceites quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const verificarAceites = async () => {
        try {
          const [termoAceito, politicaAceita] = await Promise.all([
            verificarAceiteTermo(),
            verificarAceitePolitica()
          ]);
          
          setAceiteStatus({
            termoAceito,
            politicaAceita
          });
        } catch (error) {
          console.error('Erro ao verificar aceites:', error);
        }
      };

      verificarAceites();
    }
  }, [isOpen, verificarAceiteTermo, verificarAceitePolitica]);

  const handleAceitarTodos = async () => {
    if (!termoAtual || !politicaAtual) return;

    setIsProcessing(true);

    try {
      // Aceitar termos
      await aceitarTermo({ versao: termoAtual.versao, aceito: true });

      // Aceitar política
      await aceitarPolitica({ versao: politicaAtual.versao, aceito: true });

      // Atualizar status local
      setAceiteStatus({
        termoAceito: true,
        politicaAceita: true
      });

      onComplete();
    } catch (error) {
      console.error('Erro ao aceitar termos e políticas:', error);
      alert('Erro ao aceitar os documentos. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejeitar = async () => {
    if (!termoAtual || !politicaAtual) return;

    setIsProcessing(true);

    try {
      // Rejeitar termos
      await aceitarTermo({ versao: termoAtual.versao, aceito: false });

      // Rejeitar política
      await aceitarPolitica({ versao: politicaAtual.versao, aceito: false });

      // Fazer logout
      logout();
    } catch (error) {
      console.error('Erro ao rejeitar termos e políticas:', error);
      alert('Erro ao processar a rejeição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewTermos = () => {
    if (termoAtual) {
      openDocumentInNewTab(termoAtual, 'termo');
    }
  };

  const handleViewPolitica = () => {
    if (politicaAtual) {
      openDocumentInNewTab(politicaAtual, 'politica');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aceite Obrigatório
            </h2>
            <p className="text-gray-600">
              Para continuar usando o sistema, você deve aceitar nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>

          {/* Status dos Aceites */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Atual dos Aceites</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 ${aceiteStatus.termoAceito ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center space-x-3">
                  {aceiteStatus.termoAceito ? (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">Termos de Uso</h4>
                    <p className="text-sm text-gray-600">
                      {aceiteStatus.termoAceito ? 'Aceito' : 'Não aceito'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${aceiteStatus.politicaAceita ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center space-x-3">
                  {aceiteStatus.politicaAceita ? (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">Política de Privacidade</h4>
                    <p className="text-sm text-gray-600">
                      {aceiteStatus.politicaAceita ? 'Aceita' : 'Não aceita'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="space-y-4 mb-6">
            {/* Termos de Uso */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Termos de Uso
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Versão {termoAtual?.versao} - Última atualização: {termoAtual?.dataAtualizacao}
                  </p>
                  <p className="text-sm text-gray-500">
                    Leia os termos completos antes de aceitar
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewTermos}
                  className="ml-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Completo
                </Button>
              </div>
            </div>

            {/* Política de Privacidade */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Política de Privacidade
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Versão {politicaAtual?.versao} - Última atualização: {politicaAtual?.dataAtualizacao}
                  </p>
                  <p className="text-sm text-gray-500">
                    Leia a política completa antes de aceitar
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewPolitica}
                  className="ml-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Completo
                </Button>
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Importante
                </h4>
                <p className="text-sm text-yellow-800 mb-2">
                  Ao aceitar, você concorda com o tratamento dos seus dados conforme descrito nos documentos.
                  Você pode revogar seu consentimento a qualquer momento através da área LGPD.
                </p>
                <p className="text-xs text-yellow-700">
                  <strong>Nota:</strong> A rejeição dos documentos resultará no encerramento de sua sessão e impedirá o uso da plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAceitarTodos}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processando...' : 'Aceitar e Continuar'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRejeitar}
              disabled={isProcessing}
              className="flex-1 sm:flex-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Rejeitar e Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}