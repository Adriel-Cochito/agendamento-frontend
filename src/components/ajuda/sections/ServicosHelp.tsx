import { motion } from 'framer-motion';
import { Tag, Plus, Edit, Trash2, Clock, DollarSign, Settings, FileText } from 'lucide-react';

export function ServicosHelp() {
  const features = [
    {
      icon: Plus,
      title: 'Criar Serviço',
      description: 'Como cadastrar um novo serviço',
      steps: [
        'Clique em "Novo Serviço"',
        'Digite o nome do serviço',
        'Adicione uma descrição',
        'Defina o preço',
        'Configure a duração',
        'Salve o serviço'
      ]
    },
    {
      icon: Edit,
      title: 'Editar Serviço',
      description: 'Modificar dados de um serviço',
      steps: [
        'Clique no serviço desejado',
        'Selecione "Editar"',
        'Modifique os dados necessários',
        'Atualize preço ou duração',
        'Salve as alterações'
      ]
    },
    {
      icon: Settings,
      title: 'Configurar Preços',
      description: 'Definir valores dos serviços',
      steps: [
        'Acesse o serviço desejado',
        'Clique em "Editar"',
        'Modifique o campo "Preço"',
        'Use vírgula para centavos',
        'Salve as alterações'
      ]
    },
    {
      icon: Clock,
      title: 'Definir Duração',
      description: 'Configurar tempo de atendimento',
      steps: [
        'Acesse o serviço',
        'Clique em "Editar"',
        'Defina a duração em minutos',
        'Considere tempo de preparação',
        'Salve as alterações'
      ]
    }
  ];

  const pricingTips = [
    'Use valores claros e sem confusão',
    'Considere impostos no preço final',
    'Defina preços promocionais quando necessário',
    'Mantenha preços atualizados regularmente',
    'Use descrições detalhadas dos serviços'
  ];

  const durationTips = [
    'Considere tempo de preparação',
    'Adicione margem para atrasos',
    'Diferencie duração por profissional',
    'Considere complexidade do serviço',
    'Ajuste conforme experiência'
  ];

  const serviceTypes = [
    {
      type: 'Consultas',
      duration: '30-60 min',
      price: 'R$ 50-200',
      description: 'Atendimentos individuais'
    },
    {
      type: 'Procedimentos',
      duration: '15-120 min',
      price: 'R$ 30-500',
      description: 'Serviços específicos'
    },
    {
      type: 'Avaliações',
      duration: '45-90 min',
      price: 'R$ 80-300',
      description: 'Exames e avaliações'
    },
    {
      type: 'Retornos',
      duration: '15-30 min',
      price: 'R$ 20-100',
      description: 'Acompanhamentos'
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
          <Tag className="w-8 h-8 mr-3 text-primary-600" />
          Gerenciando Serviços
        </h1>
        <p className="text-lg text-gray-600">
          Aprenda como criar, configurar e gerenciar os serviços oferecidos pela sua empresa.
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

      {/* Service Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-primary-600" />
          Tipos de Serviços Comuns
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceTypes.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{service.type}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  <span>{service.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Guidelines */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Dicas de Preços
          </h3>
          <ul className="space-y-2 text-blue-800">
            {pricingTips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Dicas de Duração
          </h3>
          <ul className="space-y-2 text-green-800">
            {durationTips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <span className="text-green-600 mt-1">•</span>
                <span className="text-sm">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          ⚠️ Boas Práticas
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Organização</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Use nomes claros e descritivos</li>
              <li>• Agrupe serviços similares</li>
              <li>• Mantenha descrições atualizadas</li>
              <li>• Use categorias quando possível</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Precificação</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Considere custos operacionais</li>
              <li>• Pesquise preços do mercado</li>
              <li>• Ofereça pacotes promocionais</li>
              <li>• Revise preços regularmente</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
