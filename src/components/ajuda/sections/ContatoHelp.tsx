import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin, Send } from 'lucide-react';

export function ContatoHelp() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Envie sua dúvida por email',
      contact: 'suporte@agendasim.com.br',
      responseTime: 'Resposta em até 24 horas',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      icon: Phone,
      title: 'Telefone',
      description: 'Fale diretamente conosco',
      contact: '(11) 99999-9999',
      responseTime: 'Segunda a Sexta, 8h às 18h',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Mensagem rápida via WhatsApp',
      contact: '(11) 99999-9999',
      responseTime: 'Resposta em até 2 horas',
      color: 'bg-green-50 border-green-200 text-green-700'
    }
  ];

  const supportHours = [
    { day: 'Segunda a Sexta', hours: '8h às 18h', status: 'Disponível' },
    { day: 'Sábado', hours: '9h às 13h', status: 'Disponível' },
    { day: 'Domingo', hours: 'Fechado', status: 'Indisponível' }
  ];

  const faqTopics = [
    'Configuração inicial da conta',
    'Problemas com agendamentos',
    'Dúvidas sobre pagamentos',
    'Problemas técnicos',
    'Solicitações de funcionalidades',
    'Cancelamento de conta'
  ];

  const emergencyContacts = [
    {
      situation: 'Problema crítico no sistema',
      contact: 'suporte@agendasim.com.br',
      priority: 'Alta',
      responseTime: '2 horas'
    },
    {
      situation: 'Dúvida sobre funcionalidade',
      contact: 'ajuda@agendasim.com.br',
      priority: 'Média',
      responseTime: '24 horas'
    },
    {
      situation: 'Sugestão de melhoria',
      contact: 'feedback@agendasim.com.br',
      priority: 'Baixa',
      responseTime: '48 horas'
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
          <MessageCircle className="w-8 h-8 mr-3 text-primary-600" />
          Entre em Contato
        </h1>
        <p className="text-lg text-gray-600">
          Estamos aqui para ajudá-lo! Escolha a melhor forma de entrar em contato conosco.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow ${method.color}`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{method.contact}</div>
                <div className="text-sm text-gray-600">{method.responseTime}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Support Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-primary-600" />
          Horários de Atendimento
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {supportHours.map((schedule, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{schedule.day}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  schedule.status === 'Disponível' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {schedule.status}
                </span>
              </div>
              <p className="text-gray-600">{schedule.hours}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Topics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-primary-600" />
          Assuntos que Podemos Ajudar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {faqTopics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{topic}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
          Contatos por Prioridade
        </h2>
        <div className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{contact.situation}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contact.priority === 'Alta' 
                    ? 'bg-red-100 text-red-700'
                    : contact.priority === 'Média'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {contact.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{contact.contact}</span>
                <span>Resposta: {contact.responseTime}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Send className="w-6 h-6 mr-2 text-primary-600" />
          Envie sua Mensagem
        </h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>Selecione um assunto</option>
              <option>Problema técnico</option>
              <option>Dúvida sobre funcionalidade</option>
              <option>Sugestão de melhoria</option>
              <option>Problema com pagamento</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descreva sua dúvida ou problema..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Mensagem</span>
          </button>
        </form>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Informações Adicionais
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• Nossa equipe de suporte é composta por especialistas em tecnologia</p>
          <p>• Oferecemos suporte em português brasileiro</p>
          <p>• Mantenhamos logs de todas as conversas para melhor atendimento</p>
          <p>• Para problemas urgentes, use o telefone ou WhatsApp</p>
        </div>
      </div>
    </motion.div>
  );
}
