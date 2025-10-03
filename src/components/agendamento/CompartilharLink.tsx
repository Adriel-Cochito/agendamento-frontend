// src/components/agendamento/CompartilharLink.tsx - Versão com estilos inline
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, ExternalLink, QrCode, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useEmpresaAtual } from '@/hooks/useEmpresa';
import { PublicSchedulingUrlManager, validateSchedulingUrlParams } from '@/utils/urlUtils';

interface CompartilharLinkProps {
  onClose?: () => void;
}

export function CompartilharLink({ onClose }: CompartilharLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresaAtual();
  const urlManager = new PublicSchedulingUrlManager();

  // Gerar link usando nome único se disponível, senão usar formato antigo
  const linkAgendamento = empresa?.nomeUnico 
    ? `${window.location.origin}/${empresa.nomeUnico}`
    : urlManager.generateValidatedUrl(empresaId, empresa?.nome, empresa?.telefone).url;

  // Validação apenas para formato antigo
  const validation = empresa?.nomeUnico 
    ? { isValid: true, errors: [], warnings: [] }
    : validateSchedulingUrlParams({
        empresaId: empresaId.toString(),
        nomeEmpresa: empresa?.nome,
        telefoneEmpresa: empresa?.telefone
      });

  // Extrair warnings para compatibilidade
  const warnings = validation.warnings || [];

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkAgendamento);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      const textArea = document.createElement('textarea');
      textArea.value = linkAgendamento;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    }
  };

  const compartilharNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agendamento - ${empresa?.nome || 'Nossa Empresa'}`,
          text: `Agende seu horário com ${empresa?.nome || 'nossa empresa'}:`,
          url: linkAgendamento,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      copiarLink();
    }
  };

  const abrirLink = () => {
    window.open(linkAgendamento, '_blank');
  };

  const gerarQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkAgendamento)}`;
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setMostrarQR(false);
    setMostrarDetalhes(false);
    setMostrarInstrucoes(false);
    onClose?.();
  };

  const urlAnalysis = urlManager.parseUrl(linkAgendamento);

  // Estilos inline para responsividade
  const modalStyles = {
    container: {
      maxHeight: '80vh',
      overflowY: 'auto' as const,
    },
    header: {
      position: 'sticky' as const,
      top: 0,
      backgroundColor: 'white',
      zIndex: 10,
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    inputGroupDesktop: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '0.5rem',
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontFamily: 'monospace',
      wordBreak: 'break-all' as const,
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
    },
    buttonGridDesktop: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    qrImage: {
      width: '8rem',
      height: '8rem',
    },
    qrImageDesktop: {
      width: '12rem',
      height: '12rem',
    },
  };

  // Detectar se é desktop
  const isDesktop = window.innerWidth >= 640;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Compartilhar Link</span>
        <span className="sm:hidden">Link</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={fecharModal}
        title=""
        size="lg"
      >
        <div style={modalStyles.container}>
          {/* Header customizado */}
          <div style={modalStyles.header} className="flex items-center justify-between p-4 pb-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Link de Agendamento</h2>
                <p className="text-sm text-gray-500">Compartilhe com seus clientes</p>
              </div>
            </div>
            <button
              onClick={fecharModal}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Alertas de validação */}
            {!validation.isValid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 text-sm mb-1">Problemas encontrados:</h4>
                    <ul className="text-xs text-red-800 space-y-1">
                      {validation.errors.slice(0, 2).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {validation.errors.length > 2 && (
                        <li className="text-red-600">• +{validation.errors.length - 2} outros problemas</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 text-sm mb-1">Avisos:</h4>
                    <p className="text-xs text-amber-800">
                      {warnings[0]}
                      {warnings.length > 1 && ` (+${warnings.length - 1} outros)`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info da empresa */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Link para {empresa?.nome || 'Sua Empresa'}
              </h3>
              <p className="text-sm text-gray-600">
                {loadingEmpresa ? 'Carregando...' : 'Clientes podem agendar 24h por dia'}
              </p>
            </div>

            {/* Link principal */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu Link Personalizado
              </label>
              <div className="space-y-3">
                {/* Input do link - responsivo */}
                <div style={isDesktop ? modalStyles.inputGroupDesktop : modalStyles.inputGroup}>
                  <input
                    type="text"
                    value={linkAgendamento}
                    readOnly
                    style={modalStyles.input}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={copiarLink}
                    variant="outline"
                    size="sm"
                    className={`flex items-center justify-center space-x-1 whitespace-nowrap min-w-[100px] ${
                      linkCopiado ? 'bg-green-50 border-green-300' : ''
                    }`}
                  >
                    {linkCopiado ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Preview da estrutura da URL */}
                {empresa?.nome && !loadingEmpresa && (
                  <button
                    onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                    className="w-full text-left p-2 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="font-medium">Estrutura:</span> 
                        <span className="ml-1">
                          /agendamento/{empresaId}/{empresa.nome ? 'nome-da-empresa' : 'sem-nome'}/...
                        </span>
                      </span>
                      {mostrarDetalhes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    {mostrarDetalhes && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p>URL completa: {linkAgendamento}</p>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Análise da URL */}
            {urlAnalysis.isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg">
                <button
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="w-full p-3 text-left hover:bg-green-100 transition-colors rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-green-900 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Informações do Link
                    </h4>
                    {mostrarDetalhes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                
                {mostrarDetalhes && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-green-800">
                      <div>
                        <p><strong>ID da Empresa:</strong> {urlAnalysis.empresaId}</p>
                        {urlAnalysis.nomeEmpresa && (
                          <p><strong>Nome:</strong> {urlAnalysis.nomeEmpresa}</p>
                        )}
                      </div>
                      <div>
                        {urlAnalysis.telefoneEmpresa && (
                          <p><strong>Telefone:</strong> {urlAnalysis.telefoneEmpresa}</p>
                        )}
                        {empresa?.email && (
                          <p><strong>Email:</strong> {empresa.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ações de Compartilhamento - responsivas */}
            <div style={isDesktop ? modalStyles.buttonGridDesktop : modalStyles.buttonGrid}>
              <Button
                onClick={compartilharNativo}
                variant="outline"
                size="sm"
                className="flex items-center justify-center space-x-1"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>

              <Button
                onClick={abrirLink}
                variant="outline"
                size="sm"
                className="flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Visualizar</span>
              </Button>

              <Button
                onClick={() => setMostrarQR(!mostrarQR)}
                variant="outline"
                size="sm"
                className="flex items-center justify-center space-x-1"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Code</span>
              </Button>

              <Button
                onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)}
                variant="outline"
                size="sm"
                className="flex items-center justify-center space-x-1"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Como Usar</span>
              </Button>
            </div>

            {/* QR Code */}
            {mostrarQR && (
              <div className="text-center space-y-3 border-t pt-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={gerarQRCode()}
                    alt="QR Code do link de agendamento"
                    style={isDesktop ? modalStyles.qrImageDesktop : modalStyles.qrImage}
                    className="mx-auto"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Escaneie com a câmera do celular
                  </p>
                  {empresa?.nome && (
                    <p className="text-xs text-gray-500 mt-1">
                      Link para {empresa.nome}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Instruções */}
            {mostrarInstrucoes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 border-t pt-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Como Usar o Link
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p>• Cole no WhatsApp/Instagram</p>
                      <p>• Adicione ao seu site</p>
                      <p>• Imprima o QR Code</p>
                    </div>
                    <div>
                      <p>• Funciona 24h por dia</p>
                      <p>• Confirmação automática</p>
                      <p>• Dados pré-carregados</p>
                    </div>
                  </div>
                  {empresa?.nome && (
                    <div className="mt-3 pt-3 border-t border-blue-300">
                      <p className="text-xs">
                        ✨ Informações de "{empresa.nome}" já incluídas no link
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                onClick={fecharModal}
                className="order-2 sm:order-1"
              >
                Fechar
              </Button>
              <Button 
                onClick={copiarLink} 
                disabled={!validation.isValid}
                className="order-1 sm:order-2"
              >
                {linkCopiado ? '✓ Copiado!' : 'Copiar Link'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}