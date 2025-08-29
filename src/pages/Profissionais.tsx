import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Shield, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProfissionalForm } from '@/components/forms/ProfissionalForm';
import { Loading } from '@/components/ui/Loading';
import {
  useProfissionais,
  useCreateProfissional,
  useUpdateProfissional,
  useDeleteProfissional,
} from '@/hooks/useProfissionais';
import { useAuthStore } from '@/store/authStore';
import { Profissional } from '@/types/profissional';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { useServicosPermissions } from '@/hooks/usePermissions';

export function Profissionais() {
  const permissions = useServicosPermissions(); // ÚNICA ADIÇÃO NOVA
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profissionalToDelete, setProfissionalToDelete] = useState<Profissional | null>(
    null
  );

  // Assumindo que o empresaId vem do usuário logado
  const empresaId = user?.empresaId || 1;

  const { data: profissionais, isLoading } = useProfissionais(empresaId);
  const createMutation = useCreateProfissional();
  const updateMutation = useUpdateProfissional();
  const deleteMutation = useDeleteProfissional();

  const filteredProfissionais = profissionais?.filter(
    (prof) =>
      prof.nome.toLowerCase().includes(search.toLowerCase()) ||
      prof.email.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (profissionalToDelete) {
      try {
        await deleteMutation.mutateAsync(profissionalToDelete.id);
        addToast('success', 'Profissional excluído com sucesso');
        setIsDeleteModalOpen(false);
        setProfissionalToDelete(null);
      } catch (error: any) {
        console.error('Erro ao deletar:', error);

        // Tratar erro específico de integridade referencial
        if (
          error.response?.data?.errors?.[0]?.code === 'REFERENTIAL_INTEGRITY_VIOLATION'
        ) {
          addToast(
            'error',
            'Não foi possível excluir',
            'Este profissional está vinculado a serviços ou agendamentos. Remova as associações antes de excluir.'
          );
        } else {
          addToast('error', 'Erro ao excluir', getErrorMessage(error));
        }
      }
    }
  };

  const handleCreate = () => {
    setSelectedProfissional(null);
    setIsModalOpen(true);
  };

  const handleEdit = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setIsModalOpen(true);
  };

  const handleDelete = (profissional: Profissional) => {
    setProfissionalToDelete(profissional);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedProfissional) {
        await updateMutation.mutateAsync({
          id: selectedProfissional.id,
          data,
        });
        addToast('success', 'Profissional atualizado com sucesso');
      } else {
        await createMutation.mutateAsync(data);
        addToast('success', 'Profissional criado com sucesso');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('error', 'Erro ao salvar', getErrorMessage(error));
    }
  };

  const getPerfilBadge = (perfil: string) => {
    const badges = {
      OWNER: { color: 'bg-purple-100 text-purple-800', label: 'Proprietário' },
      ADMIN: { color: 'bg-blue-100 text-blue-800', label: 'Administrador' },
      USER: { color: 'bg-gray-100 text-gray-800', label: 'Usuário' },
    };
    return badges[perfil as keyof typeof badges] || badges.USER;
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
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-1">Gerencie os profissionais da sua empresa</p>
        </div>
        <Button onClick={handleCreate} className="sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfissionais?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum profissional encontrado
                  </td>
                </tr>
              ) : (
                filteredProfissionais?.map((profissional) => (
                  <motion.tr
                    key={profissional.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {profissional.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profissional.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profissional.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getPerfilBadge(profissional.perfil).color
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getPerfilBadge(profissional.perfil).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {profissional.ativo ? (
                        <span className="inline-flex items-center text-green-600">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <UserX className="w-4 h-4 mr-1" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(profissional)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {permissions.canUpdate && (
                        <button
                          onClick={() => handleDelete(profissional)}
                          className="text-red-600 hover:text-red-900"
                          disabled={profissional.id === user?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProfissional ? 'Editar Profissional' : 'Novo Profissional'}
        size="md"
      >
        <ProfissionalForm
          profissional={selectedProfissional || undefined}
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
          <p className="text-gray-600">
            Tem certeza que deseja excluir o profissional{' '}
            <strong>{profissionalToDelete?.nome}</strong>?
          </p>
          <p className="text-sm text-red-600">Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
