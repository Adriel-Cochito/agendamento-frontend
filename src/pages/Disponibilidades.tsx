import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Timer,
  Ban,
  Clock,
  CalendarDays,
  User,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DisponibilidadeForm } from '@/components/forms/DisponibilidadeForm';
import { Loading } from '@/components/ui/Loading';
import {
  useDisponibilidades,
  useCreateDisponibilidade,
  useUpdateDisponibilidade,
  useDeleteDisponibilidade,
} from '@/hooks/useDisponibilidades';
import { useProfissionais } from '@/hooks/useProfissionais';
import { Disponibilidade, TipoDisponibilidade } from '@/types/disponibilidade';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { useAuthStore } from '@/store/authStore';

export function Disponibilidades() {
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoDisponibilidade | 'ALL'>('ALL');
  const [selectedProfissional, setSelectedProfissional] = useState<number | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDisponibilidade, setSelectedDisponibilidade] = useState<Disponibilidade | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [disponibilidadeToDelete, setDisponibilidadeToDelete] = useState<Disponibilidade | null>(null);

  const empresaId = user?.empresaId || 1;

  const { data: disponibilidades, isLoading } = useDisponibilidades({ empresaId });
  const { data: profissionais } = useProfissionais(empresaId);
  const createMutation = useCreateDisponibilidade();
  const updateMutation = useUpdateDisponibilidade();
  const deleteMutation = useDeleteDisponibilidade();

  const filteredDisponibilidades = disponibilidades?.filter((disp) => {
    const matchesSearch = 
      disp.profissional.nome.toLowerCase().includes(search.toLowerCase()) ||
      disp.observacao.toLowerCase().includes(search.toLowerCase());
    
    const matchesTipo = selectedTipo === 'ALL' || disp.tipo === selectedTipo;
    const matchesProfissional = selectedProfissional === 'ALL' || disp.profissional.id === selectedProfissional;

    return matchesSearch && matchesTipo && matchesProfissional;
  });

  const handleCreate = () => {
    setSelectedDisponibilidade(null);
    setIsModalOpen(true);
  };

  const handleEdit = (disponibilidade: Disponibilidade) => {
    setSelectedDisponibilidade(disponibilidade);
    setIsModalOpen(true);
  };

  const handleDelete = (disponibilidade: Disponibilidade) => {
    setDisponibilidadeToDelete(disponibilidade);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (disponibilidadeToDelete) {
      try {
        await deleteMutation.mutateAsync(disponibilidadeToDelete.id);
        addToast('success', 'Disponibilidade excluída com sucesso');
        setIsDeleteModalOpen(false);
        setDisponibilidadeToDelete(null);
      } catch (error: any) {
        console.error('Erro ao deletar:', error);
        addToast('error', 'Erro ao excluir', getErrorMessage(error));
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedDisponibilidade) {
        // Para edição, preservar a estrutura original mas ajustar se necessário
        const updateData = { ...data };
        if (updateData.profissional && typeof updateData.profissional === 'object') {
          // Já está no formato correto
        } else if (data.profissionalId) {
          updateData.profissional = { id: data.profissionalId };
          delete updateData.profissionalId;
        }
        
        await updateMutation.mutateAsync({
          id: selectedDisponibilidade.id,
          data: updateData,
        });
        addToast('success', 'Disponibilidade atualizada com sucesso');
      } else {
        await createMutation.mutateAsync(data);
        addToast('success', 'Disponibilidade criada com sucesso');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('error', 'Erro ao salvar', getErrorMessage(error));
    }
  };

  const getTipoIcon = (tipo: TipoDisponibilidade) => {
    switch (tipo) {
      case 'GRADE':
        return Calendar;
      case 'LIBERADO':
        return Timer;
      case 'BLOQUEIO':
        return Ban;
    }
  };

  const getTipoBadge = (tipo: TipoDisponibilidade) => {
    switch (tipo) {
      case 'GRADE':
        return { color: 'bg-blue-100 text-blue-800', label: 'Grade Horária' };
      case 'LIBERADO':
        return { color: 'bg-green-100 text-green-800', label: 'Liberado' };
      case 'BLOQUEIO':
        return { color: 'bg-red-100 text-red-800', label: 'Bloqueio' };
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.slice(0, 5); // Remove os segundos
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateTime));
  };

  const formatDiasSemana = (dias: number[]) => {
    const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias.sort().map(dia => nomes[dia]).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilidades</h1>
          <p className="text-gray-600 mt-1">
            Gerencie a disponibilidade de horários dos profissionais
          </p>
        </div>
        <Button onClick={handleCreate} className="sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Disponibilidade
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por profissional ou observação..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro por Tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value as TipoDisponibilidade | 'ALL')}
            >
              <option value="ALL">Todos os tipos</option>
              <option value="GRADE">Grade Horária</option>
              <option value="LIBERADO">Liberado</option>
              <option value="BLOQUEIO">Bloqueio</option>
            </select>
          </div>

          {/* Filtro por Profissional */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              value={selectedProfissional}
              onChange={(e) => setSelectedProfissional(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            >
              <option value="ALL">Todos os profissionais</option>
              {profissionais?.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Disponibilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDisponibilidades?.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {search || selectedTipo !== 'ALL' || selectedProfissional !== 'ALL'
                ? 'Nenhuma disponibilidade encontrada com os filtros aplicados'
                : 'Nenhuma disponibilidade cadastrada'
              }
            </p>
            <Button onClick={handleCreate} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira disponibilidade
            </Button>
          </div>
        ) : (
          filteredDisponibilidades?.map((disponibilidade) => {
            const TipoIcon = getTipoIcon(disponibilidade.tipo);
            const tipoBadge = getTipoBadge(disponibilidade.tipo);

            return (
              <motion.div
                key={disponibilidade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        disponibilidade.tipo === 'GRADE' ? 'bg-blue-100' :
                        disponibilidade.tipo === 'LIBERADO' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <TipoIcon className={`w-5 h-5 ${
                          disponibilidade.tipo === 'GRADE' ? 'text-blue-600' :
                          disponibilidade.tipo === 'LIBERADO' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoBadge.color}`}>
                          {tipoBadge.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(disponibilidade)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(disponibilidade)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Profissional */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {disponibilidade.profissional.nome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {disponibilidade.profissional.email}
                    </p>
                  </div>

                  {/* Detalhes específicos por tipo */}
                  <div className="space-y-3 mb-4">
                    {disponibilidade.tipo === 'GRADE' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDiasSemana(disponibilidade.diasSemana)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatTime(disponibilidade.horaInicio)} às {formatTime(disponibilidade.horaFim)}
                          </span>
                        </div>
                      </>
                    )}

                    {(disponibilidade.tipo === 'LIBERADO' || disponibilidade.tipo === 'BLOQUEIO') && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Início: {formatDateTime(disponibilidade.dataHoraInicio)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Fim: {formatDateTime(disponibilidade.dataHoraFim)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observação */}
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 italic">
                      "{disponibilidade.observacao}"
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex space-x-2">
                      {disponibilidade.pontoValido && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Ponto Válido
                        </span>
                      )}
                      {disponibilidade.gradeValida && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Grade Válida
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      ID: {disponibilidade.id}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDisponibilidade ? 'Editar Disponibilidade' : 'Nova Disponibilidade'}
        size="lg"
      >
        <DisponibilidadeForm
          disponibilidade={selectedDisponibilidade || undefined}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          empresaId={empresaId}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">
                Tem certeza que deseja excluir esta disponibilidade?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Profissional:</strong> {disponibilidadeToDelete?.profissional.nome}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipo:</strong> {getTipoBadge(disponibilidadeToDelete?.tipo || 'GRADE').label}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita e pode afetar agendamentos futuros.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Excluir Disponibilidade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}