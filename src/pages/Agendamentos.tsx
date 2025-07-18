import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Search,
  Filter,
  User,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  AlertTriangle,
  List,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AgendamentoForm } from '@/components/forms/AgendamentoForm';
import { HorarioSelector } from '@/components/agendamento/HorarioSelector';
import { CalendarioView } from '@/components/calendario/CalendarioView';
import { Loading } from '@/components/ui/Loading';
import {
  useAgendamentos,
  useCreateAgendamento,
  useUpdateAgendamento,
  useDeleteAgendamento,
} from '@/hooks/useAgendamentos';
import { useServicos } from '@/hooks/useServicos';
import { useProfissionais } from '@/hooks/useProfissionais';
import { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { useAuthStore } from '@/store/authStore';
import { dateUtils } from '../utils/dateUtils';

type EtapaAgendamento = 'servico' | 'data' | 'profissional' | 'horario' | 'formulario';
type TipoVisualizacao = 'lista' | 'calendario';

export function Agendamentos() {
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);

  // Estados principais
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('lista');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusAgendamento | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Estados do modal de criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState<EtapaAgendamento>('servico');
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [selectedDataAgendamento, setSelectedDataAgendamento] = useState('');
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(
    null
  );
  const [selectedDataHora, setSelectedDataHora] = useState('');

  // Estados de edição/exclusão
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | null>(
    null
  );

  const empresaId = user?.empresaId || 1;

  // Queries
  const { data: agendamentos, isLoading } = useAgendamentos({ empresaId });
  const { data: servicos, isLoading: isLoadingServicos } = useServicos(empresaId);
  const { data: profissionais, isLoading: isLoadingProfissionais } =
    useProfissionais(empresaId);

  console.log('📊 Estados das queries:', {
    agendamentos: agendamentos?.length || 0,
    servicos: servicos?.length || 0,
    profissionais: profissionais?.length || 0,
    isLoadingServicos,
    isLoadingProfissionais,
  });

  // Mutations
  const createMutation = useCreateAgendamento();
  const updateMutation = useUpdateAgendamento();
  const deleteMutation = useDeleteAgendamento();

  // Filtros
  const filteredAgendamentos = agendamentos?.filter((agend) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      agend.nomeCliente?.toLowerCase()?.includes(searchLower) ||
      false ||
      agend.servicoTitulo?.toLowerCase()?.includes(searchLower) ||
      false ||
      agend.profissionalNome?.toLowerCase()?.includes(searchLower) ||
      false;

    const matchesStatus = selectedStatus === 'ALL' || agend.status === selectedStatus;

    const matchesDate =
      !selectedDate ||
      new Date(agend.dataHora).toISOString().split('T')[0] === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handlers do fluxo de criação
  const handleNovoAgendamento = (dataInicial?: Date) => {
    resetEtapas();
    console.log('handleNovoAgendamento...');
    console.log('dataInicial: ', dataInicial);

    // Se uma data foi passada, já preenche e pula para a seleção de serviço
    if (dataInicial) {
      const dataFormatada = dataInicial.toISOString().split('T')[0];
      setSelectedDataAgendamento(dataFormatada);

      // Se também tem horário específico, extrair
      const horaFormatada = dataInicial.toTimeString().slice(0, 5);
      console.log('horaFormatada: ', horaFormatada);
      if (horaFormatada !== '00:00') {
        setSelectedDataHora(dateUtils.toUTC(dataInicial));
        console.log('toUTC: ', dateUtils.toUTC(dataInicial));

        setEtapaAtual('servico'); // Ir direto para serviço
      } else {
        setEtapaAtual('servico'); // Começar com serviço
      }
    }

    setIsModalOpen(true);
  };

  const resetEtapas = () => {
    setEtapaAtual('servico');
    setSelectedServico(null);
    setSelectedDataAgendamento('');
    setSelectedProfissional(null);
    setSelectedDataHora('');
  };

  const handleServicoSelect = (servico: Servico) => {
    setSelectedServico(servico);

    // Se já tem data e hora preenchidas, pular para profissional
    if (selectedDataAgendamento && selectedDataHora) {
      setEtapaAtual('profissional');
    } else if (selectedDataAgendamento) {
      setEtapaAtual('profissional');
    } else {
      setEtapaAtual('data');
    }
  };

  const handleDataSelect = (data: string) => {
    setSelectedDataAgendamento(data);
    setEtapaAtual('profissional');
  };

  const handleProfissionalSelect = (profissional: Profissional) => {
    setSelectedProfissional(profissional);

    // Se já tem horário definido, pular para formulário
    if (selectedDataHora) {
      setEtapaAtual('formulario');
    } else {
      setEtapaAtual('horario');
    }
  };

  const handleHorarioSelect = (dataHora: string) => {
    setSelectedDataHora(dataHora);
    setEtapaAtual('formulario');
  };

  // Handlers CRUD
  const handleCreateSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      addToast('success', 'Agendamento criado com sucesso');
      setIsModalOpen(false);
      resetEtapas();
    } catch (error) {
      addToast('error', 'Erro ao criar agendamento', getErrorMessage(error));
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    console.log('🔍 handleEdit chamado com agendamento:', agendamento);
    console.log(
      '🔍 Estrutura completa do agendamento:',
      JSON.stringify(agendamento, null, 2)
    );

    // Verificar diferentes possíveis estruturas da API
    let servicoId = agendamento.servicoId;
    let profissionalId = agendamento.profissionalId;

    // Se não encontrar diretamente, tentar outras estruturas possíveis
    if (!servicoId && (agendamento as any).servico?.id) {
      servicoId = (agendamento as any).servico.id;
      console.log('🔍 ServiceId encontrado em servico.id:', servicoId);
    }

    if (!profissionalId && (agendamento as any).profissional?.id) {
      profissionalId = (agendamento as any).profissional.id;
      console.log('🔍 ProfissionalId encontrado em profissional.id:', profissionalId);
    }

    console.log(
      '🔍 IDs finais - servicoId:',
      servicoId,
      'profissionalId:',
      profissionalId
    );

    // Buscar dados completos do serviço e profissional
    const servico = servicos?.find((s) => s.id === servicoId);
    const profissional = profissionais?.find((p) => p.id === profissionalId);

    console.log('🔍 Serviços disponíveis:', servicos);
    console.log('🔍 Profissionais disponíveis:', profissionais);
    console.log('🔍 Serviço encontrado:', servico);
    console.log('🔍 Profissional encontrado:', profissional);

    if (servico && profissional) {
      console.log('✅ Dados encontrados, abrindo modal de edição');
      setSelectedAgendamento(agendamento);
      setSelectedServico(servico);
      setSelectedProfissional(profissional);
      setSelectedDataHora(agendamento.dataHora);
      setIsEditModalOpen(true);
    } else {
      console.error('❌ Não foi possível encontrar serviço ou profissional');
      console.error('❌ Serviço missing:', !servico);
      console.error('❌ Profissional missing:', !profissional);

      // Fallback: mostrar toast com erro
      addToast(
        'error',
        'Erro ao editar',
        'Não foi possível carregar os dados do agendamento'
      );
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (selectedAgendamento) {
      try {
        await updateMutation.mutateAsync({
          id: selectedAgendamento.id,
          data,
        });
        addToast('success', 'Agendamento atualizado com sucesso');
        setIsEditModalOpen(false);
        setSelectedAgendamento(null);
      } catch (error) {
        addToast('error', 'Erro ao atualizar agendamento', getErrorMessage(error));
      }
    }
  };

  const handleDelete = (agendamento: Agendamento) => {
    setAgendamentoToDelete(agendamento);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (agendamentoToDelete) {
      try {
        await deleteMutation.mutateAsync(agendamentoToDelete.id);
        addToast('success', 'Agendamento excluído com sucesso');
        setIsDeleteModalOpen(false);
        setAgendamentoToDelete(null);
      } catch (error) {
        addToast('error', 'Erro ao excluir agendamento', getErrorMessage(error));
      }
    }
  };

  // Utilitários
  const getStatusBadge = (status: StatusAgendamento) => {
    const badges = {
      AGENDADO: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      CONFIRMADO: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      EM_ANDAMENTO: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      CONCLUIDO: { color: 'bg-gray-100 text-gray-800', label: 'Concluído' },
      CANCELADO: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };
    return badges[status] || badges.AGENDADO;
  };

  const formatDateTime = (dateTime: string) => {
    return dateUtils.formatLocal(dateTime);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os agendamentos da sua empresa</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Visualização */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={tipoVisualizacao === 'lista' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisualizacao('lista')}
              className={`transition-all duration-200 ${tipoVisualizacao === 'lista' ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={tipoVisualizacao === 'calendario' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTipoVisualizacao('calendario')}
              className={`transition-all duration-200 ${tipoVisualizacao === 'calendario' ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-700'}`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendário
            </Button>
          </div>

          <Button onClick={() => handleNovoAgendamento()} className="sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Renderizar visualização selecionada */}
      {tipoVisualizacao === 'calendario' ? (
        <CalendarioView
          agendamentos={agendamentos || []}
          onNovoAgendamento={handleNovoAgendamento}
          onAgendamentoClick={handleEdit}
          onDayClick={(data) => {
            console.log('Dia clicado:', data);
          }}
        />
      ) : (
        <>
          {/* Filtros - apenas na visualização de lista */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por cliente, serviço ou profissional..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filtro por Status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as StatusAgendamento | 'ALL')
                  }
                >
                  <option value="ALL">Todos os status</option>
                  <option value="AGENDADO">Agendado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {/* Filtro por Data */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Limpar Filtros */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('ALL');
                  setSelectedDate('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Lista de Agendamentos */}
          <div className="space-y-4">
            {filteredAgendamentos?.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {search || selectedStatus !== 'ALL' || selectedDate
                    ? 'Nenhum agendamento encontrado com os filtros aplicados'
                    : 'Nenhum agendamento cadastrado'}
                </p>
                <Button onClick={() => handleNovoAgendamento()} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro agendamento
                </Button>
              </div>
            ) : (
              filteredAgendamentos?.map((agendamento) => {
                const statusBadge = getStatusBadge(agendamento.status);

                return (
                  <motion.div
                    key={agendamento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Cliente */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {agendamento.nomeCliente}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {agendamento.telefoneCliente}
                          </p>
                        </div>

                        {/* Serviço */}
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {agendamento.servicoTitulo}
                          </p>
                          <p className="text-sm text-gray-500">
                            {agendamento.profissionalNome}
                          </p>
                        </div>

                        {/* Data e Hora */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDateTime(agendamento.dataHora)}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>

                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log(
                                  '🖱️ Botão edit clicado para agendamento:',
                                  agendamento.id
                                );
                                handleEdit(agendamento);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(agendamento)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Modal de Criação - Multi-etapas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetEtapas();
        }}
        title="Novo Agendamento"
        size="lg"
      >
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span
              className={
                etapaAtual === 'servico'
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-500'
              }
            >
              1. Serviço
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={
                etapaAtual === 'data' ? 'text-primary-600 font-medium' : 'text-gray-500'
              }
            >
              2. Data
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={
                etapaAtual === 'profissional'
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-500'
              }
            >
              3. Profissional
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={
                etapaAtual === 'horario'
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-500'
              }
            >
              4. Horário
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={
                etapaAtual === 'formulario'
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-500'
              }
            >
              5. Dados
            </span>
          </div>

          {/* Etapa 1: Seleção de Serviço */}
          {etapaAtual === 'servico' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Escolha o Serviço</h3>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {servicos?.map((servico) => (
                  <button
                    key={servico.id}
                    onClick={() => handleServicoSelect(servico)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{servico.titulo}</div>
                    <div className="text-sm text-gray-500 mt-1">{servico.descricao}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">{servico.duracao} min</span>
                      <span className="font-medium text-primary-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(servico.preco)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 2: Seleção de Data */}
          {etapaAtual === 'data' && selectedServico && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Escolha a Data</h3>
                <p className="text-sm text-gray-500">
                  Serviço selecionado: {selectedServico.titulo}
                </p>
              </div>
              <div>
                <Input
                  type="date"
                  value={selectedDataAgendamento}
                  onChange={(e) => handleDataSelect(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Button variant="outline" onClick={() => setEtapaAtual('servico')}>
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 3: Seleção de Profissional */}
          {etapaAtual === 'profissional' && selectedServico && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Escolha o Profissional</h3>
                <p className="text-sm text-gray-500">
                  {selectedServico.titulo} -{' '}
                  {selectedDataAgendamento &&
                    new Intl.DateTimeFormat('pt-BR').format(
                      new Date(selectedDataAgendamento)
                    )}
                </p>
              </div>
              <div className="space-y-2">
                {selectedServico.profissionais?.map((profissional) => (
                  <button
                    key={profissional.id}
                    onClick={() => handleProfissionalSelect(profissional)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{profissional.nome}</div>
                    <div className="text-sm text-gray-500">{profissional.email}</div>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  selectedDataAgendamento
                    ? setEtapaAtual('servico')
                    : setEtapaAtual('data')
                }
              >
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 4: Seleção de Horário */}
          {etapaAtual === 'horario' && selectedServico && selectedProfissional && (
            <div className="space-y-4">
              <HorarioSelector
                servico={selectedServico}
                profissional={selectedProfissional}
                data={selectedDataAgendamento}
                onHorarioSelect={handleHorarioSelect}
              />
              <Button variant="outline" onClick={() => setEtapaAtual('profissional')}>
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 5: Formulário */}
          {etapaAtual === 'formulario' && selectedServico && selectedProfissional && (
            <div className="space-y-4">
              <AgendamentoForm
                servico={selectedServico}
                profissional={selectedProfissional}
                dataHora={selectedDataHora}
                onSubmit={handleCreateSubmit}
                isLoading={createMutation.isPending}
                empresaId={empresaId}
              />
              <Button
                variant="outline"
                onClick={() =>
                  selectedDataHora
                    ? setEtapaAtual('profissional')
                    : setEtapaAtual('horario')
                }
                disabled={createMutation.isPending}
              >
                Voltar
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAgendamento(null);
        }}
        title="Editar Agendamento"
        size="lg"
      >
        {selectedAgendamento && selectedServico && selectedProfissional && (
          <AgendamentoForm
            agendamento={selectedAgendamento}
            servico={selectedServico}
            profissional={selectedProfissional}
            dataHora={selectedDataHora}
            onSubmit={handleEditSubmit}
            isLoading={updateMutation.isPending}
            empresaId={empresaId}
          />
        )}
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">
                Tem certeza que deseja excluir este agendamento?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Cliente:</strong> {agendamentoToDelete?.nomeCliente}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Serviço:</strong> {agendamentoToDelete?.servicoTitulo}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Data:</strong>{' '}
                {agendamentoToDelete && formatDateTime(agendamentoToDelete.dataHora)}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Excluir Agendamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
