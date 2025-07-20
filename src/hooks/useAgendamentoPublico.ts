// src/hooks/useAgendamentoPublico.ts - Atualizado com suporte a parâmetros da URL
import { useState, useCallback, useEffect } from 'react';
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
  atualizarDadosCliente: (campo: 'nomeCliente' | 'telefoneCliente', valor: string) => void;
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
    },
  });

  // Informações da empresa vindas da URL
  const empresaFromUrl: EmpresaInfoUrl = empresaInfoUrl || {
    nomeFromUrl: null,
    telefoneFromUrl: null
  };

  // Carregar dados da empresa
  const carregarEmpresa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando empresa via API para ID:', empresaId);
      const empresaData = await agendamentosPublicosApi.getEmpresa(empresaId);
      console.log('✅ Dados da empresa carregados:', empresaData);
      
      setEmpresa(empresaData);
      
      // Log para comparar dados da API vs URL
      if (empresaFromUrl.nomeFromUrl || empresaFromUrl.telefoneFromUrl) {
        console.log('📊 Comparação API vs URL:', {
          api: {
            nome: empresaData.nome,
            telefone: empresaData.telefone
          },
          url: {
            nome: empresaFromUrl.nomeFromUrl,
            telefone: empresaFromUrl.telefoneFromUrl
          }
        });
      }
      
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar dados da empresa.';
      setError(errorMessage);
      console.error('❌ Erro ao carregar empresa:', error);
      
      // Se há informações da URL, pelo menos temos um fallback
      if (empresaFromUrl.nomeFromUrl) {
        console.log('💡 Usando dados da URL como fallback');
        addToast('info', 'Aviso', 'Usando informações do link. Alguns dados podem estar desatualizados.');
      }
    } finally {
      setLoading(false);
    }
  }, [empresaId, empresaFromUrl, addToast]);

  // Carregar serviços
  const carregarServicos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const servicosData = await agendamentosPublicosApi.getServicos(empresaId);
      setServicos(servicosData.filter(s => s.ativo));
      console.log('✅ Serviços carregados:', servicosData.length);
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar serviços. Tente recarregar a página.';
      setError(errorMessage);
      console.error('❌ Erro ao carregar serviços:', error);
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
      console.log('✅ Horários carregados:', horarios.length);
    } catch (error: any) {
      const errorMessage = 'Erro ao carregar horários disponíveis.';
      setError(errorMessage);
      console.error('❌ Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, modalStates.selectedServico, modalStates.selectedProfissionais, modalStates.selectedDataAgendamento]);

  // Carregar dados iniciais automaticamente ao montar
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      console.log('🚀 Iniciando carregamento de dados iniciais');
      await Promise.all([
        carregarEmpresa(),
        carregarServicos()
      ]);
    };
    
    carregarDadosIniciais();
  }, [carregarEmpresa, carregarServicos]);

  // Carregar horários quando chegar na etapa horario
  useEffect(() => {
    if (modalStates.etapaAtual === 'horario') {
      carregarHorariosDisponiveis();
    }
  }, [modalStates.etapaAtual, carregarHorariosDisponiveis]);

  // Handlers de navegação
  const handleServicoSelect = useCallback((servico: Servico) => {
    console.log('🎯 Serviço selecionado:', servico.titulo);
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
    console.log('👥 Profissional(is) selecionado(s):', profissionais.map(p => p.nome));
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
    console.log('📅 Data selecionada:', data);
    setModalStates(prev => ({
      ...prev,
      selectedDataAgendamento: data,
      selectedDataHora: '',
      etapaAtual: 'horario'
    }));
    setError(null);
  }, []);

  const handleHorarioSelect = useCallback((dataHora: string, profissionalId?: number) => {
    console.log('⏰ Horário selecionado:', dataHora, 'Profissional ID:', profissionalId);
    
    let profissionaisSelecionados = modalStates.selectedProfissionais;
    
    // Se um profissional específico foi selecionado no horário, usar apenas ele
    if (profissionalId) {
      const profissional = modalStates.selectedProfissionais.find(p => p.id === profissionalId);
      if (profissional) {
        profissionaisSelecionados = [profissional];
        console.log('👤 Profissional específico selecionado:', profissional.nome);
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

    console.log('⬅️ Voltando da etapa:', etapaAtual, 'para:', proximaEtapa);
    setModalStates(prev => ({
      ...prev,
      etapaAtual: proximaEtapa
    }));
    setError(null);
  }, [modalStates.etapaAtual]);

  // Atualizar dados do cliente
  const atualizarDadosCliente = useCallback((campo: 'nomeCliente' | 'telefoneCliente', valor: string) => {
    console.log('📝 Atualizando dados do cliente:', campo, valor);
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
        const nomeValido = dadosCliente.nomeCliente.trim().length >= 3;
        const telefoneValido = dadosCliente.telefoneCliente.length >= 17;
        console.log('✅ Validação dados:', { nomeValido, telefoneValido });
        return nomeValido && telefoneValido;
      default:
        return false;
    }
  }, [modalStates]);

  // Finalizar agendamento
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

  // Reiniciar processo
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