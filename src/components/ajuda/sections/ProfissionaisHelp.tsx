import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, UserCheck, Clock, Mail, Phone, Settings } from 'lucide-react';

export function ProfissionaisHelp() {
  const features = [
    {
      icon: Plus,
      title: 'Adicionar Profissional',
      description: 'Como cadastrar um novo profissional',
      steps: [
        'Clique em "Novo Profissional"',
        'Preencha o nome completo',
        'Adicione email e telefone',
        'Defina a especialidade',
        'Configure horários de trabalho',
        'Salve o cadastro'
      ]
    },
    {
      icon: Edit,
      title: 'Editar Profissional',
      description: 'Modificar dados de um profissional',
      steps: [
        'Clique no profissional desejado',
        'Selecione "Editar"',
        'Modifique os dados necessários',
        'Atualize horários se necessário',
        'Salve as alterações'
      ]
    },
    {
      icon: Settings,
      title: 'Configurar Horários',
      description: 'Definir disponibilidade do profissional',
      steps: [
        'Acesse o perfil do profissional',
        'Vá para "Horários de Trabalho"',
        'Selecione os dias da semana',
        'Defina horário de início e fim',
        'Configure intervalos de almoço',
        'Salve a configuração'
      ]
    },
    {
      icon: UserCheck,
      title: 'Gerenciar Permissões',
      description: 'Controlar acesso do profissional',
      steps: [
        'Acesse as configurações do profissional',
        'Defina nível de acesso',
        'Configure permissões específicas',
        'Ative/desative o profissional',
        'Salve as alterações'
      ]
    }
  ];

  const tips = [
    'Mantenha os dados dos profissionais sempre atualizados',
    'Configure horários de trabalho realistas',
    'Use especialidades para organizar melhor os profissionais',
    'Desative profissionais temporariamente em vez de excluí-los',
    'Configure notificações para os profissionais sobre novos agendamentos'
  ];

  const permissions = [
    {
      role: 'Administrador',
      description: 'Acesso total ao sistema',
      permissions: ['Criar agendamentos', 'Editar todos os dados', 'Acessar relatórios', 'Gerenciar outros usuários']
    },
    {
      role: 'Profissional',
      description: 'Acesso limitado às suas funções',
      permissions: ['Ver seus agendamentos', 'Editar seus dados', 'Confirmar atendimentos', 'Acessar sua agenda']
    },
    {
      role: 'Recepcionista',
      description: 'Acesso intermediário',
      permissions: ['Criar agendamentos', 'Editar agendamentos', 'Gerenciar clientes', 'Acessar relatórios básicos']
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
          <Users className="w-8 h-8 mr-3 text-primary-600" />
          Gerenciando Profissionais
        </h1>
        <p className="text-lg text-gray-600">
          Aprenda como cadastrar, configurar e gerenciar sua equipe de profissionais.
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

      {/* Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-primary-600" />
          Níveis de Acesso
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {permissions.map((permission, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{permission.role}</h4>
              <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
              <ul className="space-y-1">
                {permission.permissions.map((perm, permIndex) => (
                  <li key={permIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <UserCheck className="w-6 h-6 mr-2 text-primary-600" />
          Campos de Cadastro
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-primary-600" />
                <span>Nome completo (obrigatório)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-600" />
                <span>Email (obrigatório)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-600" />
                <span>Telefone (opcional)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-primary-600" />
                <span>Especialidade (opcional)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Configurações</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>Horários de trabalho</span>
              </li>
              <li className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-primary-600" />
                <span>Nível de acesso</span>
              </li>
              <li className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-primary-600" />
                <span>Status (ativo/inativo)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          💡 Dicas para Gerenciar Profissionais
        </h3>
        <ul className="space-y-2 text-green-800">
          {tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <span className="text-green-600 mt-1">•</span>
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
