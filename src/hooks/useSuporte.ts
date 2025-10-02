import { useState, useEffect } from 'react';
import { suporteApi } from '@/api/suporte';
import { ChamadoSuporte, FormularioSuporte, FiltrosChamados } from '@/types/suporte';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

export function useSuporte() {
  const [chamados, setChamados] = useState<ChamadoSuporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  const carregarChamados = async (filtros?: FiltrosChamados) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await suporteApi.listarChamados(filtros);
      // A API retorna um objeto Page, precisamos extrair o conteúdo
      const dados = Array.isArray(response) ? response : response.content || [];
      setChamados(dados);
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao carregar chamados';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
    } finally {
      setLoading(false);
    }
  };

  const criarChamado = async (dados: FormularioSuporte): Promise<ChamadoSuporte | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const novoChamado = await suporteApi.criarChamado(dados, user?.empresaId);
      setChamados(prev => [novoChamado, ...prev]);
      addToast('success', 'Sucesso', 'Chamado criado com sucesso!');
      return novoChamado;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao criar chamado';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const atualizarChamado = async (id: number, dados: Partial<FormularioSuporte>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const chamadoAtualizado = await suporteApi.atualizarChamado(id, dados);
      setChamados(prev => 
        prev.map(chamado => 
          chamado.id === id ? chamadoAtualizado : chamado
        )
      );
      addToast('success', 'Sucesso', 'Chamado atualizado com sucesso!');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao atualizar chamado';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fecharChamado = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await suporteApi.fecharChamado(id);
      setChamados(prev => 
        prev.map(chamado => 
          chamado.id === id ? { ...chamado, status: 'fechado' } : chamado
        )
      );
      addToast('success', 'Sucesso', 'Chamado fechado com sucesso!');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao fechar chamado';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reabrirChamado = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await suporteApi.reabrirChamado(id);
      setChamados(prev => 
        prev.map(chamado => 
          chamado.id === id ? { ...chamado, status: 'aberto' } : chamado
        )
      );
      addToast('success', 'Sucesso', 'Chamado reaberto com sucesso!');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao reabrir chamado';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adicionarComentario = async (id: number, comentario: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await suporteApi.adicionarComentario(id, comentario);
      addToast('success', 'Sucesso', 'Comentário adicionado com sucesso!');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao adicionar comentário';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const avaliarAtendimento = async (id: number, avaliacao: { nota: number; comentario?: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await suporteApi.avaliarAtendimento(id, avaliacao);
      addToast('success', 'Sucesso', 'Avaliação enviada com sucesso!');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao enviar avaliação';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAnexo = async (id: number, arquivo: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = await suporteApi.uploadAnexo(id, arquivo);
      addToast('Anexo enviado com sucesso!', 'success');
      return url;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao enviar anexo';
      setError(mensagem);
      addToast('error', 'Erro', mensagem);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadAnexo = async (id: number, nomeArquivo: string): Promise<void> => {
    try {
      const blob = await suporteApi.downloadAnexo(id, nomeArquivo);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao baixar anexo';
      addToast('error', 'Erro', mensagem);
    }
  };

  // Carregar chamados automaticamente ao montar o hook
  useEffect(() => {
    carregarChamados();
  }, []);

  return {
    chamados,
    loading,
    error,
    carregarChamados,
    criarChamado,
    atualizarChamado,
    fecharChamado,
    reabrirChamado,
    adicionarComentario,
    avaliarAtendimento,
    uploadAnexo,
    downloadAnexo,
  };
}
