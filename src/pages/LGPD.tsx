import { useState, useEffect } from 'react';
import { useLGPD } from '@/hooks/useLGPD';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, FileText, Eye, CheckCircle, XCircle, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { openDocumentInNewTab } from '@/utils/lgpdDocumentUtils';

export function LGPD() {
  const {
    termoAtual,
    politicaAtual,
    aceitesTermos,
    aceitesPoliticas,
    loading,
    error,
    aceitarTermo,
    aceitarPolitica
  } = useLGPD();

  const [showTermosModal, setShowTermosModal] = useState(false);
  const [showPoliticaModal, setShowPoliticaModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aceiteStatus, setAceiteStatus] = useState({
    termoAceito: false,
    politicaAceita: false
  });

  // Verificar status dos aceites localmente
  useEffect(() => {
    if (!termoAtual || !politicaAtual) return;

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
  }, [termoAtual, politicaAtual, aceitesTermos, aceitesPoliticas]);

  const handleAceitarTermo = async (aceito: boolean) => {
    if (!termoAtual) return;

    setIsProcessing(true);
    try {
      await aceitarTermo({ versao: termoAtual.versao, aceito });
      setAceiteStatus(prev => ({ ...prev, termoAceito: aceito }));
      setShowTermosModal(false);
    } catch (error) {
      console.error('Erro ao aceitar termo:', error);
      alert('Erro ao processar aceite. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAceitarPolitica = async (aceito: boolean) => {
    if (!politicaAtual) return;

    setIsProcessing(true);
    try {
      await aceitarPolitica({ versao: politicaAtual.versao, aceito });
      setAceiteStatus(prev => ({ ...prev, politicaAceita: aceito }));
      setShowPoliticaModal(false);
    } catch (error) {
      console.error('Erro ao aceitar política:', error);
      alert('Erro ao processar aceite. Tente novamente.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados LGPD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Área LGPD</h1>
          </div>
          <p className="text-gray-600">
            Gerencie seus consentimentos e visualize os documentos de proteção de dados.
          </p>
        </div>

        {/* Status dos Aceites */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              Status dos Aceites
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 ${aceiteStatus.termoAceito ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center space-x-3">
                  {aceiteStatus.termoAceito ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Termos de Uso</h3>
                    <p className="text-sm text-gray-600">
                      {aceiteStatus.termoAceito ? 'Aceito' : 'Não aceito'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${aceiteStatus.politicaAceita ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center space-x-3">
                  {aceiteStatus.politicaAceita ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Política de Privacidade</h3>
                    <p className="text-sm text-gray-600">
                      {aceiteStatus.politicaAceita ? 'Aceita' : 'Não aceita'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(!aceiteStatus.termoAceito || !aceiteStatus.politicaAceita) && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">
                      Aceite Obrigatório
                    </h4>
                    <p className="text-sm text-amber-800">
                      Para continuar usando a plataforma, você deve aceitar os Termos de Uso e a Política de Privacidade.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Termos de Uso */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Termos de Uso
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewTermos}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Completo
              </Button>
            </div>

            {termoAtual && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Versão:</span>
                  <span className="font-medium">{termoAtual.versao}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium">
                    {new Date(termoAtual.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {aceitesTermos.map((aceite) => (
                <div key={aceite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {aceite.aceito ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {aceite.aceito ? 'Aceito' : 'Rejeitado'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Versão {aceite.versao} - {new Date(aceite.dataAceite).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowTermosModal(true)}
                className="w-full"
                disabled={isProcessing}
              >
                {aceiteStatus.termoAceito ? 'Revisar Aceite' : 'Aceitar Termos'}
              </Button>
            </div>
          </Card>

          {/* Política de Privacidade */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Política de Privacidade
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPolitica}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Completo
              </Button>
            </div>

            {politicaAtual && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Versão:</span>
                  <span className="font-medium">{politicaAtual.versao}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium">
                    {new Date(politicaAtual.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {aceitesPoliticas.map((aceite) => (
                <div key={aceite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {aceite.aceito ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {aceite.aceito ? 'Aceita' : 'Rejeitada'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Versão {aceite.versao} - {new Date(aceite.dataAceite).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowPoliticaModal(true)}
                className="w-full"
                disabled={isProcessing}
              >
                {aceiteStatus.politicaAceita ? 'Revisar Aceite' : 'Aceitar Política'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Informações sobre Consentimentos */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sobre os Consentimentos
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Consentimentos Integrados
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    Os consentimentos para tratamento de dados estão integrados diretamente nos
                    <strong> Termos de Uso</strong> e na <strong>Política de Privacidade</strong>.
                    Consulte estes documentos para informações detalhadas sobre como seus dados são tratados.
                  </p>
                  <p className="text-xs text-blue-700">
                    Esta seção está reservada para futuras funcionalidades de consentimento granular.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Aceite de Termos */}
      {showTermosModal && termoAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Termos de Uso - Versão {termoAtual.versao}
                </h3>
                <button
                  onClick={() => setShowTermosModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Última atualização:</strong> {new Date(termoAtual.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Leia os termos completos antes de aceitar. Você pode visualizar o documento completo clicando no botão abaixo.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleViewTermos}
                  className="w-full mb-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Documento Completo
                </Button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">
                        Importante
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Ao aceitar os termos, você concorda com todas as condições descritas no documento.
                        Você pode revogar seu aceite a qualquer momento através desta área LGPD.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleAceitarTermo(true)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processando...' : 'Aceitar Termos'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAceitarTermo(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aceite de Política */}
      {showPoliticaModal && politicaAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Política de Privacidade - Versão {politicaAtual.versao}
                </h3>
                <button
                  onClick={() => setShowPoliticaModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Última atualização:</strong> {new Date(politicaAtual.dataAtualizacao).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Leia a política completa antes de aceitar. Você pode visualizar o documento completo clicando no botão abaixo.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleViewPolitica}
                  className="w-full mb-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Documento Completo
                </Button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">
                        Importante
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Ao aceitar a política, você concorda com o tratamento dos seus dados conforme descrito no documento.
                        Você pode revogar seu aceite a qualquer momento através desta área LGPD.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleAceitarPolitica(true)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processando...' : 'Aceitar Política'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAceitarPolitica(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}