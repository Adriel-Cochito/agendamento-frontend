// src/components/agendamento/CompartilharLink.tsx - Atualizado com novos utilitários
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, ExternalLink, QrCode, AlertTriangle, Info } from 'lucide-react';
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
  
  const user = useAuthStore((state) => state.user);
  const empresaId = user?.empresaId || 1;
  
  // Usar hook para buscar dados da empresa
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresaAtual();
  
  // Instanciar o gerenciador de URLs
  const urlManager = new PublicSchedulingUrlManager();

  // Gerar URL com validação
  const { url: linkAgendamento, warnings } = urlManager.generateValidatedUrl(
    empresaId,
    empresa?.nome,
    empresa?.telefone
  );

  // Validar parâmetros
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
      console.error('Erro ao copiar link:', error);
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
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar link
      copiarLink();
    }
  };

  const abrirLink = () => {
    window.open(linkAgendamento, '_blank');
  };

  const gerarQRCode = () => {
    // URL da API do QR Server (gratuita)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkAgendamento)}`;
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  // Analisar URL para mostrar preview
  const urlAnalysis = urlManager.parseUrl(linkAgendamento);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Compartilhar Link</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={fecharModal}
        title="Compartilhar Link de Agendamento"
        size="lg"
      >
        <div className="space-y-6">
          {/* Validações e Avisos */}
          {!validation.isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Problemas encontrados:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-2">Avisos:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Dicas:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Link Inteligente de Agendamento
            </h3>
            <p className="text-gray-600 text-sm">
              {loadingEmpresa 
                ? 'Carregando informações...'
                : empresa?.nome
                  ? `Link personalizado para ${empresa.nome} com informações pré-carregadas`
                  : 'Link de agendamento com ID da empresa'
              }
            </p>
          </div>

          {/* Análise da URL */}
          {urlAnalysis.isValid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">✅ Informações incluídas no link:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
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
                    <p><strong>Email (via API):</strong> {empresa.email}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="text-xs text-green-700 italic">
                  * Essas informações serão exibidas automaticamente quando o cliente acessar o link
                </p>
              </div>
            </div>
          )}

          {/* Link */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de Agendamento Personalizado
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={linkAgendamento}
                readOnly
                className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-sm font-mono"
              />
              <Button
                onClick={copiarLink}
                variant="outline"
                size="sm"
                className={`flex items-center space-x-1 ${linkCopiado ? 'bg-green-50 border-green-300' : ''}`}
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
              <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-600">
                <span className="font-medium">Estrutura:</span> 
                <span className="ml-1">
                  /agendamento/{empresaId}/{empresa.nome ? 'nome-da-empresa' : 'sem-nome'}/{empresa.telefone ? 'telefone' : 'sem-telefone'}
                </span>
              </div>
            )}
          </div>

          {/* Ações de Compartilhamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={gerarQRCode()}
                  alt="QR Code do link de agendamento"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600">
                Escaneie este QR Code com a câmera do celular para acessar o link
              </p>
              {empresa?.nome && (
                <p className="text-xs text-gray-500">
                  Link inteligente para agendamento com {empresa.nome}
                </p>
              )}
            </div>
          )}

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Como usar o Link Inteligente:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Copie e cole o link em suas redes sociais, WhatsApp ou email</li>
              <li>Adicione o link ao seu site ou bio do Instagram</li>
              <li>Imprima o QR Code para usar em materiais físicos</li>
              <li>Clientes poderão agendar 24h por dia, sem precisar te ligar</li>
              {empresa?.nome && (
                <li>✨ O nome "{empresa.nome}" aparecerá automaticamente</li>
              )}
              {empresa?.telefone && (
                <li>📞 O telefone "{empresa.telefone}" será exibido para contato</li>
              )}
              <li>💡 As informações são passadas pela URL, garantindo carregamento rápido</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={fecharModal}>
              Fechar
            </Button>
            <Button onClick={copiarLink} disabled={!validation.isValid}>
              {linkCopiado ? 'Link Copiado!' : 'Copiar Link Inteligente'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}