// src/components/agendamento/CompartilharLinkMobileFirst.tsx - Versão otimizada para mobile
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, ExternalLink, QrCode, AlertTriangle, Info, X, ChevronDown, ChevronUp, Smartphone, Globe, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useEmpresaAtual } from '@/hooks/useEmpresa';
import { PublicSchedulingUrlManager, validateSchedulingUrlParams } from '@/utils/urlUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface CompartilharLinkProps {
  onClose?: () => void;
}

export function CompartilharLinkMobileFirst({ onClose }: CompartilharLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'instrucoes'>('link');
  
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresaAtual();
  const urlManager = new PublicSchedulingUrlManager();

  const { url: linkAgendamento, warnings } = urlManager.generateValidatedUrl(
    empresaId,
    empresa?.nome,
    empresa?.telefone
  );

  const validation = validateSchedulingUrlParams({
    empresaId: empresaId.toString(),
    nomeEmpresa: empresa?.nome,
    telefoneEmpresa: empresa?.telefone
  });

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkAgendamento);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    } catch (error) {
      // Fallback para browsers antigos
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
        copiarLink();
      }
    } else {
      copiarLink();
    }
  };

  const abrirLink = () => {
    window.open(linkAgendamento, '_blank');
  };

  const gerarQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkAgendamento)}`;
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setActiveTab('link');
    onClose?.();
  };

  // Mobile: Bottom Sheet, Desktop: Modal normal
  const ModalComponent = ({ children }: { children: React.ReactNode }) => (
    <>
      {/* Desktop Modal */}
      <div className="hidden md:block">
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={fecharModal}
              />
              <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={fecharModal}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
              >
                {/* Handle bar */}
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );

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

      <ModalComponent>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compartilhar</h2>
              <p className="text-sm text-gray-500">Link de agendamento</p>
            </div>
          </div>
          <button
            onClick={fecharModal}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs - Mobile */}
        <div className="md:hidden border-b">
          <div className="flex">
            {[
              { key: 'link', label: 'Link', icon: Globe },
              { key: 'qr', label: 'QR Code', icon: QrCode },
              { key: 'instrucoes', label: 'Como Usar', icon: Info }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Alertas */}
          {(!validation.isValid || warnings.length > 0) && (
            <div className="p-4 space-y-2">
              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Problemas encontrados</p>
                      <p className="text-xs text-red-800 mt-1">{validation.errors[0]}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Aviso</p>
                      <p className="text-xs text-amber-800 mt-1">{warnings[0]}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Mobile */}
          <div className="md:hidden">
            {activeTab === 'link' && (
              <div className="p-4 space-y-4">
                {/* Link Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Seu Link Personalizado
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <input
                        type="text"
                        value={linkAgendamento}
                        readOnly
                        className="w-full bg-transparent text-sm font-mono text-gray-700 resize-none outline-none"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                    
                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={copiarLink}
                        variant={linkCopiado ? "default" : "outline"}
                        size="sm"
                        className="flex items-center justify-center space-x-2"
                      >
                        {linkCopiado ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={compartilharNativo}
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTab('qr')}
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <QrCode className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">QR Code</span>
                  </button>
                  
                  <button
                    onClick={abrirLink}
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Visualizar</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('instrucoes')}
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Info className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Ajuda</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="p-4 text-center space-y-4">
                <h3 className="font-medium text-gray-900">QR Code</h3>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={gerarQRCode()}
                    alt="QR Code do link de agendamento"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Aponte a câmera do celular para escanear
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={copiarLink}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      size="sm"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instrucoes' && (
              <div className="p-4 space-y-4">
                <h3 className="font-medium text-gray-900 mb-3">Como Usar</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">WhatsApp/Instagram</h4>
                      <p className="text-sm text-gray-600">Cole o link em suas redes sociais ou conversas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Site/Bio</h4>
                      <p className="text-sm text-gray-600">Adicione ao seu site ou bio do Instagram</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">QR Code</h4>
                      <p className="text-sm text-gray-600">Imprima para usar em materiais físicos</p>
                    </div>
                  </div>
                </div>
                
                {empresa?.nome && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      ✨ O nome "{empresa.nome}" já está incluído no link para reconhecimento automático
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Content */}
          <div className="hidden md:block p-6 space-y-6">
            {/* Similar content but in desktop layout */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Link para {empresa?.nome || 'Sua Empresa'}
              </h3>
              <p className="text-sm text-gray-600">
                Compartilhe para que clientes possam agendar 24h por dia
              </p>
            </div>

            {/* Link Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu Link Personalizado
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={linkAgendamento}
                  readOnly
                  className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={copiarLink}
                  variant="outline"
                  className={linkCopiado ? 'bg-green-50 border-green-300' : ''}
                >
                  {linkCopiado ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={compartilharNativo}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </Button>
              
              <Button
                onClick={abrirLink}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visualizar</span>
              </Button>
              
              <Button
                onClick={() => setMostrarQR(!mostrarQR)}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </Button>
            </div>

            {/* QR Code */}
            {mostrarQR && (
              <div className="text-center space-y-3 border-t pt-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={gerarQRCode()}
                    alt="QR Code do link de agendamento"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Escaneie com a câmera do celular para acessar o link
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={fecharModal}>
              Fechar
            </Button>
            <Button 
              onClick={copiarLink} 
              disabled={!validation.isValid}
              className="md:hidden"
            >
              {linkCopiado ? '✓ Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      </ModalComponent>
    </>
  );
}