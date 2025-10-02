import { motion } from 'framer-motion';
import { Calendar, Plus, Users, Clock, Tag, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
// import { LGPDTestButton } from '@/components/lgpd/LGPDTestButton';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Olá, {user?.name || 'Usuário'}! 👋
        </h2>
        <p className="text-gray-600">
          Bem-vindo ao seu painel de agendamentos. O que você gostaria de fazer hoje?
        </p>
      </div>

      {/* Quick Actions - 5 botões em uma linha */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/agendamentos')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Novo Agendamento</h3>
          <p className="text-sm text-gray-500">Agende um novo atendimento</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profissionais')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-secondary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Profissionais</h3>
          <p className="text-sm text-gray-500">Gerencie sua equipe</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/servicos')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Tag className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Serviços</h3>
          <p className="text-sm text-gray-500">Gerencie seus serviços</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/disponibilidades')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Disponibilidades</h3>
          <p className="text-sm text-gray-500">Configure horários disponíveis</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/agendamentos?view=calendario&tipo=diaria')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Agenda do Dia</h3>
          <p className="text-sm text-gray-500">Veja os agendamentos de hoje</p>
        </motion.div>
      </div> */}

      {/* Divisor Visual */}
      <div className="flex items-center my-8">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-6">
          <div className="flex items-center space-x-2 text-slate-600">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Dados estatísticos</span>
          </div>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Dashboard Content */}
      <DashboardSection />
      
      {/* Botão de teste LGPD - REMOVER EM PRODUÇÃO */}
      {/* <LGPDTestButton /> */}
    </motion.div>
  );
}