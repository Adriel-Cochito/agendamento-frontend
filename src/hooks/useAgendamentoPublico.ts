// src/hooks/useAgendamentoPublicoLogic.ts
import { useState, useCallback, useEffect } from 'react';
import { agendamentosPublicosApi, ServicoPublico, AgendaPublica } from '@/api/agendamentosPublicos';
import { useToast } from '@/hooks/useToast';
import { Servico } from '@/types/servico';
import { Profissional } from '@/types/profissional';

type Etapa = 'servico' | 'profissionais' | 'data' | 'horario' | 'dados' | 'confirmacao';

interface EstadoAgendamento {
  etapaAtual: Etapa;
  selectedServico: Servico | null;
  selectedProfissionais: Profissional[];
  selectedDataAgendamento: string;
  selectedDataHora: string;
  dadosCliente: {
    nomeCliente: string;
    telefoneCliente: string;
  };
}

interface UseAgendamentoPublicoLogicResult {
  // Estados
  loading: boolean;
  error: string | null;
  sucesso: boolean;
  servicos: ServicoPublico[];
  horariosDisponiveis: AgendaPublica[];
  modalStates: EstadoAgendamento;
  
  // Ações de navegação
  handleServicoSelect: (servico: Servico) => void;
  handleProfissionaisSelect: (profissionais: Profissional[]) => void;
  handleDataSelect: (data: string) => void;
  handleHorarioSelect: (dataHora: string, profissionalId?: number) => void;
  voltarEtapa: () => void;
  
  // Ações de dados
  atualizarDadosCliente: (campo: 'nomeCliente' | 'telefoneCliente', valor: string) => void;
  finalizarAgendamento: () => Promise<void>;
  reiniciarAgendamento: () => void;
  
  // Validações
  validarEtapa: () => boolean;
  
  // Carregamento de dados
  carregarServicos: () => Promise<void>;
  carregarHorariosDisponiveis: () => Promise<void>;
}

export function useAgendamentoPublicoLogic(empresaId: number): UseAgendamentoPublicoLogicResult {
  const { addToast } = useToast();

  // Estados principais
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [servicos, setServicos] = useState<ServicoPublico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<AgendaPublica[]>([]);

  // Estado do modal/fluxo
  const [modalStates, setModalStates] = useState<EstadoAgendamento>({
    etapaAtual: 'servico',
    selectedServico: null,
    selectedProfissionais: [],
    selectedDataAgendamento: '',
    selectedDataHora: '',
    dadosCliente: {
      nomeCliente: '',
      telefoneCliente: '+55 ',
    },
  });

  // Carregar serviços
  const carregarServicos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const servicosData = await agendamentosPublicosApi.getServicos(empresaId);
      setServicos(servicosData.filter(s => s.ativo));
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar serviços. Tente recarregar a página.';
      setError(errorMessage);
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  // Carregar horários disponíveis
  const carregarHorariosDisponiveis = useCallback(async () => {
    const { selectedServico, selectedProfissionais, selectedDataAgendamento } = modalStates;
    
    if (!selectedServico || selectedProfissionais.length === 0 || !selectedDataAgendamento) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const horarios = await agendamentosPublicosApi.getAgenda(
        empresaId,
        selectedServico.id,
        selectedProfissionais[0].id,
        selectedDataAgendamento
      );
      
      setHorariosDisponiveis(horarios);
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar horários disponíveis.';
      setError(errorMessage);
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, modalStates.selectedServico, modalStates.selectedProfissionais, modalStates.selectedDataAgendamento]);

  // Carregar serviços automaticamente ao montar
  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  // Carregar horários quando chegar na etapa horario
  useEffect(() => {
    if (modalStates.etapaAtual === 'horario') {
      carregarHorariosDisponiveis();
    }
  }, [modalStates.etapaAtual, carregarHorariosDisponiveis]);

  // Handlers de navegação
  const handleServicoSelect = useCallback((servico: Servico) => {
    setModalStates(prev => ({
      ...prev,
      selectedServico: servico,
      selectedProfissionais: [],
      selectedDataAgendamento: '',
      selectedDataHora: '',
      etapaAtual: 'profissionais'
    }));
    setError(null);
  }, []);

  const handleProfissionaisSelect = useCallback((profissionais: Profissional[]) => {
    setModalStates(prev => ({
      ...prev,
      selectedProfissionais: profissionais,
      selectedDataAgendamento: '',
      selectedDataHora: '',
      etapaAtual: 'data'
    }));
    setError(null);
  }, []);

  const handleDataSelect = useCallback((data: string) => {
    setModalStates(prev => ({
      ...prev,
      selectedDataAgendamento: data,
      selectedDataHora: '',
      etapaAtual: 'horario'
    }));
    setError(null);
  }, []);

  const handleHorarioSelect = useCallback((dataHora: string, profissionalId?: number) => {
    let profissionaisSelecionados = modalStates.selectedProfissionais;
    
    // Se um profissional específico foi selecionado no horário, usar apenas ele
    if (profissionalId) {
      const profissional = modalStates.selectedProfissionais.find(p => p.id === profissionalId);
      if (profissional) {
        profissionaisSelecionados = [profissional];
      }
    }

    setModalStates(prev => ({
      ...prev,
      selectedDataHora: dataHora,
      selectedProfissionais: profissionaisSelecionados,
      etapaAtual: 'dados'
    }));
    setError(null);
  }, [modalStates.selectedProfissionais]);

  const voltarEtapa = useCallback(() => {
    const etapaAtual = modalStates.etapaAtual;
    let proximaEtapa: Etapa = 'servico';

    switch (etapaAtual) {
      case 'profissionais':
        proximaEtapa = 'servico';
        break;
      case 'data':
        proximaEtapa = 'profissionais';
        break;
      case 'horario':
        proximaEtapa = 'data';
        break;
      case 'dados':
        proximaEtapa = 'horario';
        break;
      default:
        proximaEtapa = 'servico';
    }

    setModalStates(prev => ({
      ...prev,
      etapaAtual: proximaEtapa
    }));
    setError(null);
  }, [modalStates.etapaAtual]);

  // Atualizar dados do cliente
  const atualizarDadosCliente = useCallback((campo: 'nomeCliente' | 'telefoneCliente', valor: string) => {
    setModalStates(prev => ({
      ...prev,
      dadosCliente: {
        ...prev.dadosCliente,
        [campo]: valor
      }
    }));
  }, []);

  // Validar etapa atual
  const validarEtapa = useCallback(() => {
    const { etapaAtual, selectedServico, selectedProfissionais, selectedDataAgendamento, selectedDataHora, dadosCliente } = modalStates;

    switch (etapaAtual) {
      case 'servico':
        return !!selectedServico;
      case 'profissionais':
        return selectedProfissionais.length > 0;
      case 'data':
        return !!selectedDataAgendamento;
      case 'horario':
        return !!selectedDataHora;
      case 'dados':
        return dadosCliente.nomeCliente.trim().length >= 3 && 
               dadosCliente.telefoneCliente.length >= 17;
      default:
        return false;
    }
  }, [modalStates]);

  // Finalizar agendamento
  const finalizarAgendamento = useCallback(async () => {
    const { selectedServico, selectedProfissionais, selectedDataHora, dadosCliente } = modalStates;

    if (!selectedServico || selectedProfissionais.length === 0 || !selectedDataHora) {
      setError('Dados incompletos para finalizar o agendamento.');
      return;
    }

    // Validações finais
    if (dadosCliente.nomeCliente.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      return;
    }

    const telefoneRegex = /^\+55\s\d{2}\s\d{5}-\d{4}$/;
    if (!telefoneRegex.test(dadosCliente.telefoneCliente)) {
      setError('Formato de telefone inválido. Use: +55 31 99999-8888');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agendamentoData = {
        nomeCliente: dadosCliente.nomeCliente.trim(),
        telefoneCliente: dadosCliente.telefoneCliente,
        dataHora: selectedDataHora,
        status: 'AGENDADO' as const,
        empresa: { id: empresaId },
        servico: { id: selectedServico.id },
        profissional: { id: selectedProfissionais[0].id }
      };

      await agendamentosPublicosApi.createAgendamento(empresaId, agendamentoData);
      
      setModalStates(prev => ({
        ...prev,
        etapaAtual: 'confirmacao'
      }));
      setSucesso(true);
      addToast('success', 'Agendamento confirmado!', 'Seu agendamento foi realizado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      
      if (error.response?.status === 409) {
        setError('Este horário não está mais disponível. Por favor, escolha outro horário.');
        setModalStates(prev => ({ ...prev, etapaAtual: 'horario' }));
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.errors?.length > 0) {
          setError(errorData.errors[0].message || 'Dados inválidos. Verifique as informações.');
        } else {
          setError('Dados inválidos. Verifique as informações.');
        }
      } else {
        setError('Erro ao confirmar agendamento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [modalStates, empresaId, addToast]);

  // Reiniciar processo
  const reiniciarAgendamento = useCallback(() => {
    setModalStates({
      etapaAtual: 'servico',
      selectedServico: null,
      selectedProfissionais: [],
      selectedDataAgendamento: '',
      selectedDataHora: '',
      dadosCliente: {
        nomeCliente: '',
        telefoneCliente: '+55 ',
      },
    });
    setSucesso(false);
    setError(null);
    setHorariosDisponiveis([]);
  }, []);

  return {
    // Estados
    loading,
    error,
    sucesso,
    servicos,
    horariosDisponiveis,
    modalStates,
    
    // Ações de navegação
    handleServicoSelect,
    handleProfissionaisSelect,
    handleDataSelect,
    handleHorarioSelect,
    voltarEtapa,
    
    // Ações de dados
    atualizarDadosCliente,
    finalizarAgendamento,
    reiniciarAgendamento,
    
    // Validações
    validarEtapa,
    
    // Carregamento de dados
    carregarServicos,
    carregarHorariosDisponiveis,
  };
}