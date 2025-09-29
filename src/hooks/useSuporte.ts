import { useState, useEffect } from 'react';
import { suporteApi } from '@/api/suporte';
import { ChamadoSuporte, FormularioSuporte, FiltrosChamados } from '@/types/suporte';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

export function useSuporte() {
  const [chamados, setChamados] = useState<ChamadoSuporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const carregarChamados = async (filtros?: FiltrosChamados) => {
    setLoading(true);
    setError(null);
    
    try {
      const dados = await suporteApi.listarChamados(filtros);
      setChamados(dados);
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao carregar chamados';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Chamado criado com sucesso!', 'success');
      return novoChamado;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao criar chamado';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Chamado atualizado com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao atualizar chamado';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Chamado fechado com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao fechar chamado';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Chamado reaberto com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao reabrir chamado';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Comentário adicionado com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao adicionar comentário';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Avaliação enviada com sucesso!', 'success');
      return true;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao enviar avaliação';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast('Anexo enviado com sucesso!', 'success');
      return url;
    } catch (err: any) {
      const mensagem = err.response?.data?.message || 'Erro ao enviar anexo';
      setError(mensagem);
      showToast(mensagem, 'error');
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
      showToast(mensagem, 'error');
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
