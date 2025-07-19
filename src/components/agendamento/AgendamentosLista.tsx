import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Search,
  Filter,
  User,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { AgendamentosFiltros } from '@/hooks/useAgendamentosLogic';
import { dateUtils } from '@/utils/dateUtils';

interface AgendamentosListaProps {
  agendamentosFiltrados: Agendamento[] | undefined;
  filtros: AgendamentosFiltros;
  onFiltrosChange: (filtros: Partial<AgendamentosFiltros>) => void;
  onNovoAgendamento: () => void;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
}

export function AgendamentosLista({
  agendamentosFiltrados,
  filtros,
  onFiltrosChange,
  onNovoAgendamento,
  onEdit,
  onDelete,
}: AgendamentosListaProps) {
  
  const getStatusBadge = (status: StatusAgendamento) => {
    const badges = {
      AGENDADO: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      CONFIRMADO: { color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      REALIZADO: { color: 'bg-gray-100 text-gray-800', label: 'Realizado' },
      CANCELADO: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };
    return badges[status] || badges.AGENDADO;
  };

  const formatDateTime = (dateTime: string) => {
    return dateUtils.formatLocal(dateTime);
  };

  return (
    <>
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por cliente, serviço ou profissional..."
              className="pl-10"
              value={filtros.search}
              onChange={(e) => onFiltrosChange({ search: e.target.value })}
            />
          </div>

          {/* Filtro por Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm transition-all hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              value={filtros.selectedStatus}
              onChange={(e) =>
                onFiltrosChange({ selectedStatus: e.target.value as StatusAgendamento | 'ALL' })
              }
            >
              <option value="ALL">Todos os status</option>
              <option value="AGENDADO">Agendado</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="REALIZADO">Realizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Filtro por Data */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="date"
              className="pl-10"
              value={filtros.selectedDate}
              onChange={(e) => onFiltrosChange({ selectedDate: e.target.value })}
            />
          </div>

          {/* Limpar Filtros */}
          <Button
            variant="outline"
            onClick={() => onFiltrosChange({
              search: '',
              selectedStatus: 'ALL',
              selectedDate: '',
            })}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {agendamentosFiltrados?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {filtros.search || filtros.selectedStatus !== 'ALL' || filtros.selectedDate
                ? 'Nenhum agendamento encontrado com os filtros aplicados'
                : 'Nenhum agendamento cadastrado'}
            </p>
            <Button onClick={onNovoAgendamento} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro agendamento
            </Button>
          </div>
        ) : (
          agendamentosFiltrados?.map((agendamento) => {
            const statusBadge = getStatusBadge(agendamento.status);

            return (
              <motion.div
                key={agendamento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Cliente */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {agendamento.nomeCliente}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {agendamento.telefoneCliente}
                      </p>
                    </div>

                    {/* Serviço */}
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        {agendamento.servicoTitulo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {agendamento.profissionalNome}
                      </p>
                    </div>

                    {/* Data e Hora */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDateTime(agendamento.dataHora)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(agendamento)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(agendamento)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </>
  );
}