import { apiClient } from './client';
import { ChamadoSuporte, FormularioSuporte, FiltrosChamados } from '@/types/suporte';

export const suporteApi = {
  // Criar novo chamado de suporte
  async criarChamado(dados: FormularioSuporte, empresaId?: number): Promise<ChamadoSuporte> {
    const formData = new FormData();
    
    // Adicionar campos básicos
    formData.append('titulo', dados.titulo);
    formData.append('descricao', dados.descricao);
    formData.append('categoria', dados.categoria);
    formData.append('subcategoria', dados.subcategoria);
    formData.append('prioridade', dados.prioridade);
    formData.append('emailUsuario', dados.emailUsuario);
    
    if (dados.paginaErro) {
      formData.append('paginaErro', dados.paginaErro);
    }

    if (empresaId) {
      formData.append('empresaId', empresaId.toString());
    }

    const response = await apiClient.post('/api/suporte/chamados', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Listar chamados do usuário
  async listarChamados(filtros?: FiltrosChamados): Promise<ChamadoSuporte[]> {
    const params = new URLSearchParams();
    
    if (filtros?.status) {
      filtros.status.forEach(status => params.append('status', status));
    }
    if (filtros?.prioridade) {
      filtros.prioridade.forEach(prioridade => params.append('prioridade', prioridade));
    }
    if (filtros?.categoria) {
      params.append('categoria', filtros.categoria);
    }
    if (filtros?.dataInicio) {
      params.append('dataInicio', filtros.dataInicio.toISOString());
    }
    if (filtros?.dataFim) {
      params.append('dataFim', filtros.dataFim.toISOString());
    }
    if (filtros?.emailUsuario) {
      params.append('emailUsuario', filtros.emailUsuario);
    }

    const response = await apiClient.get(`/api/suporte/chamados?${params.toString()}`);
    return response.data;
  },

  // Buscar chamado por ID
  async buscarChamado(id: number): Promise<ChamadoSuporte> {
    const response = await apiClient.get(`/api/suporte/chamados/${id}`);
    return response.data;
  },

  // Atualizar chamado (apenas usuário pode atualizar descrição)
  async atualizarChamado(id: number, dados: Partial<FormularioSuporte>): Promise<ChamadoSuporte> {
    const response = await apiClient.put(`/api/suporte/chamados/${id}`, dados);
    return response.data;
  },

  // Adicionar comentário ao chamado
  async adicionarComentario(id: number, comentario: string): Promise<void> {
    await apiClient.post(`/api/suporte/chamados/${id}/comentarios`, { comentario });
  },

  // Fechar chamado (usuário)
  async fecharChamado(id: number): Promise<void> {
    await apiClient.patch(`/api/suporte/chamados/${id}/fechar`);
  },

  // Reabrir chamado (usuário)
  async reabrirChamado(id: number): Promise<void> {
    await apiClient.patch(`/api/suporte/chamados/${id}/reabrir`);
  },

  // Avaliar atendimento
  async avaliarAtendimento(id: number, avaliacao: {
    nota: number;
    comentario?: string;
  }): Promise<void> {
    await apiClient.post(`/api/suporte/chamados/${id}/avaliacao`, avaliacao);
  },

  // Upload de anexo adicional
  async uploadAnexo(id: number, arquivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const response = await apiClient.post(`/api/suporte/chamados/${id}/anexos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },

  // Download de anexo
  async downloadAnexo(id: number, nomeArquivo: string): Promise<Blob> {
    const response = await apiClient.get(`/api/suporte/chamados/${id}/anexos/${nomeArquivo}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Estatísticas do usuário
  async obterEstatisticas(): Promise<{
    totalChamados: number;
    chamadosAbertos: number;
    chamadosResolvidos: number;
    tempoMedioResolucao: number;
    avaliacaoMedia: number;
  }> {
    const response = await apiClient.get('/api/suporte/estatisticas');
    return response.data;
  }
};
