// src/pages/AgendamentoPublico.tsx - Versão corrigida sem problemas de timezone
import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Tag, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Users,
  ChevronLeft,
  MapPin,
  Mail,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { Loading } from '@/components/ui/Loading';
import { ProfissionalSelector } from '@/components/agendamento/ProfissionalSelector';
import { HorarioSelectorCompact } from '@/components/agendamento/HorarioSelectorCompact';
import { LgpdModal } from '@/components/agendamento/LgpdModal';
import { maskPhone } from '@/lib/masks';
import { dateUtils } from '@/utils/dateUtils';
import { useAgendamentoPublicoLogic } from '@/hooks/useAgendamentoPublico';
import { ServicoPublico } from '@/api/agendamentosPublicos';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';

interface AgendamentoPublicoProps {
  empresaId?: string;
}

const etapas = [
  { key: 'servico', label: 'Serviço', numero: 1 },
  { key: 'profissionais', label: 'Profissional', numero: 2 },
  { key: 'data', label: 'Data', numero: 3 },
  { key: 'horario', label: 'Horário', numero: 4 },
  { key: 'dados', label: 'Seus Dados', numero: 5 },
];

// Função para converter ServicoPublico para Servico
const mapServicoPublicoToServico = (servicoPublico: ServicoPublico): Servico => {
  return {
    id: servicoPublico.id,
    titulo: servicoPublico.titulo,
    descricao: servicoPublico.descricao,
    preco: servicoPublico.preco,
    duracao: servicoPublico.duracao,
    empresaId: servicoPublico.empresaId,
    ativo: servicoPublico.ativo,
    profissionais: servicoPublico.profissionais?.map(prof => ({
      id: prof.id,
      nome: prof.nome,
      email: prof.email,
      perfil: (prof.perfil as 'OWNER' | 'ADMIN' | 'USER') || 'USER', // Type assertion com fallback
      ativo: prof.ativo,
      empresaId: prof.empresaId,
    })) as Profissional[]
  };
};

// Função para formatar telefone para WhatsApp
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const numbersOnly = phone.replace(/\D/g, '');
  
  // Se não começar com 55 (código do Brasil), adiciona
  if (!numbersOnly.startsWith('55')) {
    return `55${numbersOnly}`;
  }
  
  return numbersOnly;
};

// Função para criar URL do WhatsApp
const createWhatsAppUrl = (phone: string, message?: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://api.whatsapp.com/send?phone=${formattedPhone}${message ? `&text=${encodedMessage}` : ''}`;
};

// Componente para telefone clicável com WhatsApp
interface WhatsAppPhoneProps {
  phone: string;
  className?: string;
  message?: string;
}

const WhatsAppPhone: React.FC<WhatsAppPhoneProps> = ({ phone, className = '', message }) => {
  const handleClick = () => {
    const whatsappUrl = createWhatsAppUrl(phone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-1 text-inherit hover:text-green-600 transition-colors duration-200 ${className}`}
      title="Abrir no WhatsApp"
    >
      <Phone className="w-4 h-4" />
      <span>{phone}</span>
    </button>
  );
};

// Componente para botão do WhatsApp (versão mais destacada)
interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phone, 
  message, 
  variant = 'default',
  size = 'md' 
}) => {
  const handleClick = () => {
    const whatsappUrl = createWhatsAppUrl(phone, message);
    window.open(whatsappUrl, '_blank');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const baseClasses = "inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200 hover:scale-105";
  
  const variantClasses = variant === 'outline' 
    ? "border-2 border-green-500 text-green-600 hover:bg-green-50" 
    : "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl";

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses[size]}`}
      title="Chamar no WhatsApp"
    >
      <svg 
        className="w-5 h-5" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
      </svg>
      <span>Chamar no WhatsApp</span>
    </button>
  );
};

export default function AgendamentoPublico({ empresaId: propEmpresaId }: AgendamentoPublicoProps) {
  const { 
    empresaId: paramEmpresaId, 
    nomeEmpresa: nomeEmpresaParam, 
    telefoneEmpresa: telefoneEmpresaParam 
  } = useParams<{ 
    empresaId: string; 
    nomeEmpresa?: string; 
    telefoneEmpresa?: string; 
  }>();
  const [searchParams] = useSearchParams();
  const [lgpdModalOpen, setLgpdModalOpen] = React.useState(false);

  // Função para decodificar parâmetros da URL (movida para dentro do componente)
  const decodeUrlParam = (param: string | undefined): string => {
    if (!param) return '';
    try {
      return decodeURIComponent(param.replace(/-/g, ' '));
    } catch (error) {
      console.error('Erro ao decodificar parâmetro:', error);
      return param.replace(/-/g, ' ');
    }
  };

  // Extrair informações da empresa da URL (memoizado)
  const empresaInfo = useMemo(() => ({
    id: propEmpresaId || paramEmpresaId || searchParams.get('empresaId') || '1',
    nomeFromUrl: nomeEmpresaParam ? decodeUrlParam(nomeEmpresaParam) : null,
    telefoneFromUrl: telefoneEmpresaParam && telefoneEmpresaParam !== 'sem-telefone' 
      ? decodeUrlParam(telefoneEmpresaParam) : null
  }), [propEmpresaId, paramEmpresaId, nomeEmpresaParam, telefoneEmpresaParam, searchParams]);

  const empresaIdNum = Number(empresaInfo.id);

  // Hook customizado para toda a lógica (agora com dependências estáveis)
  const {
    loading,
    error,
    sucesso,
    empresa,
    servicos,
    modalStates,
    handleServicoSelect,
    handleProfissionaisSelect,
    handleDataSelect,
    handleHorarioSelect,
    voltarEtapa,
    atualizarDadosCliente,
    finalizarAgendamento,
    reiniciarAgendamento,
    validarEtapa,
  } = useAgendamentoPublicoLogic(empresaIdNum);

  // Determinar qual nome e telefone usar (memoizado para evitar re-renders)
  const empresaDisplay = useMemo(() => ({
    nome: empresa?.nome || empresaInfo.nomeFromUrl || 'Empresa',
    telefone: empresa?.telefone || empresaInfo.telefoneFromUrl || null,
    email: empresa?.email || null
  }), [empresa?.nome, empresa?.telefone, empresa?.email, empresaInfo.nomeFromUrl, empresaInfo.telefoneFromUrl]);

  if (!empresaInfo.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600">ID da empresa não fornecido no link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          
          {/* Nome da empresa com destaque */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {empresaDisplay.nome}
          </h1>
          
          {/* Informações adicionais da empresa */}
          <div className="space-y-2 mb-4">
            <p className="text-xl text-gray-600">
              Agende seu atendimento online
            </p>
            
            {/* Informações de contato da empresa */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              {empresaDisplay.telefone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{empresaDisplay.telefone}</span>
                </div>
              )}
              {empresaDisplay.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{empresaDisplay.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Agendamento 24h</span>
              </div>
            </div>
          </div>

          {/* Indicador de fonte dos dados */}
          {empresaInfo.nomeFromUrl && !empresa?.nome && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200 mb-4">
              <CheckCircle className="w-3 h-3 mr-1" />
              Link personalizado para {empresaDisplay.nome}
            </div>
          )}

          {/* Botão LGPD */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setLgpdModalOpen(true)}
              className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
            >
              <Shield className="w-4 h-4" />
              <span>LGPD - Meus Dados</span>
            </Button>
          </div>
        </motion.div>

        {/* Breadcrumb Progress */}
        {modalStates.etapaAtual !== 'confirmacao' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              {etapas.map((etapa, index) => {
                const isAtual = modalStates.etapaAtual === etapa.key;
                const isCompleta = etapas.findIndex(e => e.key === modalStates.etapaAtual) > index;
                
                return (
                  <React.Fragment key={etapa.key}>
                    <div className={`flex items-center space-x-2 transition-all duration-300 ${
                      isAtual ? 'scale-110' : ''
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleta 
                          ? 'bg-green-500 text-white shadow-lg' 
                          : isAtual 
                            ? 'bg-primary-600 text-white shadow-lg animate-pulse' 
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleta ? <CheckCircle className="w-5 h-5" /> : etapa.numero}
                      </div>
                      <span className={`hidden sm:block text-sm font-medium transition-all duration-300 ${
                        isAtual ? 'text-primary-600' : isCompleta ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {etapa.label}
                      </span>
                    </div>
                    {index < etapas.length - 1 && (
                      <ChevronRight className={`w-4 h-4 transition-colors duration-300 ${
                        isCompleta ? 'text-green-500' : 'text-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((etapas.findIndex(e => e.key === modalStates.etapaAtual) + 1) / etapas.length) * 100}%` 
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-b border-red-200 p-4"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="text-red-700 text-sm">
                    {error}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loading size="lg" />
            </div>
          )}

          <div className="p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Etapa 1: Seleção de Serviço */}
              {modalStates.etapaAtual === 'servico' && (
                <motion.div
                  key="servico"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Escolha o Serviço
                    </h2>
                    <p className="text-gray-600">
                      Selecione o tipo de atendimento que você deseja com {empresaDisplay.nome}
                    </p>
                  </div>

                  {servicos.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
                      {empresaDisplay.telefone && (
                        <div className="mt-2">
                          <WhatsAppPhone 
                            phone={empresaDisplay.telefone}
                            message={`Olá! Gostaria de saber mais sobre os serviços da ${empresaDisplay.nome}.`}
                            className="text-sm text-gray-400 hover:text-green-600"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {servicos.map((servico) => {
                      // Converter ServicoPublico para Servico antes de usar
                      const servicoMapeado = mapServicoPublicoToServico(servico);
                      
                      return (
                        <motion.button
                          key={servico.id}
                          onClick={() => handleServicoSelect(servicoMapeado)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                        >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                              {servico.titulo}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {servico.descricao}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {servico.duracao} min
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {servico.profissionais?.length || 0} profissionais
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary-600 flex items-center">
                              <DollarSign className="w-5 h-5" />
                              {servico.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Etapa 2: Seleção de Profissional */}
              {modalStates.etapaAtual === 'profissionais' && modalStates.selectedServico && (
                <motion.div
                  key="profissionais"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Escolha o Profissional
                      </h2>
                      <p className="text-gray-600">
                        Selecione quem realizará seu atendimento na {empresaDisplay.nome}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={voltarEtapa}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </Button>
                  </div>

                  {/* Resumo do serviço */}
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <p className="text-sm text-primary-800">
                      <strong>Serviço selecionado:</strong> {modalStates.selectedServico?.titulo} - 
                      <strong> R$ {modalStates.selectedServico?.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>

                  <ProfissionalSelector
                    servico={modalStates.selectedServico}
                    onProfissionaisSelect={handleProfissionaisSelect}
                    selectedProfissionais={modalStates.selectedProfissionais}
                    singleSelect={true}
                  />
                </motion.div>
              )}

              {/* Etapa 3: Seleção de Data */}
              {modalStates.etapaAtual === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Escolha a Data
                      </h2>
                      <p className="text-gray-600">
                        Selecione o dia do seu atendimento
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={voltarEtapa}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </Button>
                  </div>

                  {/* Resumo */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Profissional:</strong> {modalStates.selectedProfissionais[0]?.nome}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={modalStates.selectedDataAgendamento}
                      onChange={(e) => handleDataSelect(e.target.value)}
                      className="text-center text-lg py-4"
                    />
                  </div>
                </motion.div>
              )}

              {/* Etapa 4: Seleção de Horário */}
              {modalStates.etapaAtual === 'horario' && modalStates.selectedServico && modalStates.selectedProfissionais.length > 0 && modalStates.selectedDataAgendamento && (
                <motion.div
                  key="horario"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Escolha o Horário
                      </h2>
                      <p className="text-gray-600">
                        Selecione o melhor horário para você
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={voltarEtapa}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </Button>
                  </div>

                  {/* Resumo - CORRIGIDO AQUI */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Data selecionada:</strong> {dateUtils.formatDateForDisplay(modalStates.selectedDataAgendamento)}
                    </p>
                  </div>

                  <HorarioSelectorCompact
                    servico={modalStates.selectedServico}
                    profissionais={modalStates.selectedProfissionais}
                    data={modalStates.selectedDataAgendamento}
                    onHorarioSelect={handleHorarioSelect}
                    showProfissionalSelection={false}
                    usePublicApi={true}
                    empresaId={empresaIdNum}
                  />
                </motion.div>
              )}

              {/* Etapa 5: Dados do Cliente */}
              {modalStates.etapaAtual === 'dados' && (
                <motion.div
                  key="dados"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Seus Dados
                      </h2>
                      <p className="text-gray-600">
                        Finalize seu agendamento com {empresaDisplay.nome}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={voltarEtapa}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </Button>
                  </div>

                  {/* Resumo completo - CORRIGIDO AQUI */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
                    <h3 className="font-semibold text-primary-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Resumo do Agendamento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Empresa:</strong> {empresaDisplay.nome}</p>
                        <p><strong>Serviço:</strong> {modalStates.selectedServico?.titulo}</p>
                        <p><strong>Profissional:</strong> {modalStates.selectedProfissionais[0]?.nome}</p>
                      </div>
                      <div>
                        <p><strong>Data:</strong> {dateUtils.formatDateSimple(modalStates.selectedDataAgendamento)}</p>
                        <p><strong>Horário:</strong> {dateUtils.formatTimeLocal(modalStates.selectedDataHora)}</p>
                        <p><strong>Valor:</strong> R$ {modalStates.selectedServico?.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    {empresaDisplay.telefone && (
                      <div className="mt-3 pt-3 border-t border-primary-300">
                        <p className="text-xs text-primary-700">
                          <span className="mr-1">Contato da empresa:</span>
                          <WhatsAppPhone 
                            phone={empresaDisplay.telefone}
                            message={`Olá! Tenho uma dúvida sobre meu agendamento na ${empresaDisplay.nome}.`}
                            className="text-xs text-primary-700 hover:text-green-600"
                          />
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Formulário de dados */}
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        type="text"
                        value={modalStates.dadosCliente.nomeCliente}
                        onChange={(e) => atualizarDadosCliente('nomeCliente', e.target.value)}
                        placeholder="Seu nome completo"
                        icon={User}
                        className="text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <MaskedInput
                        type="tel"
                        value={modalStates.dadosCliente.telefoneCliente}
                        onChange={(masked) => atualizarDadosCliente('telefoneCliente', masked)}
                        placeholder="+55 31 99999-8888"
                        icon={Phone}
                        mask={maskPhone}
                        className="text-center"
                      />
                    </div>

                    <Button
                      onClick={finalizarAgendamento}
                      disabled={!validarEtapa() || loading}
                      loading={loading}
                      className="w-full py-4 text-lg font-semibold"
                      size="lg"
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Etapa 6: Confirmação */}
              {modalStates.etapaAtual === 'confirmacao' && sucesso && (
                <motion.div
                  key="confirmacao"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Agendamento Confirmado!
                    </h2>
                    <p className="text-xl text-gray-600 mb-6">
                      Seu atendimento com {empresaDisplay.nome} foi agendado com sucesso
                    </p>
                  </div>

                  {/* Detalhes finais - CORRIGIDO AQUI */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left max-w-lg mx-auto">
                    <h3 className="font-bold text-green-900 mb-4 text-center">
                      Detalhes do seu Agendamento
                    </h3>
                    <div className="space-y-3 text-sm text-green-800">
                      <div className="flex justify-between">
                        <span className="font-medium">Empresa:</span>
                        <span>{empresaDisplay.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cliente:</span>
                        <span>{modalStates.dadosCliente.nomeCliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Telefone:</span>
                        <span>{modalStates.dadosCliente.telefoneCliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Serviço:</span>
                        <span>{modalStates.selectedServico?.titulo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Profissional:</span>
                        <span>{modalStates.selectedProfissionais[0]?.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Data:</span>
                        <span>{dateUtils.formatDateForDisplay(modalStates.selectedDataAgendamento)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Horário:</span>
                        <span>{dateUtils.formatTimeLocal(modalStates.selectedDataHora)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-green-300">
                        <span>Valor:</span>
                        <span>R$ {modalStates.selectedServico?.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    
                    {/* Informações de contato da empresa */}
                    {(empresaDisplay.telefone || empresaDisplay.email) && (
                      <div className="mt-4 pt-3 border-t border-green-300">
                        <h4 className="font-medium text-green-900 mb-2">Contato da Empresa:</h4>
                        <div className="space-y-1 text-xs text-green-700">
                          {empresaDisplay.telefone && (
                            <div className="flex items-center space-x-2">
                              <WhatsAppPhone 
                                phone={empresaDisplay.telefone}
                                message={`Olá! Confirmei meu agendamento na ${empresaDisplay.nome} para ${dateUtils.formatDateSimple(modalStates.selectedDataAgendamento)} às ${dateUtils.formatTimeLocal(modalStates.selectedDataHora)}. Cliente: ${modalStates.dadosCliente.nomeCliente}.`}
                                className="text-xs text-green-700 hover:text-green-600"
                              />
                            </div>
                          )}
                          {empresaDisplay.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3" />
                              <span>{empresaDisplay.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações importantes */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">Informações Importantes</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Chegue com 10 minutos de antecedência</p>
                      <p>• Em caso de imprevistos, entre em contato conosco</p>
                      <p>• Seu agendamento foi registrado com sucesso</p>
                      {empresaDisplay.telefone && (
                        <p>• Contato direto via WhatsApp disponível</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                    <Button
                      onClick={reiniciarAgendamento}
                      variant="outline"
                      className="flex-1"
                    >
                      Fazer Novo Agendamento
                    </Button>
                    <Button
                      onClick={() => window.close()}
                      className="flex-1"
                    >
                      Fechar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation Footer */}
        {modalStates.etapaAtual !== 'servico' && modalStates.etapaAtual !== 'confirmacao' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-between"
          >
            <Button
              variant="outline"
              onClick={voltarEtapa}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="text-sm text-gray-500">
              Etapa {etapas.findIndex(e => e.key === modalStates.etapaAtual) + 1} de {etapas.length}
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Precisa de Ajuda?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Entre em contato com {empresaDisplay.nome} se tiver dúvidas sobre o agendamento
            </p>
            
            {/* Botão do WhatsApp centralizado */}
            {empresaDisplay.telefone && (
              <div className="flex justify-center mb-6">
                <WhatsAppButton
                  phone={empresaDisplay.telefone}
                  message={`Olá! Preciso de ajuda com o agendamento na ${empresaDisplay.nome}.`}
                  variant="default"
                  size="md"
                />
              </div>
            )}

            <div className="flex items-center justify-center space-x-6 text-sm flex-wrap gap-2">
              {empresaDisplay.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{empresaDisplay.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Agendamento 24h</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Confirmação imediata</span>
              </div>
            </div>
            
            {/* Informações LGPD */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Seus dados estão protegidos pela LGPD</span>
                </div>
                <button
                  onClick={() => setLgpdModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Gerenciar meus dados
                </button>
              </div>
            </div>

            {/* Indicador da fonte dos dados */}
            {empresaInfo.nomeFromUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-400">
                  Link personalizado para {empresaDisplay.nome}
                  {empresaInfo.telefoneFromUrl && ` • ${empresaInfo.telefoneFromUrl}`}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal LGPD */}
        <LgpdModal
          isOpen={lgpdModalOpen}
          onClose={() => setLgpdModalOpen(false)}
          telefoneCliente={modalStates.dadosCliente.telefoneCliente}
          nomeCliente={modalStates.dadosCliente.nomeCliente}
        />
      </div>
    </div>
  );
}