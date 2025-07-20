// src/hooks/useAgendamentoPublico.ts
import { useState, useCallback } from 'react';
import { agendamentosPublicosApi, ServicoPublico, AgendaPublica } from '@/api/agendamentosPublicos';
import { 
  validarAgendamentoPublico, 
  formatarErrosValidacao, 
  DadosAgendamentoPublico,
  ErroValidacao 
} from '@/utils/validacoesAgendamentoPublico';

type Etapa = 'servico' | 'profissional' | 'data' | 'horario' | 'dados' | 'confirmacao';

interface EstadoAgendamento {
  etapaAtual: Etapa;
  loading: boolean;
  error: string | null;
  sucesso: boolean;
  
  // Dados selecionados
  servicos: ServicoPublico[];
  servicoSelecionado: ServicoPublico | null;
  profissionalSelecionado: any;
  dataSelecionada: string;
  horarioSelecionado: string;
  horariosDisponiveis: AgendaPublica[];
  
  // Dados do cliente
  dadosCliente: {
    nomeCliente: string;
    telefoneCliente: string;
  };
  
  // Validações
  errosValidacao: ErroValidacao[];
}

export function useAgendamentoPublico(empresaId: number) {
  const [estado, setEstado] = useState<EstadoAgendamento>({
    etapaAtual: 'servico',
    loading: false,
    error: null,
    sucesso: false,
    servicos: [],
    servicoSelecionado: null,
    profissionalSelecionado: null,
    dataSelecionada: '',
    horarioSelecionado: '',
    horariosDisponiveis: [],
    dadosCliente: {
      nomeCliente: '',
      telefoneCliente: '+55 '
    },
    errosValidacao: []
  });

  // Carregar serviços
  const carregarServicos = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));
      const servicosData = await agendamentosPublicosApi.getServicos(empresaId);
      setEstado(prev => ({ 
        ...prev, 
        servicos: servicosData.filter(s => s.ativo),
        loading: false 
      }));
    } catch (error: any) {
      setEstado(prev => ({ 
        ...prev, 
        error: 'Erro ao carregar serviços. Tente novamente.',
        loading: false 
      }));
      console.error('Erro ao carregar serviços:', error);
    }
  }, [empresaId]);

  // Carregar horários disponíveis
  const carregarHorariosDisponiveis = useCallback(async () => {
    const { servicoSelecionado, profissionalSelecionado, dataSelecionada } = estado;
    
    if (!servicoSelecionado || !profissionalSelecionado || !dataSelecionada) return;

    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));
      const horarios = await agendamentosPublicosApi.getAgenda(
        empresaId,
        servicoSelecionado.id,
        profissionalSelecionado.id,
        dataSelecionada
      );
      setEstado(prev => ({ 
        ...prev, 
        horariosDisponiveis: horarios,
        loading: false 
      }));
    } catch (error: any) {
      setEstado(prev => ({ 
        ...prev, 
        error: 'Erro ao carregar horários disponíveis.',
        loading: false 
      }));
      console.error('Erro ao carregar horários:', error);
    }
  }, [empresaId, estado.servicoSelecionado, estado.profissionalSelecionado, estado.dataSelecionada]);

  // Ações de navegação
  const selecionarServico = useCallback((servico: ServicoPublico) => {
    setEstado(prev => ({
      ...prev,
      servicoSelecionado: servico,
      profissionalSelecionado: null,
      dataSelecionada: '',
      horarioSelecionado: '',
      horariosDisponiveis: [],
      etapaAtual: 'profissional',
      error: null
    }));
  }, []);

  const selecionarProfissional = useCallback((profissional: any) => {
    setEstado(prev => ({
      ...prev,
      profissionalSelecionado: profissional,
      dataSelecionada: '',
      horarioSelecionado: '',
      horariosDisponiveis: [],
      etapaAtual: 'data',
      error: null
    }));
  }, []);

  const selecionarData = useCallback((data: string) => {
    setEstado(prev => ({
      ...prev,
      dataSelecionada: data,
      horarioSelecionado: '',
      horariosDisponiveis: [],
      etapaAtual: 'horario',
      error: null
    }));
  }, []);

  const selecionarHorario = useCallback((horario: string) => {
    setEstado(prev => ({
      ...prev,
      horarioSelecionado: horario,
      etapaAtual: 'dados',
      error: null
    }));
  }, []);

  const atualizarDadosCliente = useCallback((dados: Partial<EstadoAgendamento['dadosCliente']>) => {
    setEstado(prev => ({
      ...prev,
      dadosCliente: { ...prev.dadosCliente, ...dados },
      error: null
    }));
  }, []);

  const voltarEtapa = useCallback(() => {
    setEstado(prev => {
      const etapas: Etapa[] = ['servico', 'profissional', 'data', 'horario', 'dados'];
      const indiceAtual = etapas.indexOf(prev.etapaAtual);
      const proximaEtapa = indiceAtual > 0 ? etapas[indiceAtual - 1] : 'servico';
      
      return {
        ...prev,
        etapaAtual: proximaEtapa,
        error: null
      };
    });
  }, []);

  // Validar dados antes de finalizar
  const validarDados = useCallback((): boolean => {
    const dadosParaValidar: Partial<DadosAgendamentoPublico> = {
      nomeCliente: estado.dadosCliente.nomeCliente,
      telefoneCliente: estado.dadosCliente.telefoneCliente,
      servicoId: estado.servicoSelecionado?.id,
      profissionalId: estado.profissionalSelecionado?.id,
      data: estado.dataSelecionada,
      horario: estado.horarioSelecionado
    };

    const erros = validarAgendamentoPublico(dadosParaValidar);
    
    setEstado(prev => ({ ...prev, errosValidacao: erros }));

    if (erros.length > 0) {
      setEstado(prev => ({ 
        ...prev, 
        error: formatarErrosValidacao(erros) 
      }));
      return false;
    }

    return true;
  }, [estado]);

  // Finalizar agendamento
  const finalizarAgendamento = useCallback(async () => {
    if (!validarDados()) return;

    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));

      const agendamentoData = {
        nomeCliente: estado.dadosCliente.nomeCliente,
        telefoneCliente: estado.dadosCliente.telefoneCliente,
        dataHora: `${estado.dataSelecionada}T${estado.horarioSelecionado}:00Z`,
        status: 'AGENDADO' as const,
        empresa: { id: empresaId },
        servico: { id: estado.servicoSelecionado!.id },
        profissional: { id: estado.profissionalSelecionado.id }
      };

      await agendamentosPublicosApi.createAgendamento(empresaId, agendamentoData);
      
      setEstado(prev => ({
        ...prev,
        etapaAtual: 'confirmacao',
        sucesso: true,
        loading: false
      }));
    } catch (error: any) {
      setEstado(prev => ({
        ...prev,
        error: 'Erro ao criar agendamento. Tente novamente.',
        loading: false
      }));
      console.error('Erro ao criar agendamento:', error);
    }
  }, [empresaId, estado, validarDados]);

  // Reiniciar processo
  const reiniciarAgendamento = useCallback(() => {
    setEstado({
      etapaAtual: 'servico',
      loading: false,
      error: null,
      sucesso: false,
      servicos: estado.servicos, // Manter os serviços carregados
      servicoSelecionado: null,
      profissionalSelecionado: null,
      dataSelecionada: '',
      horarioSelecionado: '',
      horariosDisponiveis: [],
      dadosCliente: {
        nomeCliente: '',
        telefoneCliente: '+55 '
      },
      errosValidacao: []
    });
  }, [estado.servicos]);

  return {
    // Estado
    ...estado,
    
    // Ações
    carregarServicos,
    carregarHorariosDisponiveis,
    selecionarServico,
    selecionarProfissional,
    selecionarData,
    selecionarHorario,
    atualizarDadosCliente,
    voltarEtapa,
    finalizarAgendamento,
    reiniciarAgendamento,
    
    // Utilitários
    podeAvancar: {
      servico: !!estado.servicoSelecionado,
      profissional: !!estado.profissionalSelecionado,
      data: !!estado.dataSelecionada,
      horario: !!estado.horarioSelecionado,
      dados: estado.dadosCliente.nomeCliente.length >= 3 && 
             estado.dadosCliente.telefoneCliente.length >= 17
    }
  };
}