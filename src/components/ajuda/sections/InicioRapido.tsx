import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Calendar, Users, Tag, Clock } from 'lucide-react';

export function InicioRapido() {
  const steps = [
    {
      icon: Users,
      title: '1. Configure seus Profissionais',
      description: 'Adicione os profissionais que irão atender os clientes',
      action: 'Vá para Profissionais → Novo Profissional'
    },
    {
      icon: Tag,
      title: '2. Crie seus Serviços',
      description: 'Defina os serviços oferecidos com preços e duração',
      action: 'Vá para Serviços → Novo Serviço'
    },
    {
      icon: Clock,
      title: '3. Configure Disponibilidades',
      description: 'Defina os horários disponíveis para cada profissional',
      action: 'Vá para Disponibilidades → Nova Disponibilidade'
    },
    {
      icon: Calendar,
      title: '4. Comece a Agendar',
      description: 'Agora você pode criar e gerenciar agendamentos',
      action: 'Vá para Agendamentos → Novo Agendamento'
    }
  ];

  const quickTips = [
    'Use o link público para que clientes agendem sozinhos',
    'Configure notificações por WhatsApp para seus clientes',
    'Mantenha suas disponibilidades sempre atualizadas',
    'Use o dashboard para acompanhar estatísticas'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bem-vindo ao AgendaSIM! 🎉
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Siga estes passos simples para configurar sua plataforma de agendamentos e começar a atender seus clientes.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center text-sm text-primary-600 font-medium">
                    <span>{step.action}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Dicas Importantes
        </h3>
        <ul className="space-y-2">
          {quickTips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-2 text-blue-800"
            >
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Próximos Passos
        </h3>
        <p className="text-gray-600 mb-4">
          Após completar a configuração inicial, explore as outras seções desta central de ajuda para aprender recursos avançados e resolver dúvidas específicas.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            Configuração Básica
          </span>
          <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
            Pronto para usar
          </span>
        </div>
      </div>
    </motion.div>
  );
}
