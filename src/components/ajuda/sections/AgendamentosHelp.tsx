import { motion } from 'framer-motion';
import { Calendar, Plus, Search, Filter, Edit, Trash2, Eye, Clock, User, Phone } from 'lucide-react';

export function AgendamentosHelp() {
  const features = [
    {
      icon: Plus,
      title: 'Criar Agendamento',
      description: 'Como adicionar um novo agendamento',
      steps: [
        'Clique em "Novo Agendamento"',
        'Selecione o profissional',
        'Escolha o serviço',
        'Selecione data e horário',
        'Preencha dados do cliente',
        'Confirme o agendamento'
      ]
    },
    {
      icon: Search,
      title: 'Buscar Agendamentos',
      description: 'Encontrar agendamentos específicos',
      steps: [
        'Use a barra de busca no topo',
        'Digite nome do cliente ou serviço',
        'Use os filtros por data',
        'Filtre por profissional',
        'Filtre por status'
      ]
    },
    {
      icon: Edit,
      title: 'Editar Agendamento',
      description: 'Modificar dados de um agendamento',
      steps: [
        'Clique no agendamento desejado',
        'Selecione "Editar"',
        'Modifique os dados necessários',
        'Salve as alterações'
      ]
    },
    {
      icon: Trash2,
      title: 'Cancelar Agendamento',
      description: 'Cancelar ou remover agendamentos',
      steps: [
        'Clique no agendamento',
        'Selecione "Cancelar"',
        'Confirme a ação',
        'O cliente será notificado'
      ]
    }
  ];

  const views = [
    {
      name: 'Lista',
      description: 'Visualização em lista com todos os detalhes',
      icon: '📋'
    },
    {
      name: 'Calendário Diário',
      description: 'Agenda do dia com horários',
      icon: '📅'
    },
    {
      name: 'Calendário Semanal',
      description: 'Visão da semana completa',
      icon: '🗓️'
    },
    {
      name: 'Calendário Mensal',
      description: 'Visão geral do mês',
      icon: '📆'
    }
  ];

  const statusTypes = [
    { status: 'Agendado', color: 'bg-blue-100 text-blue-800', description: 'Agendamento confirmado' },
    { status: 'Confirmado', color: 'bg-green-100 text-green-800', description: 'Cliente confirmou presença' },
    { status: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', description: 'Atendimento em curso' },
    { status: 'Concluído', color: 'bg-gray-100 text-gray-800', description: 'Atendimento finalizado' },
    { status: 'Cancelado', color: 'bg-red-100 text-red-800', description: 'Agendamento cancelado' },
    { status: 'Faltou', color: 'bg-orange-100 text-orange-800', description: 'Cliente não compareceu' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-primary-600" />
          Gerenciando Agendamentos
        </h1>
        <p className="text-lg text-gray-600">
          Aprenda como criar, editar e gerenciar seus agendamentos de forma eficiente.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
              <ol className="space-y-2">
                {feature.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {stepIndex + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          );
        })}
      </div>

      {/* Views */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-6 h-6 mr-2 text-primary-600" />
          Tipos de Visualização
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {views.map((view, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">{view.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{view.name}</h4>
              <p className="text-sm text-gray-600">{view.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-primary-600" />
          Status dos Agendamentos
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {statusTypes.map((status, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
            >
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.status}
              </span>
              <span className="text-sm text-gray-600">{status.description}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Dicas Importantes
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Use o filtro por data para encontrar agendamentos rapidamente</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Clique duas vezes em um agendamento para editá-lo rapidamente</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Use a visualização de calendário para ter uma visão geral</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Configure lembretes automáticos para seus clientes</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
