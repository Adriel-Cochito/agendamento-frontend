// src/hooks/useAgendamentoPublico.ts - Corrigido para evitar loops infinitos
import { useState, useCallback, useEffect, useMemo } from 'react';
import { agendamentosPublicosApi, ServicoPublico, AgendaPublica, EmpresaPublica } from '@/api/agendamentosPublicos';
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
    observacoes: string
  };
}

interface EmpresaInfoUrl {
  nomeFromUrl: string | null;
  telefoneFromUrl: string | null;
}

interface UseAgendamentoPublicoLogicResult {
  // Estados
  loading: boolean;
  error: string | null;
  sucesso: boolean;
  empresa: EmpresaPublica | null;
  servicos: ServicoPublico[];
  horariosDisponiveis: AgendaPublica[];
  modalStates: EstadoAgendamento;
  
  // Informações da URL
  empresaFromUrl: EmpresaInfoUrl;
  
  // Ações de navegação
  handleServicoSelect: (servico: Servico) => void;
  handleProfissionaisSelect: (profissionais: Profissional[]) => void;
  handleDataSelect: (data: string) => void;
  handleHorarioSelect: (dataHora: string, profissionalId?: number) => void;
  voltarEtapa: () => void;
  
  // Ações de dados
  atualizarDadosCliente: (campo: 'nomeCliente' | 'telefoneCliente' | 'observacoes', valor: string) => void;
  finalizarAgendamento: () => Promise<void>;
  reiniciarAgendamento: () => void;
  
  // Validações
  validarEtapa: () => boolean;
  
  // Carregamento de dados
  carregarServicos: () => Promise<void>;
  carregarHorariosDisponiveis: () => Promise<void>;
}

export function useAgendamentoPublicoLogic(
  empresaId: number,
  empresaInfoUrl?: EmpresaInfoUrl
): UseAgendamentoPublicoLogicResult {
  const { addToast } = useToast();

  // Estados principais
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [empresa, setEmpresa] = useState<EmpresaPublica | null>(null);
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
      observacoes: ''
    },
  });

  // Informações da empresa vindas da URL - memoizado para evitar re-criações
  const empresaFromUrl: EmpresaInfoUrl = useMemo(() => empresaInfoUrl || {
    nomeFromUrl: null,
    telefoneFromUrl: null
  }, [empresaInfoUrl]);

  // Carregar dados da empresa - memoizado com useCallback
  const carregarEmpresa = useCallback(async () => {
    if (loading) {
      console.log('⏳ [HOOK] Carregamento já em andamento, ignorando chamada duplicada');
      return; // Evita chamadas simultâneas
    }
    
    try {
      console.log('🚀 [HOOK] Iniciando carregamento da empresa:', {
        empresaId,
        loading,
        hasEmpresaFromUrl: !!empresaFromUrl.nomeFromUrl
      });
      
      setLoading(true);
      setError(null);
      
      console.log('🔄 [HOOK] Carregando empresa via API para ID:', empresaId);
      const empresaData = await agendamentosPublicosApi.getEmpresa(empresaId);
      console.log('✅ [HOOK] Dados da empresa carregados:', empresaData);
      
      setEmpresa(empresaData);
      
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar dados da empresa.';
      setError(errorMessage);
      console.error('❌ [HOOK] Erro ao carregar empresa:', {
        error,
        empresaId,
        hasEmpresaFromUrl: !!empresaFromUrl.nomeFromUrl,
        errorMessage: error.message,
        status: error.response?.status
      });
      
      // Se há informações da URL, usar como fallback sem mostrar toast
      if (empresaFromUrl.nomeFromUrl) {
        console.log('💡 [HOOK] Usando dados da URL como fallback');
      }
    } finally {
      console.log('🏁 [HOOK] Finalizando carregamento da empresa');
      setLoading(false);
    }
  }, [empresaId, empresaFromUrl.nomeFromUrl]); // Dependências mínimas

  // Carregar serviços - memoizado
  const carregarServicos = useCallback(async () => {
    if (loading) {
      console.log('⏳ [HOOK] Carregamento já em andamento, ignorando chamada de serviços');
      return; // Evita chamadas simultâneas
    }
    
    try {
      console.log('🛍️ [HOOK] Iniciando carregamento de serviços para empresa:', empresaId);
      setLoading(true);
      setError(null);
      
      const servicosData = await agendamentosPublicosApi.getServicos(empresaId);
      const servicosAtivos = servicosData.filter(s => s.ativo);
      
      console.log('✅ [HOOK] Serviços carregados:', {
        total: servicosData.length,
        ativos: servicosAtivos.length,
        servicos: servicosData.map(s => ({ id: s.id, titulo: s.titulo, ativo: s.ativo }))
      });
      
      setServicos(servicosAtivos);
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar serviços. Tente recarregar a página.';
      setError(errorMessage);
      console.error('❌ [HOOK] Erro ao carregar serviços:', {
        error,
        empresaId,
        errorMessage: error.message,
        status: error.response?.status
      });
    } finally {
      console.log('🏁 [HOOK] Finalizando carregamento de serviços');
      setLoading(false);
    }
  }, [empresaId]); // Só empresaId como dependência

  // Carregar horários disponíveis - memoizado e com condições claras
  const carregarHorariosDisponiveis = useCallback(async () => {
    const { selectedServico, selectedProfissionais, selectedDataAgendamento } = modalStates;
    
    console.log('📅 [HOOK] Verificando condições para carregar horários:', {
      hasServico: !!selectedServico,
      hasProfissionais: selectedProfissionais.length > 0,
      hasData: !!selectedDataAgendamento,
      loading
    });
    
    if (!selectedServico || selectedProfissionais.length === 0 || !selectedDataAgendamento) {
      console.log('⚠️ [HOOK] Dados insuficientes para carregar horários');
      return;
    }

    if (loading) {
      console.log('⏳ [HOOK] Carregamento já em andamento, ignorando chamada de horários');
      return; // Evita chamadas simultâneas
    }

    try {
      console.log('🔄 [HOOK] Iniciando carregamento de horários:', {
        empresaId,
        servico: selectedServico.id,
        profissional: selectedProfissionais[0].id,
        data: selectedDataAgendamento
      });
      
      setLoading(true);
      setError(null);
      
      const horarios = await agendamentosPublicosApi.getAgenda(
        empresaId,
        selectedServico.id,
        selectedProfissionais[0].id,
        selectedDataAgendamento
      );
      
      console.log('✅ [HOOK] Horários carregados:', {
        quantidade: horarios.length,
        horarios: horarios.map((h: any) => ({ hora: h.horario, disponivel: h.disponivel }))
      });
      
      setHorariosDisponiveis(horarios);
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar horários disponíveis.';
      setError(errorMessage);
      console.error('❌ [HOOK] Erro ao carregar horários:', {
        error,
        empresaId,
        servico: selectedServico.id,
        profissional: selectedProfissionais[0].id,
        data: selectedDataAgendamento,
        errorMessage: error.message,
        status: error.response?.status
      });
    } finally {
      console.log('🏁 [HOOK] Finalizando carregamento de horários');
      setLoading(false);
    }
  }, [
    empresaId, 
    modalStates.selectedServico?.id, 
    modalStates.selectedProfissionais[0]?.id, 
    modalStates.selectedDataAgendamento
  ]); // Dependências específicas

  // Efeito para carregar dados iniciais - apenas uma vez
  useEffect(() => {
    let mounted = true;

    const carregarDadosIniciais = async () => {
      console.log('🚀 [HOOK] Iniciando carregamento de dados iniciais:', {
        empresaId,
        mounted,
        hasEmpresaFromUrl: !!empresaFromUrl.nomeFromUrl
      });
      
      if (mounted) {
        console.log('🏢 [HOOK] Carregando empresa...');
        await carregarEmpresa();
      }
      
      if (mounted) {
        console.log('🛍️ [HOOK] Carregando serviços...');
        await carregarServicos();
      }
      
      console.log('✅ [HOOK] Carregamento inicial concluído');
    };
    
    carregarDadosIniciais();

    return () => {
      console.log('🧹 [HOOK] Limpando efeito de carregamento inicial');
      mounted = false;
    };
  }, [empresaId]); // Só empresaId como dependência

  // Efeito para carregar horários quando necessário - com condições específicas
  useEffect(() => {
    console.log('📅 [HOOK] Verificando se deve carregar horários:', {
      etapaAtual: modalStates.etapaAtual,
      hasServico: !!modalStates.selectedServico,
      hasProfissionais: modalStates.selectedProfissionais.length > 0,
      hasData: !!modalStates.selectedDataAgendamento,
      shouldLoad: modalStates.etapaAtual === 'horario' && 
                  modalStates.selectedServico && 
                  modalStates.selectedProfissionais.length > 0 && 
                  modalStates.selectedDataAgendamento
    });
    
    if (modalStates.etapaAtual === 'horario' && 
        modalStates.selectedServico && 
        modalStates.selectedProfissionais.length > 0 && 
        modalStates.selectedDataAgendamento) {
      console.log('🔄 [HOOK] Condições atendidas, carregando horários...');
      carregarHorariosDisponiveis();
    }
  }, [
    modalStates.etapaAtual,
    modalStates.selectedServico?.id,
    modalStates.selectedProfissionais[0]?.id,
    modalStates.selectedDataAgendamento,
    carregarHorariosDisponiveis
  ]);

  // Handlers de navegação - todos memoizados
  const handleServicoSelect = useCallback((servico: Servico) => {
    console.log('🎯 [HOOK] Serviço selecionado:', {
      id: servico.id,
      titulo: servico.titulo,
      duracao: servico.duracao,
      preco: servico.preco,
      profissionaisCount: servico.profissionais?.length || 0
    });
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
    console.log('👥 [HOOK] Profissional(is) selecionado(s):', {
      count: profissionais.length,
      nomes: profissionais.map(p => p.nome),
      ids: profissionais.map(p => p.id)
    });
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
    console.log('📅 [HOOK] Data selecionada:', {
      data,
      formatted: new Date(data).toLocaleDateString('pt-BR')
    });
    setModalStates(prev => ({
      ...prev,
      selectedDataAgendamento: data,
      selectedDataHora: '',
      etapaAtual: 'horario'
    }));
    setError(null);
  }, []);

  const handleHorarioSelect = useCallback((dataHora: string, profissionalId?: number) => {
    console.log('⏰ [HOOK] Horário selecionado:', {
      dataHora,
      profissionalId,
      formatted: new Date(dataHora).toLocaleString('pt-BR')
    });
    
    setModalStates(prev => {
      let profissionaisSelecionados = prev.selectedProfissionais;
      
      // Se um profissional específico foi selecionado no horário, usar apenas ele
      if (profissionalId) {
        const profissional = prev.selectedProfissionais.find(p => p.id === profissionalId);
        if (profissional) {
          profissionaisSelecionados = [profissional];
          console.log('👤 [HOOK] Profissional específico selecionado:', {
            id: profissional.id,
            nome: profissional.nome
          });
        }
      }

      return {
        ...prev,
        selectedDataHora: dataHora,
        selectedProfissionais: profissionaisSelecionados,
        etapaAtual: 'dados'
      };
    });
    setError(null);
  }, []);

  const voltarEtapa = useCallback(() => {
    setModalStates(prev => {
      const etapaAtual = prev.etapaAtual;
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

      console.log('⬅️ Voltando da etapa:', etapaAtual, 'para:', proximaEtapa);
      
      return {
        ...prev,
        etapaAtual: proximaEtapa
      };
    });
    setError(null);
  }, []);

  // Atualizar dados do cliente - memoizado
  const atualizarDadosCliente = useCallback((campo: 'nomeCliente' | 'telefoneCliente' | 'observacoes', valor: string) => {
    setModalStates(prev => ({
      ...prev,
      dadosCliente: {
        ...prev.dadosCliente,
        [campo]: valor
      }
    }));
  }, []);

  // Validar etapa atual - memoizado
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
        const nomeValido = dadosCliente.nomeCliente.trim().length >= 3;
        const telefoneValido = dadosCliente.telefoneCliente.length >= 17;
        return nomeValido && telefoneValido;
      default:
        return false;
    }
  }, [modalStates]);

  // Finalizar agendamento - memoizado
  const finalizarAgendamento = useCallback(async () => {
    const { selectedServico, selectedProfissionais, selectedDataHora, dadosCliente } = modalStates;

    console.log('🎯 Finalizando agendamento...');

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
        observacoes: dadosCliente.observacoes?.trim() || null,
        dataHora: selectedDataHora,
        status: 'AGENDADO' as const,
        empresa: { id: empresaId },
        servico: { id: selectedServico.id },
        profissional: { id: selectedProfissionais[0].id }
      };

      console.log('📤 Enviando agendamento:', agendamentoData);

      await agendamentosPublicosApi.createAgendamento(empresaId, agendamentoData);
      
      console.log('✅ Agendamento criado com sucesso!');
      
      setModalStates(prev => ({
        ...prev,
        etapaAtual: 'confirmacao'
      }));
      setSucesso(true);
      
      // Determinar nome da empresa para o toast
      const nomeEmpresa = empresa?.nome || empresaFromUrl.nomeFromUrl || 'empresa';
      
      addToast('success', 'Agendamento confirmado!', `Seu agendamento com ${nomeEmpresa} foi realizado com sucesso.`);
    } catch (error: any) {
      console.error('❌ Erro ao criar agendamento:', error);
      
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
  }, [modalStates, empresaId, addToast, empresa, empresaFromUrl]);

  // Reiniciar processo - memoizado
  const reiniciarAgendamento = useCallback(() => {
    console.log('🔄 Reiniciando processo de agendamento');
    setModalStates({
      etapaAtual: 'servico',
      selectedServico: null,
      selectedProfissionais: [],
      selectedDataAgendamento: '',
      selectedDataHora: '',
      dadosCliente: {
        nomeCliente: '',
        telefoneCliente: '+55 ',
        observacoes: ''
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
    empresa,
    servicos,
    horariosDisponiveis,
    modalStates,
    
    // Informações da URL
    empresaFromUrl,
    
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