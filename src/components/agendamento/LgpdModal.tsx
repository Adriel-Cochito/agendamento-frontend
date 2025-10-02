// src/components/agendamento/LgpdModal.tsx - Modal para LGPD na tela pública
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Phone, 
  User, 
  Calendar,
  Clock,
  Building,
  FileText,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { agendamentosPublicosApi } from '@/api/agendamentosPublicos';

interface DadosClienteResumo {
  existe: boolean;
  totalAgendamentos: number;
  tiposDados: {
    nome: boolean;
    telefone: boolean;
    email: boolean;
    endereco: boolean;
    cpf: boolean;
    observacoes: boolean;
  };
  empresas: Array<{
    id: number;
    nome: string;
    totalAgendamentos: number;
  }>;
  periodo: {
    primeiroAgendamento: string;
    ultimoAgendamento: string;
  };
}

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  telefoneCliente: string;
  nomeCliente: string;
}

export const LgpdModal: React.FC<LgpdModalProps> = ({
  isOpen,
  onClose,
  telefoneCliente,
  nomeCliente
}) => {
  const [step, setStep] = useState<'search' | 'view' | 'confirm'>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<DadosClienteResumo | null>(null);
  const [searchData, setSearchData] = useState({
    telefone: telefoneCliente || '',
    nome: nomeCliente || ''
  });
  const [confirmText, setConfirmText] = useState('');

  // Reset do modal quando abre
  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setError(null);
      setSuccess(false);
      setDadosResumo(null);
      setSearchData({
        telefone: telefoneCliente || '',
        nome: nomeCliente || ''
      });
      setConfirmText('');
    }
  }, [isOpen, telefoneCliente, nomeCliente]);

  const handleSearch = async () => {
    // Validações de entrada rigorosas
    if (!searchData.telefone.trim() || !searchData.nome.trim()) {
      setError('Por favor, preencha nome e telefone para buscar seus dados.');
      return;
    }

    // Validar formato do telefone (mínimo 10 dígitos, máximo 15)
    const phoneDigits = searchData.telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError('Por favor, digite um telefone válido com 10 a 15 dígitos.');
      return;
    }

    // Validar nome (mínimo 2 palavras, máximo 100 caracteres)
    const nameTrimmed = searchData.nome.trim();
    if (nameTrimmed.length < 5 || nameTrimmed.length > 100) {
      setError('Por favor, digite seu nome completo (mínimo 5 caracteres).');
      return;
    }

    const nameWords = nameTrimmed.split(/\s+/).filter(word => word.length > 0);
    if (nameWords.length < 2) {
      setError('Por favor, digite seu nome completo (nome e sobrenome).');
      return;
    }

    // Validar se nome contém apenas letras e espaços
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nameTrimmed)) {
      setError('O nome deve conter apenas letras e espaços.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resumo = await buscarResumoDadosCliente(searchData.telefone, searchData.nome);
      setDadosResumo(resumo);
      setStep('view');
    } catch (err) {
      setError('Erro ao buscar informações sobre seus dados. Verifique as informações e tente novamente.');
      console.error('Erro ao buscar dados LGPD:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymize = () => {
    setStep('confirm');
  };

  const handleConfirmAnonymize = async () => {
    // Validação rigorosa da confirmação
    if (confirmText !== 'CONFIRMAR EXCLUSÃO') {
      setError('Digite exatamente "CONFIRMAR EXCLUSÃO" para prosseguir.');
      return;
    }

    // Verificar se há dados para remover
    if (!dadosResumo || !dadosResumo.existe || dadosResumo.totalAgendamentos === 0) {
      setError('Nenhum dado encontrado para remover.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await anonimizarDadosCliente(searchData.telefone, searchData.nome);
      setSuccess(true);
      setStep('view');
      
      // Atualizar resumo após remoção
      setDadosResumo({
        existe: false,
        totalAgendamentos: 0,
        tiposDados: {
          nome: false,
          telefone: false,
          email: false,
          endereco: false,
          cpf: false,
          observacoes: false
        },
        empresas: [],
        periodo: {
          primeiroAgendamento: '',
          ultimoAgendamento: ''
        }
      });
    } catch (err) {
      setError('Erro ao remover dados. Tente novamente.');
      console.error('Erro ao remover dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setError(null);
    setSuccess(false);
    setDadosResumo(null);
    setConfirmText('');
    onClose();
  };

  // Função para buscar resumo de dados usando API real
  const buscarResumoDadosCliente = async (telefone: string, nome: string): Promise<DadosClienteResumo> => {
    try {
      const resumo = await agendamentosPublicosApi.buscarResumoDadosCliente(telefone, nome);
      return resumo;
    } catch (error) {
      console.error('Erro ao buscar resumo dados LGPD:', error);
      throw new Error('Erro ao buscar informações sobre seus dados. Verifique as informações e tente novamente.');
    }
  };

  // Função para remover dados usando API real
  const anonimizarDadosCliente = async (telefone: string, nome: string): Promise<void> => {
    try {
      await agendamentosPublicosApi.anonimizarDadosCliente(telefone, nome);
    } catch (error) {
      console.error('Erro ao remover dados LGPD:', error);
      throw new Error('Erro ao remover dados. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">LGPD - Seus Dados</h2>
                    <p className="text-blue-100 text-sm">
                      Visualize e gerencie seus dados pessoais
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Step 1: Busca */}
                {step === 'search' && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Buscar Seus Dados
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Digite seu nome e telefone para verificar quais dados temos sobre você
                      </p>
                    </div>

                    {/* Aviso de Segurança */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Aviso de Segurança:</p>
                          <p className="text-xs">
                            Por motivos de segurança, você verá apenas informações sobre a existência e tipos de dados, 
                            sem acesso aos dados reais. Apenas você pode solicitar a remoção dos seus dados.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <Input
                          type="text"
                          value={searchData.nome}
                          onChange={(e) => setSearchData(prev => ({ ...prev, nome: e.target.value }))}
                          placeholder="Seu nome completo"
                          icon={User}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone *
                        </label>
                        <Input
                          type="tel"
                          value={searchData.telefone}
                          onChange={(e) => setSearchData(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="+55 31 99999-8888"
                          icon={Phone}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSearch}
                      disabled={loading || !searchData.nome.trim() || !searchData.telefone.trim()}
                      loading={loading}
                      className="w-full"
                    >
                      {loading ? 'Buscando...' : 'Buscar Meus Dados'}
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Visualização */}
                {step === 'view' && (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Informações sobre Seus Dados
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {dadosResumo?.existe 
                          ? `Encontramos ${dadosResumo.totalAgendamentos} agendamento(s) com seus dados`
                          : 'Nenhum dado encontrado com as informações fornecidas'
                        }
                      </p>
                    </div>

                    {success && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-green-700 text-sm">
                            Seus dados foram removidos com sucesso!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {!dadosResumo?.existe ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum dado encontrado
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            Não foram encontrados dados com as informações fornecidas.
                          </p>
                          <p className="text-xs text-gray-500">
                            Verifique se o nome e telefone estão corretos e tente novamente.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Resumo Geral */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Resumo dos Seus Dados
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-blue-800">
                                  <span className="font-medium">Total de agendamentos:</span> {dadosResumo.totalAgendamentos}
                                </p>
                                <p className="text-blue-800">
                                  <span className="font-medium">Período:</span> {dadosResumo.periodo.primeiroAgendamento} até {dadosResumo.periodo.ultimoAgendamento}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-800">
                                  <span className="font-medium">Empresas:</span> {dadosResumo.empresas.length}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tipos de Dados Armazenados */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Lock className="w-4 h-4 mr-2" />
                              Tipos de Dados Pessoais Armazenados
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {Object.entries(dadosResumo.tiposDados).map(([tipo, existe]) => (
                                <div key={tipo} className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${existe ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className={existe ? 'text-gray-900' : 'text-gray-500'}>
                                    {tipo === 'nome' ? 'Nome' :
                                     tipo === 'telefone' ? 'Telefone' :
                                     tipo === 'email' ? 'E-mail' :
                                     tipo === 'endereco' ? 'Endereço' :
                                     tipo === 'cpf' ? 'CPF' :
                                     tipo === 'observacoes' ? 'Observações' : tipo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Empresas */}
                          {dadosResumo.empresas.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                Empresas com Seus Dados
                              </h4>
                              <div className="space-y-2">
                                {dadosResumo.empresas.map((empresa) => (
                                  <div key={empresa.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">{empresa.nome}</span>
                                    <span className="text-gray-500">{empresa.totalAgendamentos} agendamento(s)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Importante sobre a exclusão de dados:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Seus dados serão removidos, não deletados</li>
                            <li>Os agendamentos continuarão existindo, mas sem seus dados pessoais</li>
                            <li>Esta ação não pode ser desfeita</li>
                            <li>Você não receberá mais notificações sobre estes agendamentos</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setStep('search')}
                        variant="outline"
                        className="flex-1"
                      >
                        Nova Busca
                      </Button>
                      <Button
                        onClick={handleAnonymize}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover Dados
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirmação */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Confirmar Remoção
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Esta ação irá remover todos os seus dados pessoais
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">O que será removido:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• Seus dados pessoais em {dadosResumo?.totalAgendamentos || 0} agendamento(s)</li>
                        <li>• Dados armazenados em {dadosResumo?.empresas.length || 0} empresa(s)</li>
                        <li>• Todos os tipos de dados pessoais identificados</li>
                        <li>• Esta ação não pode ser desfeita</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Para confirmar, digite: <span className="font-mono bg-gray-100 px-2 py-1 rounded">CONFIRMAR EXCLUSÃO</span>
                      </label>
                      <Input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Digite exatamente: CONFIRMAR EXCLUSÃO"
                        className="font-mono"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setStep('view')}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmAnonymize}
                        disabled={loading || confirmText !== 'CONFIRMAR EXCLUSÃO'}
                        loading={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {loading ? 'Removendo...' : 'Confirmar Remoção'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
