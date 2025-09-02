import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

export function DashboardSection() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading, refetch, isFetching } = useDashboard();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl p-8 min-h-[500px] flex items-center justify-center border border-gray-200 shadow-lg">
        <div className="text-center">
          <Loading size="lg" />
          <p className="text-gray-600 mt-4">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sistema de Agendamentos
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Agora você pode gerenciar profissionais, serviços e disponibilidades. 
            Use o menu lateral para navegar entre as seções e configurar seu sistema de agendamentos!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-lg">
      <div className="space-y-8">
        {/* Header do Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Analytics Overview</h3>
            <p className="text-gray-600 text-sm">Métricas em tempo real da sua empresa</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Live Data</span>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {/* KPIs Principais - Estilo Tech Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 - Agendamentos Hoje */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                TODAY
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-gray-900">
                {dashboard.metricas.agendamentosHoje.total}
              </p>
              <p className="text-gray-600 font-medium">Agendamentos</p>
            </div>
            {/* Status dots */}
            <div className="mt-4 flex space-x-3">
              {Object.entries(dashboard.metricas.agendamentosHoje.porStatus).map(([status, count]) => (
                <div key={status} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${
                    status === 'AGENDADO' ? 'bg-blue-400' :
                    status === 'CONFIRMADO' ? 'bg-emerald-400' :
                    status === 'REALIZADO' ? 'bg-gray-400' : 'bg-red-400'
                  }`} />
                  <span className="text-xs text-gray-600 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2 - Próximos 7 Dias */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                WEEK
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-gray-900">
                {dashboard.metricas.proximosSeteDias}
              </p>
              <p className="text-gray-600 font-medium">Próximos 7 dias</p>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                {dashboard.metricas.proximosSeteDias > 0 ? 'Pipeline ativo' : 'Sem agendamentos'}
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Taxa de Ocupação */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                dashboard.metricas.taxaOcupacaoHoje > 70 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                  : dashboard.metricas.taxaOcupacaoHoje > 40 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                  : 'bg-gradient-to-r from-red-500 to-pink-400'
              }`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                dashboard.metricas.taxaOcupacaoHoje > 70 
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                  : dashboard.metricas.taxaOcupacaoHoje > 40 
                  ? 'text-amber-600 bg-amber-50 border-amber-200' 
                  : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                OCUPAÇÃO
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-gray-900">
                {dashboard.metricas.taxaOcupacaoHoje.toFixed(0)}%
              </p>
              <p className="text-gray-600 font-medium">Taxa Atual</p>
            </div>
            {/* Barra de progresso futurística */}
            <div className="mt-4 space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    dashboard.metricas.taxaOcupacaoHoje > 70 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                      : dashboard.metricas.taxaOcupacaoHoje > 40 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                      : 'bg-gradient-to-r from-red-500 to-pink-400'
                  }`}
                  style={{ width: `${Math.min(dashboard.metricas.taxaOcupacaoHoje, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Capacidade utilizada</p>
            </div>
          </motion.div>

          {/* Card 4 - Recursos */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-400 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                RECURSOS
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Profissionais</p>
                <p className="text-2xl font-black text-gray-900">
                  {dashboard.indicadores.profissionaisAtivos}
                </p>
              </div>
              <div className="w-full h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">Serviços</p>
                <p className="text-2xl font-black text-gray-900">
                  {dashboard.indicadores.servicosOferecidos}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertas - Estilo Tech Futurístico */}
        {(dashboard.alertas.agendamentosParaConfirmar > 0 || 
          dashboard.alertas.conflitosHorario > 0 || 
          dashboard.alertas.profissionaisSemAgenda.length > 0) && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
              System Alerts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboard.alertas.agendamentosParaConfirmar > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all duration-300"
                  onClick={() => navigate('/agendamentos')}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-amber-700 mb-1">Pendentes</p>
                      <p className="text-2xl font-black text-gray-900 mb-2">{dashboard.alertas.agendamentosParaConfirmar}</p>
                      <p className="text-xs text-gray-600">Agendamentos para confirmar</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {dashboard.alertas.conflitosHorario > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 p-6 rounded-2xl cursor-pointer hover:from-red-100 hover:to-pink-100 transition-all duration-300"
                  onClick={() => navigate('/agendamentos')}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-red-700 mb-1">Conflitos</p>
                      <p className="text-2xl font-black text-gray-900 mb-2">{dashboard.alertas.conflitosHorario}</p>
                      <p className="text-xs text-gray-600">Sobreposições detectadas</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {dashboard.alertas.profissionaisSemAgenda.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-2xl cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                  onClick={() => navigate('/disponibilidades')}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-700 mb-1">Sem Agenda</p>
                      <p className="text-2xl font-black text-gray-900 mb-2">{dashboard.alertas.profissionaisSemAgenda.length}</p>
                      <p className="text-xs text-gray-600">Profissionais sem disponibilidade</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}