import { useState } from 'react';
import {
  useAgendamentos,
  useCreateAgendamento,
  useUpdateAgendamento,
  useDeleteAgendamento,
} from '@/hooks/useAgendamentos';
import { useServicos } from '@/hooks/useServicos';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';
import { dateUtils } from '@/utils/dateUtils';

type EtapaAgendamento = 'servico' | 'profissionais' | 'data' | 'horario' | 'formulario';

export interface AgendamentosModalStates {
  // Modal de criação
  isModalOpen: boolean;
  etapaAtual: EtapaAgendamento;
  selectedServico: Servico | null;
  selectedProfissionais: Profissional[];
  selectedDataAgendamento: string;
  selectedDataHora: string;
  profissionaisDisponiveisParaFiltro?: Profissional[]; // Novo: filtro de profissionais
  
  // Modal de edição
  isEditModalOpen: boolean;
  selectedAgendamento: Agendamento | null;
  
  // Modal de exclusão
  isDeleteModalOpen: boolean;
  agendamentoToDelete: Agendamento | null;
}

export interface AgendamentosFiltros {
  search: string;
  selectedStatus: StatusAgendamento | 'ALL';
  selectedDate: string;
}

export function useAgendamentosLogic(empresaId: number) {
  const { addToast } = useToast();

  // Estados dos filtros
  const [filtros, setFiltros] = useState<AgendamentosFiltros>({
    search: '',
    selectedStatus: 'ALL',
    selectedDate: '',
  });

  // Estados dos modals
  const [modalStates, setModalStates] = useState<AgendamentosModalStates>({
    isModalOpen: false,
    etapaAtual: 'servico',
    selectedServico: null,
    selectedProfissionais: [],
    selectedDataAgendamento: '',
    selectedDataHora: '',
    profissionaisDisponiveisParaFiltro: undefined,
    isEditModalOpen: false,
    selectedAgendamento: null,
    isDeleteModalOpen: false,
    agendamentoToDelete: null,
  });

  // Queries
  const { data: agendamentos, isLoading } = useAgendamentos({ empresaId });
  const { data: servicos } = useServicos(empresaId);
  const { data: profissionais } = useProfissionais(empresaId);

  // Mutations
  const createMutation = useCreateAgendamento();
  const updateMutation = useUpdateAgendamento();
  const deleteMutation = useDeleteAgendamento();

  // Filtros aplicados
  const agendamentosFiltrados = agendamentos?.filter((agend) => {
    const searchLower = filtros.search.toLowerCase();
    const matchesSearch =
      agend.nomeCliente?.toLowerCase()?.includes(searchLower) ||
      agend.servicoTitulo?.toLowerCase()?.includes(searchLower) ||
      agend.profissionalNome?.toLowerCase()?.includes(searchLower);

    const matchesStatus = filtros.selectedStatus === 'ALL' || agend.status === filtros.selectedStatus;
    const matchesDate = !filtros.selectedDate || dateUtils.extractDateString(agend.dataHora) === filtros.selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handlers principais
  const handleNovoAgendamento = (dataInicial?: Date) => {
    resetEtapas();
    
    console.log('🎯 handleNovoAgendamento chamado:', dataInicial);
    
    if (dataInicial) {
      const dataFormatada = dateUtils.toDateString(dataInicial);
      setModalStates(prev => ({
        ...prev,
        selectedDataAgendamento: dataFormatada
      }));

      // Verificar se tem horário específico
      const horaFormatada = dataInicial.toTimeString().slice(0, 5);
      if (horaFormatada !== '00:00') {
        const dataHora = dateUtils.toISOString(dataInicial);
        
        // Verificar se há profissionais filtrados para este horário (sem pré-selecionar)
        const profissionaisFiltrados = (dataInicial as any).profissionaisDisponiveisParaFiltro;
        if (profissionaisFiltrados && profissionaisFiltrados.length > 0) {
          console.log('✅ Profissionais filtrados encontrados:', profissionaisFiltrados.map((p: any) => p.nome));
          console.log('🔍 Estes profissionais serão usados para FILTRAR (não pré-selecionar)');
          
          setModalStates(prev => ({
            ...prev,
            selectedDataHora: dataHora,
            profissionaisDisponiveisParaFiltro: profissionaisFiltrados,
            etapaAtual: 'servico'
          }));
        } else {
          setModalStates(prev => ({
            ...prev,
            selectedDataHora: dataHora,
            etapaAtual: 'servico'
          }));
        }
      } else {
        setModalStates(prev => ({
          ...prev,
          etapaAtual: 'servico'
        }));
      }
    }

    setModalStates(prev => ({
      ...prev,
      isModalOpen: true
    }));
  };

  const handleEdit = (agendamento: Agendamento) => {
    let servicoId = agendamento.servicoId;
    let profissionalId = agendamento.profissionalId;

    if (!servicoId && (agendamento as any).servico?.id) {
      servicoId = (agendamento as any).servico.id;
    }
    if (!profissionalId && (agendamento as any).profissional?.id) {
      profissionalId = (agendamento as any).profissional.id;
    }

    const servico = servicos?.find((s) => s.id === servicoId);
    const profissional = profissionais?.find((p) => p.id === profissionalId);

    if (servico && profissional) {
      setModalStates(prev => ({
        ...prev,
        selectedAgendamento: agendamento,
        selectedServico: servico,
        selectedProfissionais: [profissional],
        selectedDataHora: agendamento.dataHora,
        isEditModalOpen: true
      }));
    } else {
      addToast('error', 'Erro ao editar', 'Não foi possível carregar os dados do agendamento');
    }
  };

  const handleDelete = (agendamento: Agendamento) => {
    setModalStates(prev => ({
      ...prev,
      agendamentoToDelete: agendamento,
      isDeleteModalOpen: true
    }));
  };

  // Handlers dos modals
  const resetEtapas = () => {
    setModalStates(prev => ({
      ...prev,
      etapaAtual: 'servico',
      selectedServico: null,
      selectedProfissionais: [],
      selectedDataAgendamento: '',
      selectedDataHora: '',
      profissionaisDisponiveisParaFiltro: undefined,
    }));
  };

  const handleServicoSelect = (servico: Servico) => {
    setModalStates(prev => ({
      ...prev,
      selectedServico: servico,
      etapaAtual: 'profissionais'
    }));
  };

  const handleProfissionaisSelect = (profissionais: Profissional[]) => {
    setModalStates(prev => ({
      ...prev,
      selectedProfissionais: profissionais,
      etapaAtual: prev.selectedDataAgendamento && prev.selectedDataHora ? 'formulario' : 
                   prev.selectedDataAgendamento ? 'horario' : 'data'
    }));
  };

  const handleDataSelect = (data: string) => {
    setModalStates(prev => ({
      ...prev,
      selectedDataAgendamento: data,
      etapaAtual: 'horario'
    }));
  };

  const handleHorarioSelect = (dataHora: string, profissionalId?: number) => {
    setModalStates(prev => ({
      ...prev,
      selectedDataHora: dataHora,
      etapaAtual: 'formulario'
    }));

    // Se um profissional específico foi selecionado, usar apenas ele
    // Senão, manter os profissionais já selecionados
    if (profissionalId) {
      const profissional = modalStates.selectedProfissionais.find(p => p.id === profissionalId);
      if (profissional) {
        setModalStates(prev => ({
          ...prev,
          selectedDataHora: dataHora,
          selectedProfissionais: [profissional],
          etapaAtual: 'formulario'
        }));
      }
    }
  };

  const handleCreateSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      addToast('success', 'Agendamento criado com sucesso');
      setModalStates(prev => ({
        ...prev,
        isModalOpen: false
      }));
      resetEtapas();
    } catch (error) {
      addToast('error', 'Erro ao criar agendamento', getErrorMessage(error));
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (modalStates.selectedAgendamento) {
      try {
        await updateMutation.mutateAsync({
          id: modalStates.selectedAgendamento.id,
          data,
        });
        addToast('success', 'Agendamento atualizado com sucesso');
        setModalStates(prev => ({
          ...prev,
          isEditModalOpen: false,
          selectedAgendamento: null
        }));
      } catch (error) {
        addToast('error', 'Erro ao atualizar agendamento', getErrorMessage(error));
      }
    }
  };

  const confirmDelete = async () => {
    if (modalStates.agendamentoToDelete) {
      try {
        await deleteMutation.mutateAsync(modalStates.agendamentoToDelete.id);
        addToast('success', 'Agendamento excluído com sucesso');
        setModalStates(prev => ({
          ...prev,
          isDeleteModalOpen: false,
          agendamentoToDelete: null
        }));
      } catch (error) {
        addToast('error', 'Erro ao excluir agendamento', getErrorMessage(error));
      }
    }
  };

  const handleFiltrosChange = (novosFiltros: Partial<AgendamentosFiltros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const modalHandlers = {
    resetEtapas,
    handleServicoSelect,
    handleProfissionaisSelect,
    handleDataSelect,
    handleHorarioSelect,
    handleCreateSubmit,
    handleEditSubmit,
    confirmDelete,
    setModalStates,
    createMutation,
    updateMutation,
    deleteMutation,
  };

  return {
    // Estados e dados
    agendamentos,
    isLoading,
    servicos,
    profissionais,
    
    // Estados dos modais
    modalStates,
    
    // Handlers principais
    handleNovoAgendamento,
    handleEdit,
    handleDelete,
    
    // Handlers dos modals
    modalHandlers,
    
    // Estados dos filtros
    filtros,
    agendamentosFiltrados,
    handleFiltrosChange,
  };
}