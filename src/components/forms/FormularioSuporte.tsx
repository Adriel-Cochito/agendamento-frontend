import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, Upload, X, Info } from 'lucide-react';
import { FormularioSuporte, CATEGORIAS_SUPORTE, PAGINAS_ERRO, PrioridadeSuporte } from '@/types/suporte';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useSuporte } from '@/hooks/useSuporte';

interface FormularioSuporteProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<FormularioSuporte>;
}

export function FormularioSuporteComponent({ onSuccess, onCancel, initialData }: FormularioSuporteProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { criarChamado } = useSuporte();
  
  const [formData, setFormData] = useState<FormularioSuporte>({
    titulo: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    prioridade: 'media',
    nomeUsuario: user?.nome || '',
    emailUsuario: user?.email || '',
    paginaErro: '',
    anexos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subcategoriasDisponiveis, setSubcategoriasDisponiveis] = useState<any[]>([]);

  // Atualizar subcategorias quando categoria mudar
  useEffect(() => {
    if (formData.categoria) {
      const categoria = CATEGORIAS_SUPORTE.find(c => c.id === formData.categoria);
      setSubcategoriasDisponiveis(categoria?.subcategorias || []);
      
      // Limpar subcategoria se mudou de categoria
      if (formData.subcategoria && !categoria?.subcategorias.find(s => s.id === formData.subcategoria)) {
        setFormData(prev => ({ ...prev, subcategoria: '' }));
      }
    } else {
      setSubcategoriasDisponiveis([]);
      setFormData(prev => ({ ...prev, subcategoria: '' }));
    }
  }, [formData.categoria]);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.subcategoria) {
      newErrors.subcategoria = 'Subcategoria é obrigatória';
    }

    if (!formData.emailUsuario.trim()) {
      newErrors.emailUsuario = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailUsuario)) {
      newErrors.emailUsuario = 'Email inválido';
    }

    if (!formData.nomeUsuario.trim()) {
      newErrors.nomeUsuario = 'Nome é obrigatório';
    }

    // Validação específica para erros
    if (formData.categoria === 'erro' && !formData.paginaErro) {
      newErrors.paginaErro = 'Página do erro é obrigatória para reportar bugs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormularioSuporte, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showToast('Arquivo muito grande: ' + file.name, 'error');
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        showToast('Tipo de arquivo não permitido: ' + file.name, 'error');
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      anexos: [...(prev.anexos || []), ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const resultado = await criarChamado(formData);
      
      if (resultado) {
        // Limpar formulário
        setFormData({
          titulo: '',
          descricao: '',
          categoria: '',
          subcategoria: '',
          prioridade: 'media',
          nomeUsuario: user?.nome || '',
          emailUsuario: user?.email || '',
          paginaErro: '',
          anexos: []
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erro ao enviar chamado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrioridadeColor = (prioridade: PrioridadeSuporte) => {
    switch (prioridade) {
      case 'baixa': return 'text-green-600 bg-green-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'alta': return 'text-orange-600 bg-orange-100';
      case 'critica': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeLabel = (prioridade: PrioridadeSuporte) => {
    switch (prioridade) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      case 'critica': return 'Crítica';
      default: return prioridade;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Formulário de Suporte
          </h2>
          <p className="text-gray-600">
            Descreva seu problema, dúvida ou sugestão. Nossa equipe responderá o mais rápido possível.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Usuário */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nomeUsuario}
                onChange={(e) => handleInputChange('nomeUsuario', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.nomeUsuario ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.nomeUsuario && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nomeUsuario}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.emailUsuario}
                onChange={(e) => handleInputChange('emailUsuario', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.emailUsuario ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
              />
              {errors.emailUsuario && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.emailUsuario}
                </p>
              )}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Chamado *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Resumo breve do problema ou dúvida"
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Categoria e Subcategoria */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.categoria ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_SUPORTE.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.categoria}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoria *
              </label>
              <select
                value={formData.subcategoria}
                onChange={(e) => handleInputChange('subcategoria', e.target.value)}
                disabled={!formData.categoria}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.subcategoria ? 'border-red-300' : 'border-gray-300'
                } ${!formData.categoria ? 'bg-gray-100' : ''}`}
              >
                <option value="">Selecione uma subcategoria</option>
                {subcategoriasDisponiveis.map((subcategoria) => (
                  <option key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nome}
                  </option>
                ))}
              </select>
              {errors.subcategoria && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subcategoria}
                </p>
              )}
              {formData.subcategoria && subcategoriasDisponiveis.find(s => s.id === formData.subcategoria)?.descricao && (
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  {subcategoriasDisponiveis.find(s => s.id === formData.subcategoria)?.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['baixa', 'media', 'alta', 'critica'] as PrioridadeSuporte[]).map((prioridade) => (
                <label
                  key={prioridade}
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.prioridade === prioridade
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="prioridade"
                    value={prioridade}
                    checked={formData.prioridade === prioridade}
                    onChange={(e) => handleInputChange('prioridade', e.target.value as PrioridadeSuporte)}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPrioridadeColor(prioridade)}`}>
                    {getPrioridadeLabel(prioridade)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Página do Erro (apenas para categoria erro) */}
          {formData.categoria === 'erro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Página onde ocorreu o erro *
              </label>
              <select
                value={formData.paginaErro || ''}
                onChange={(e) => handleInputChange('paginaErro', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.paginaErro ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione a página</option>
                {PAGINAS_ERRO.map((pagina) => (
                  <option key={pagina} value={pagina}>
                    {pagina}
                  </option>
                ))}
              </select>
              {errors.paginaErro && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paginaErro}
                </p>
              )}
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição Detalhada *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.descricao ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva detalhadamente o problema, dúvida ou sugestão. Inclua passos para reproduzir o problema, se aplicável."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.descricao}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Mínimo 10 caracteres. Atualmente: {formData.descricao.length}
            </p>
          </div>

          {/* Anexos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexos (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                accept="image/*,.pdf,.txt"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para adicionar arquivos ou arraste aqui
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, PDF, TXT (máx. 5MB cada)
                </span>
              </label>
            </div>

            {/* Lista de arquivos */}
            {formData.anexos && formData.anexos.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.anexos.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Chamado</span>
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
