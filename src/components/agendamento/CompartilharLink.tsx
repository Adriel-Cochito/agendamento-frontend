// src/components/agendamento/CompartilharLink.tsx - Com parâmetros na URL
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useEmpresaAtual } from '@/hooks/useEmpresa';

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
  
  // Função para codificar parâmetros da URL
  const encodeUrlParam = (param: string) => {
    return encodeURIComponent(param.replace(/\s+/g, '-').toLowerCase());
  };

  // Gerar URL com parâmetros da empresa
  const gerarLinkAgendamento = () => {
    const baseUrl = window.location.origin;
    
    if (empresa?.nome && empresa?.telefone) {
      const nomeEncoded = encodeUrlParam(empresa.nome);
      const telefoneEncoded = encodeUrlParam(empresa.telefone);
      return `${baseUrl}/agendamento/${empresaId}/${nomeEncoded}/${telefoneEncoded}`;
    } else if (empresa?.nome) {
      const nomeEncoded = encodeUrlParam(empresa.nome);
      const telefoneEncoded = encodeUrlParam('sem-telefone');
      return `${baseUrl}/agendamento/${empresaId}/${nomeEncoded}/${telefoneEncoded}`;
    } else {
      // Fallback para URL simples
      return `${baseUrl}/agendamento/${empresaId}`;
    }
  };

  const linkAgendamento = gerarLinkAgendamento();

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
          {/* Descrição */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Link Público de Agendamento
            </h3>
            <p className="text-gray-600 text-sm">
              {loadingEmpresa 
                ? 'Carregando informações...'
                : `Compartilhe este link para que os clientes possam agendar com ${empresa?.nome || 'sua empresa'}.`
              }
            </p>
          </div>

          {/* Nome da empresa */}
          {empresa?.nome && !loadingEmpresa && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-primary-900">{empresa.nome}</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Os clientes verão este nome ao acessar o link
                </p>
              </div>
              
              {/* Informações incluídas na URL */}
              <div className="bg-white rounded-lg p-3 border border-primary-200">
                <p className="text-xs font-medium text-primary-800 mb-2">
                  ✅ Informações incluídas no link:
                </p>
                <div className="space-y-1 text-xs text-primary-700">
                  <p>📢 Nome: {empresa.nome}</p>
                  {empresa.telefone ? (
                    <p>📞 Telefone: {empresa.telefone}</p>
                  ) : (
                    <p>📞 Telefone: Não informado</p>
                  )}
                  <p className="mt-2 text-primary-600 italic">
                    * Essas informações são enviadas pela URL e aparecerão automaticamente para o cliente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de Agendamento Inteligente
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
            
            {/* Preview da URL */}
            {empresa?.nome && !loadingEmpresa && (
              <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-600">
                <span className="font-medium">Preview:</span> .../agendamento/{empresaId}/{encodeUrlParam(empresa.nome)}/{encodeUrlParam(empresa.telefone || 'sem-telefone')}
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
                <>
                  <li>✨ O nome "{empresa.nome}" aparecerá automaticamente</li>
                  {empresa.telefone && (
                    <li>📞 O telefone "{empresa.telefone}" será exibido para contato</li>
                  )}
                </>
              )}
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={fecharModal}>
              Fechar
            </Button>
            <Button onClick={copiarLink}>
              {linkCopiado ? 'Link Copiado!' : 'Copiar Link Inteligente'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}