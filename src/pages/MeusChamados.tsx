import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Star,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSuporte } from '@/hooks/useSuporte';
import { ChamadoSuporte, StatusChamado, PrioridadeSuporte } from '@/types/suporte';
import { FormularioSuporteComponent } from '@/components/forms/FormularioSuporte';

export function MeusChamados() {
  const { chamados, loading, carregarChamados } = useSuporte();
  const [showFormulario, setShowFormulario] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ChamadoSuporte | null>(null);
  const [filtros, setFiltros] = useState({
    status: '',
    prioridade: '',
    categoria: '',
    busca: ''
  });
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    carregarChamados();
  }, []);

  const getStatusColor = (status: StatusChamado) => {
    switch (status) {
      case 'aberto': return 'bg-red-100 text-red-700';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-700';
      case 'aguardando_usuario': return 'bg-blue-100 text-blue-700';
      case 'resolvido': return 'bg-green-100 text-green-700';
      case 'fechado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPrioridadeColor = (prioridade: PrioridadeSuporte) => {
    switch (prioridade) {
      case 'BAIXA': return 'text-green-600 bg-green-100';
      case 'MEDIA': return 'text-yellow-600 bg-yellow-100';
      case 'ALTA': return 'text-orange-600 bg-orange-100';
      case 'CRITICA': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: StatusChamado) => {
    switch (status) {
      case 'aberto': return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento': return <Clock className="w-4 h-4" />;
      case 'aguardando_usuario': return <MessageCircle className="w-4 h-4" />;
      case 'resolvido': return <CheckCircle className="w-4 h-4" />;
      case 'fechado': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPrioridadeLabel = (prioridade: PrioridadeSuporte) => {
    switch (prioridade) {
      case 'BAIXA': return 'Baixa';
      case 'MEDIA': return 'Média';
      case 'ALTA': return 'Alta';
      case 'CRITICA': return 'Crítica';
      default: return prioridade;
    }
  };

  const formatarData = (data: Date | string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chamadosFiltrados = (Array.isArray(chamados) ? chamados : []).filter(chamado => {
    const matchStatus = !filtros.status || chamado.status === filtros.status;
    const matchPrioridade = !filtros.prioridade || chamado.prioridade === filtros.prioridade;
    const matchCategoria = !filtros.categoria || chamado.categoria === filtros.categoria;
    const matchBusca = !filtros.busca || 
      chamado.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      chamado.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
    
    return matchStatus && matchPrioridade && matchCategoria && matchBusca;
  });

  if (showFormulario) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setShowFormulario(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Voltar para Meus Chamados
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Novo Chamado de Suporte</h1>
          </div>
          <FormularioSuporteComponent
            onSuccess={() => {
              setShowFormulario(false);
              carregarChamados();
            }}
            onCancel={() => setShowFormulario(false)}
          />
        </div>
      </div>
    );
  }

  if (chamadoSelecionado) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setChamadoSelecionado(null)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Voltar para Lista
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Chamado</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {chamadoSelecionado.titulo}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(chamadoSelecionado.status)}`}>
                    {getStatusIcon(chamadoSelecionado.status)}
                    <span>{chamadoSelecionado.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(chamadoSelecionado.prioridade)}`}>
                    {getPrioridadeLabel(chamadoSelecionado.prioridade)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Criado em: {formatarData(chamadoSelecionado.dataCriacao!)}</p>
                {chamadoSelecionado.dataAtualizacao && (
                  <p>Atualizado em: {formatarData(chamadoSelecionado.dataAtualizacao!)}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Categoria</h3>
                <p className="text-gray-600">{chamadoSelecionado.categoria}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subcategoria</h3>
                <p className="text-gray-600">{chamadoSelecionado.subcategoria}</p>
              </div>
              {chamadoSelecionado.paginaErro && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Página do Erro</h3>
                  <p className="text-gray-600">{chamadoSelecionado.paginaErro}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{chamadoSelecionado.descricao}</p>
              </div>
            </div>

            {chamadoSelecionado.respostaSuporte && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Resposta do Suporte</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{chamadoSelecionado.respostaSuporte}</p>
                  {chamadoSelecionado.usuarioSuporte && (
                    <p className="text-sm text-gray-500 mt-2">
                      Respondido por: {chamadoSelecionado.usuarioSuporte}
                    </p>
                  )}
                  {chamadoSelecionado.dataResposta && (
                    <p className="text-sm text-gray-500">
                      Em: {formatarData(chamadoSelecionado.dataResposta)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {chamadoSelecionado.anexos && chamadoSelecionado.anexos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Anexos</h3>
                <div className="space-y-2">
                  {chamadoSelecionado.anexos.map((anexo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{anexo}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chamadoSelecionado.avaliacaoNota && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Avaliação</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < chamadoSelecionado.avaliacaoNota!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {chamadoSelecionado.avaliacaoNota}/5
                  </span>
                </div>
                {chamadoSelecionado.avaliacaoComentario && (
                  <p className="text-sm text-gray-600 mt-2">
                    {chamadoSelecionado.avaliacaoComentario}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Meus Chamados de Suporte</h1>
            <button
              onClick={() => setShowFormulario(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Chamado</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar chamados..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {showFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filtros.status}
                      onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Todos os status</option>
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="aguardando_usuario">Aguardando Usuário</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="fechado">Fechado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={filtros.prioridade}
                      onChange={(e) => setFiltros(prev => ({ ...prev, prioridade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Todas as prioridades</option>
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                      <option value="CRITICA">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Todas as categorias</option>
                      <option value="erro">Erro/Bug</option>
                      <option value="duvida">Dúvida/Funcionalidade</option>
                      <option value="sugestao">Sugestão/Melhoria</option>
                      <option value="faturamento">Faturamento/Cobrança</option>
                      <option value="seguranca">Segurança/Privacidade</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chamadosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
            <p className="text-gray-600 mb-4">
              {filtros.busca || filtros.status || filtros.prioridade || filtros.categoria
                ? 'Tente ajustar os filtros para encontrar seus chamados.'
                : 'Você ainda não criou nenhum chamado de suporte.'}
            </p>
            <button
              onClick={() => setShowFormulario(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Criar Primeiro Chamado
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {chamadosFiltrados.map((chamado) => (
              <motion.div
                key={chamado.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setChamadoSelecionado(chamado)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {chamado.titulo}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {chamado.descricao}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatarData(chamado.dataCriacao!)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>{chamado.categoria}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(chamado.status)}`}>
                      {getStatusIcon(chamado.status)}
                      <span>{chamado.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(chamado.prioridade)}`}>
                      {getPrioridadeLabel(chamado.prioridade)}
                    </span>
                    <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-800">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Ver detalhes</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}