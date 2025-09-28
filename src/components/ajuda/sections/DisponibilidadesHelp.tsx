import { motion } from 'framer-motion';
import { Clock, Plus, Edit, Calendar, Settings, AlertCircle, CheckCircle } from 'lucide-react';

export function DisponibilidadesHelp() {
  const features = [
    {
      icon: Plus,
      title: 'Criar Disponibilidade',
      description: 'Como definir horários disponíveis',
      steps: [
        'Clique em "Nova Disponibilidade"',
        'Selecione o profissional',
        'Escolha o dia da semana',
        'Defina horário de início',
        'Defina horário de fim',
        'Configure intervalos se necessário',
        'Salve a disponibilidade'
      ]
    },
    {
      icon: Edit,
      title: 'Editar Horários',
      description: 'Modificar disponibilidades existentes',
      steps: [
        'Clique na disponibilidade desejada',
        'Selecione "Editar"',
        'Modifique horários ou dias',
        'Ajuste intervalos',
        'Salve as alterações'
      ]
    },
    {
      icon: Calendar,
      title: 'Bloquear Datas',
      description: 'Bloquear datas específicas',
      steps: [
        'Acesse a disponibilidade',
        'Clique em "Bloquear Data"',
        'Selecione a data',
        'Adicione motivo (opcional)',
        'Confirme o bloqueio'
      ]
    },
    {
      icon: Settings,
      title: 'Configurar Intervalos',
      description: 'Definir pausas entre atendimentos',
      steps: [
        'Acesse a disponibilidade',
        'Vá para "Configurações"',
        'Defina tempo de intervalo',
        'Configure pausa para almoço',
        'Salve as configurações'
      ]
    }
  ];

  const timeSlots = [
    { time: '08:00 - 12:00', description: 'Manhã' },
    { time: '12:00 - 14:00', description: 'Almoço' },
    { time: '14:00 - 18:00', description: 'Tarde' },
    { time: '18:00 - 22:00', description: 'Noite' }
  ];

  const tips = [
    'Configure horários realistas baseados na sua rotina',
    'Use intervalos para evitar sobrecarga',
    'Bloqueie feriados e datas especiais',
    'Considere tempo de preparação entre atendimentos',
    'Mantenha horários consistentes para melhor organização'
  ];

  const commonIssues = [
    {
      problem: 'Cliente não consegue agendar',
      solution: 'Verifique se há disponibilidade configurada para o profissional e serviço',
      icon: AlertCircle
    },
    {
      problem: 'Horários não aparecem',
      solution: 'Confirme se a disponibilidade está ativa e não há conflitos',
      icon: AlertCircle
    },
    {
      problem: 'Agendamento em horário indisponível',
      solution: 'Verifique se não há sobreposição de disponibilidades',
      icon: AlertCircle
    },
    {
      problem: 'Intervalos não funcionam',
      solution: 'Confirme se os intervalos estão configurados corretamente',
      icon: AlertCircle
    }
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
          <Clock className="w-8 h-8 mr-3 text-primary-600" />
          Gerenciando Disponibilidades
        </h1>
        <p className="text-lg text-gray-600">
          Aprenda como configurar horários disponíveis para seus profissionais e serviços.
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

      {/* Time Slots */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-primary-600" />
          Períodos do Dia
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeSlots.map((slot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg text-center"
            >
              <div className="text-lg font-semibold text-gray-900 mb-1">{slot.time}</div>
              <div className="text-sm text-gray-600">{slot.description}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2 text-primary-600" />
          Problemas Comuns
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {commonIssues.map((issue, index) => {
            const Icon = issue.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{issue.problem}</h4>
                    <p className="text-sm text-gray-600">{issue.solution}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Dicas Importantes
        </h3>
        <ul className="space-y-2 text-blue-800">
          {tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <span className="text-blue-600 mt-1">•</span>
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Best Practices */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          ✅ Boas Práticas
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Configuração</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Configure horários com antecedência</li>
              <li>• Use intervalos de 15-30 minutos</li>
              <li>• Reserve tempo para preparação</li>
              <li>• Configure pausas para almoço</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Manutenção</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Revise disponibilidades semanalmente</li>
              <li>• Bloqueie feriados com antecedência</li>
              <li>• Ajuste horários conforme necessário</li>
              <li>• Mantenha consistência nos horários</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
