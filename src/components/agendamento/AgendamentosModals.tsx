import { ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AgendamentoForm } from '@/components/forms/AgendamentoForm';
import { HorarioSelectorCompact } from '@/components/agendamento/HorarioSelectorCompact';
import { ProfissionalSelector } from '@/components/agendamento/ProfissionalSelector';
import { ServicoSelector } from '@/components/agendamento/ServicoSelector';
import { AgendamentosModalStates } from '@/hooks/useAgendamentosLogic';
import { dateUtils } from '@/utils/dateUtils';

interface AgendamentosModalsProps {
  modalStates: AgendamentosModalStates;
  modalHandlers: any;
  empresaId: number;
}

export function AgendamentosModals({
  modalStates,
  modalHandlers,
  empresaId,
}: AgendamentosModalsProps) {
  const {
    resetEtapas,
    handleServicoSelect,
    handleProfissionaisSelect,
    handleDataSelect,
    handleHorarioSelect,
    handleCreateSubmit,
    handleEditSubmit,
    confirmDelete,
    setModalStates,
    createMutation,
    updateMutation,
    deleteMutation,
  } = modalHandlers;

  return (
    <>
      {/* Modal de Criação - Multi-etapas */}
      <Modal
        isOpen={modalStates.isModalOpen}
        onClose={() => {
          setModalStates((prev: any) => ({ ...prev, isModalOpen: false }));
          resetEtapas();
        }}
        title="Novo Agendamento"
        size="lg"
      >
        <div className="space-y-4">
          {/* Informação de horário pré-selecionado */}
          {modalStates.selectedDataHora && modalStates.selectedDataAgendamento && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-800">
                    Horário Pré-selecionado
                  </p>
                  <p className="text-sm text-primary-600">
                    {dateUtils.formatLocal(modalStates.selectedDataHora)}
                    {modalStates.profissionaisDisponiveisParaFiltro && modalStates.profissionaisDisponiveisParaFiltro.length > 0 && (
                      <span className="ml-2">
                        • {modalStates.profissionaisDisponiveisParaFiltro.length} profissional(is) disponível(is) neste horário
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span
              className={modalStates.etapaAtual === 'servico' ? 'text-primary-600 font-medium' : 'text-gray-500'}
            >
              1. Serviço
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={modalStates.etapaAtual === 'profissionais' ? 'text-primary-600 font-medium' : 'text-gray-500'}
            >
              2. Profissionais
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={modalStates.etapaAtual === 'data' ? 'text-primary-600 font-medium' : 'text-gray-500'}
            >
              3. Data
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={modalStates.etapaAtual === 'horario' ? 'text-primary-600 font-medium' : 'text-gray-500'}
            >
              4. Horário
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span
              className={modalStates.etapaAtual === 'formulario' ? 'text-primary-600 font-medium' : 'text-gray-500'}
            >
              5. Dados
            </span>
          </div>

          {/* Etapa 1: Seleção de Serviço */}
          {modalStates.etapaAtual === 'servico' && (
            <ServicoSelector
              onServicoSelect={handleServicoSelect}
              selectedServico={modalStates.selectedServico}
            />
          )}

          {/* Etapa 2: Seleção de Profissionais */}
          {modalStates.etapaAtual === 'profissionais' && modalStates.selectedServico && (
            <div className="space-y-4">
              <ProfissionalSelector
                servico={modalStates.selectedServico}
                onProfissionaisSelect={handleProfissionaisSelect}
                selectedProfissionais={modalStates.selectedProfissionais}
                singleSelect={false}
                profissionaisDisponiveis={modalStates.profissionaisDisponiveisParaFiltro}
              />
              <Button variant="outline" onClick={() => setModalStates((prev: any) => ({ ...prev, etapaAtual: 'servico' }))}>
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 3: Seleção de Data */}
          {modalStates.etapaAtual === 'data' && modalStates.selectedServico && modalStates.selectedProfissionais.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Escolha a Data</h3>
                <p className="text-sm text-gray-500">
                  Serviço: {modalStates.selectedServico.titulo} • {modalStates.selectedProfissionais.length} profissional(is) selecionado(s)
                </p>
              </div>
              <div>
                <Input
                  type="date"
                  value={modalStates.selectedDataAgendamento}
                  onChange={(e) => handleDataSelect(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Button variant="outline" onClick={() => setModalStates((prev: any) => ({ ...prev, etapaAtual: 'profissionais' }))}>
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 4: Seleção de Horário */}
          {modalStates.etapaAtual === 'horario' && modalStates.selectedServico && modalStates.selectedProfissionais.length > 0 && modalStates.selectedDataAgendamento && (
            <div className="space-y-4">
              <HorarioSelectorCompact
                servico={modalStates.selectedServico}
                profissionais={modalStates.selectedProfissionais}
                data={modalStates.selectedDataAgendamento}
                onHorarioSelect={handleHorarioSelect}
                showProfissionalSelection={false}
              />
              <Button
                variant="outline"
                onClick={() => setModalStates((prev: any) => ({ ...prev, etapaAtual: 'data' }))}
              >
                Voltar
              </Button>
            </div>
          )}

          {/* Etapa 5: Formulário */}
          {modalStates.etapaAtual === 'formulario' && modalStates.selectedServico && modalStates.selectedProfissionais.length > 0 && (
            <div className="space-y-4">
              <AgendamentoForm
                servico={modalStates.selectedServico}
                profissional={modalStates.selectedProfissionais[0]}
                dataHora={modalStates.selectedDataHora}
                onSubmit={handleCreateSubmit}
                isLoading={createMutation.isPending}
                empresaId={empresaId}
              />
              <Button
                variant="outline"
                onClick={() => setModalStates((prev: any) => ({ ...prev, etapaAtual: 'horario' }))}
                disabled={createMutation.isPending}
              >
                Voltar
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={modalStates.isEditModalOpen}
        onClose={() => setModalStates((prev: any) => ({ ...prev, isEditModalOpen: false }))}
        title="Editar Agendamento"
        size="lg"
      >
        {modalStates.selectedAgendamento && modalStates.selectedServico && modalStates.selectedProfissionais.length > 0 && (
          <AgendamentoForm
            agendamento={modalStates.selectedAgendamento}
            servico={modalStates.selectedServico}
            profissional={modalStates.selectedProfissionais[0]}
            dataHora={modalStates.selectedDataHora}
            onSubmit={handleEditSubmit}
            isLoading={updateMutation.isPending}
            empresaId={empresaId}
          />
        )}
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        isOpen={modalStates.isDeleteModalOpen}
        onClose={() => setModalStates((prev: any) => ({ ...prev, isDeleteModalOpen: false }))}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">
                Tem certeza que deseja excluir este agendamento?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Cliente:</strong> {modalStates.agendamentoToDelete?.nomeCliente}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Serviço:</strong> {modalStates.agendamentoToDelete?.servicoTitulo}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Data:</strong>{' '}
                {modalStates.agendamentoToDelete && dateUtils.formatLocal(modalStates.agendamentoToDelete.dataHora)}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setModalStates((prev: any) => ({ ...prev, isDeleteModalOpen: false }))}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Excluir Agendamento
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Componente auxiliar removido - agora importado de arquivo separado