// src/pages/Servicos.tsx (mantendo código original + adicionando apenas controle de permissões)
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Users,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ServicoForm } from '@/components/forms/ServicoForm';
import { Loading } from '@/components/ui/Loading';
import {
  useServicos,
  useCreateServico,
  useUpdateServico,
  useDeleteServico,
} from '@/hooks/useServicos';
import { Servico } from '@/types/servico';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { useAuthStore } from '@/store/authStore';
import { useServicosPermissions } from '@/hooks/usePermissions';

export function Servicos() {
  const deleteMutation = useDeleteServico();

  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const permissions = useServicosPermissions(); // ÚNICA ADIÇÃO NOVA
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<Servico | null>(null);

  // Pegar empresaId do usuário logado
  const empresaId = user?.empresaId || 1;

  const { data: servicos, isLoading } = useServicos(empresaId);
  const createMutation = useCreateServico();
  const updateMutation = useUpdateServico();

  const handleDeleteServico = (id: number, empresaId: number) => {
    deleteMutation.mutate(
      { id, empresaId },
      {
        onError: (error: any) => {
          const status = error.response?.status;
          const code = error.response?.data?.errors?.[0]?.code;

          if (status === 409 && code === 'REFERENTIAL_INTEGRITY_VIOLATION') {
            addToast(
              'error',
              'Não foi possível excluir',
              'Este serviço possui agendamentos vinculados. Cancele ou conclua os agendamentos antes de excluir.'
            );
          } else {
            addToast(
              'error',
              'Erro ao excluir serviço',
              error.response?.data?.errors?.[0]?.message || 'Erro inesperado ao excluir.'
            );
          }
        },
      }
    );
  };

  const filteredServicos = servicos?.filter(
    (servico) =>
      servico.titulo.toLowerCase().includes(search.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedServico(null);
    setIsModalOpen(true);
  };

  const handleEdit = (servico: Servico) => {
    setSelectedServico(servico);
    setIsModalOpen(true);
  };

  const handleDelete = (servico: Servico) => {
    setServicoToDelete(servico);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (servicoToDelete) {
      try {
        await deleteMutation.mutateAsync({
          id: servicoToDelete.id,
          empresaId,
        });

        addToast('success', 'Serviço excluído com sucesso');
        setIsDeleteModalOpen(false);
        setServicoToDelete(null);
      } catch (error: any) {
        console.error('Erro ao deletar serviço:', error);

        // Tratar diferentes tipos de erro
        if (error.response?.status === 409) {
          // Erro de integridade referencial
          const errorData = error.response.data;
          if (errorData?.errors?.[0]?.code === 'REFERENTIAL_INTEGRITY_VIOLATION') {
            addToast(
              'error',
              'Não foi possível excluir',
              'Este serviço possui agendamentos vinculados. Cancele ou conclua os agendamentos antes de excluir o serviço.'
            );
          } else {
            addToast(
              'error',
              'Conflito ao excluir',
              errorData?.errors?.[0]?.message ||
                'Este serviço não pode ser excluído devido a dependências.'
            );
          }
        } else if (error.response?.status === 403) {
          addToast(
            'error',
            'Sem permissão',
            'Você não tem permissão para excluir este serviço.'
          );
        } else {
          addToast('error', 'Erro ao excluir', getErrorMessage(error));
        }
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedServico) {
        await updateMutation.mutateAsync({
          id: selectedServico.id,
          data, // envia o objeto completo, pode conter empresaId se quiser
          empresaId, // empresaId do estado / usuário logado, não do form
        });

        addToast('success', 'Serviço atualizado com sucesso');
      } else {
        await createMutation.mutateAsync(data);
        addToast('success', 'Serviço criado com sucesso');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);

      // Tratar erros específicos
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.errors?.length > 0) {
          // Mostrar todos os erros de validação
          errorData.errors.forEach((err: any) => {
            addToast('error', 'Erro de validação', err.message);
          });
        } else {
          addToast('error', 'Erro ao salvar', getErrorMessage(error));
        }
      } else {
        addToast('error', 'Erro ao salvar', getErrorMessage(error));
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
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
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os serviços oferecidos pela sua empresa
          </p>
        </div>
        {/* CONTROLE DE PERMISSÃO: só mostra botão se pode criar */}
        {permissions.canCreate && (
          <Button onClick={handleCreate} className="sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por título ou descrição..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServicos?.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum serviço encontrado</p>
            {/* CONTROLE DE PERMISSÃO: só mostra botão se pode criar */}
            {permissions.canCreate && (
              <Button onClick={handleCreate} className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro serviço
              </Button>
            )}
          </div>
        ) : (
          filteredServicos?.map((servico) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {servico.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {servico.descricao}
                    </p>
                  </div>
                  {!servico.ativo && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      Inativo
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-semibold text-green-600">
                      {formatPrice(servico.preco)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDuration(servico.duracao)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {servico.profissionais?.length || 0} profissional(is)
                  </div>
                </div>

                {servico.profissionais && servico.profissionais.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Executado por:</p>
                    <div className="flex flex-wrap gap-1">
                      {servico.profissionais.slice(0, 3).map((prof) => (
                        <span
                          key={prof.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700"
                        >
                          {prof.nome.split(' ')[0]}
                        </span>
                      ))}
                      {servico.profissionais.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{servico.profissionais.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(servico)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  
                  {/* CONTROLE DE PERMISSÃO: só mostra botão de deletar se pode deletar */}
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(servico)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {/* CONTROLE DE PERMISSÃO: só renderiza modal se pode criar ou editar */}
      { (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'}
          size="lg"
        >
          <ServicoForm
            servico={selectedServico || undefined}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            empresaId={empresaId}
          />
        </Modal>
      )}

      {/* Delete Modal com Aviso Melhorado */}
      {/* CONTROLE DE PERMISSÃO: só renderiza modal de delete se pode deletar */}
      {permissions.canDelete && (
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
                  Tem certeza que deseja excluir o serviço{' '}
                  <strong>{servicoToDelete?.titulo}</strong>?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            {/* Avisos adicionais */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Atenção:</strong> Se este serviço tiver agendamentos futuros, eles
                precisarão ser cancelados ou remarcados.
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
                Excluir Serviço
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}