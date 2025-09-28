import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Como faço para criar meu primeiro agendamento?',
    answer: 'Para criar seu primeiro agendamento, vá para a seção "Agendamentos" e clique em "Novo Agendamento". Preencha os dados do cliente, selecione o profissional, escolha o serviço e defina a data e horário desejados.',
    category: 'Agendamentos'
  },
  {
    question: 'Posso alterar um agendamento depois de criado?',
    answer: 'Sim! Você pode editar qualquer agendamento clicando nele e selecionando "Editar". Você pode alterar dados do cliente, profissional, serviço, data e horário. As alterações serão salvas automaticamente.',
    category: 'Agendamentos'
  },
  {
    question: 'Como configuro os horários de funcionamento?',
    answer: 'Vá para "Disponibilidades" e clique em "Nova Disponibilidade". Selecione o profissional, escolha os dias da semana e defina os horários de início e fim. Você também pode configurar intervalos e pausas.',
    category: 'Disponibilidades'
  },
  {
    question: 'Posso bloquear datas específicas?',
    answer: 'Sim! Na seção de disponibilidades, você pode bloquear datas específicas como feriados, férias ou dias de folga. Isso impedirá que novos agendamentos sejam criados nessas datas.',
    category: 'Disponibilidades'
  },
  {
    question: 'Como adiciono um novo profissional?',
    answer: 'Vá para "Profissionais" e clique em "Novo Profissional". Preencha o nome, email, telefone e especialidade. Depois configure os horários de trabalho e permissões de acesso.',
    category: 'Profissionais'
  },
  {
    question: 'Posso definir diferentes níveis de acesso?',
    answer: 'Sim! Você pode definir se um profissional é administrador (acesso total), profissional (acesso limitado) ou recepcionista (acesso intermediário). Cada nível tem permissões específicas.',
    category: 'Profissionais'
  },
  {
    question: 'Como crio um novo serviço?',
    answer: 'Vá para "Serviços" e clique em "Novo Serviço". Digite o nome, adicione uma descrição, defina o preço e configure a duração em minutos. Salve o serviço para disponibilizá-lo para agendamentos.',
    category: 'Serviços'
  },
  {
    question: 'Posso alterar preços dos serviços?',
    answer: 'Sim! Acesse o serviço desejado, clique em "Editar" e modifique o preço. As alterações se aplicam apenas a novos agendamentos, não afetando os já existentes.',
    category: 'Serviços'
  },
  {
    question: 'Como funciona o link público de agendamento?',
    answer: 'O link público permite que seus clientes agendem diretamente sem precisar fazer login. Eles acessam o link, escolhem o profissional, serviço, data e horário, e preenchem seus dados para confirmar o agendamento.',
    category: 'Agendamentos Públicos'
  },
  {
    question: 'Posso personalizar o link de agendamento?',
    answer: 'Sim! O link inclui o nome da sua empresa e pode ser personalizado. Você pode compartilhar este link em redes sociais, site ou WhatsApp para que clientes agendem facilmente.',
    category: 'Agendamentos Públicos'
  },
  {
    question: 'Como vejo estatísticas dos meus agendamentos?',
    answer: 'No dashboard principal, você encontra gráficos e métricas sobre agendamentos, profissionais mais procurados, serviços mais vendidos e outras estatísticas importantes para seu negócio.',
    category: 'Dashboard'
  },
  {
    question: 'Posso exportar dados dos agendamentos?',
    answer: 'Atualmente, os dados são exibidos apenas na plataforma. Em futuras atualizações, será possível exportar relatórios em Excel ou PDF.',
    category: 'Dashboard'
  },
  {
    question: 'O que é LGPD e por que preciso aceitar?',
    answer: 'A LGPD (Lei Geral de Proteção de Dados) é uma lei brasileira que protege dados pessoais. Ao aceitar, você concorda com o tratamento de seus dados conforme nossa política de privacidade.',
    category: 'LGPD'
  },
  {
    question: 'Meus dados estão seguros na plataforma?',
    answer: 'Sim! Utilizamos criptografia e seguimos as melhores práticas de segurança. Seus dados são protegidos e não são compartilhados com terceiros sem seu consentimento.',
    category: 'LGPD'
  },
  {
    question: 'Como faço para cancelar minha conta?',
    answer: 'Para cancelar sua conta, entre em contato conosco através da seção "Contato" na central de ajuda. Processaremos sua solicitação em até 48 horas.',
    category: 'Conta'
  },
  {
    question: 'Posso usar a plataforma no celular?',
    answer: 'Sim! A plataforma é responsiva e funciona perfeitamente em dispositivos móveis. Você pode acessar de qualquer smartphone ou tablet com navegador.',
    category: 'Técnico'
  },
  {
    question: 'O que fazer se esqueci minha senha?',
    answer: 'Na tela de login, clique em "Esqueci minha senha" e digite seu email. Você receberá um link para redefinir sua senha. Verifique também a pasta de spam.',
    category: 'Login'
  },
  {
    question: 'Posso ter mais de uma empresa na mesma conta?',
    answer: 'Atualmente, cada conta está vinculada a uma empresa. Se precisar gerenciar múltiplas empresas, será necessário criar contas separadas para cada uma.',
    category: 'Conta'
  }
];

const categories = ['Todos', 'Agendamentos', 'Disponibilidades', 'Profissionais', 'Serviços', 'Agendamentos Públicos', 'Dashboard', 'LGPD', 'Conta', 'Técnico', 'Login'];

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <HelpCircle className="w-8 h-8 mr-3 text-primary-600" />
          Perguntas Frequentes
        </h1>
        <p className="text-lg text-gray-600">
          Encontre respostas rápidas para as dúvidas mais comuns sobre a plataforma.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => {
          const isOpen = openItems.includes(index);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma pergunta encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou entre em contato conosco.
          </p>
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Não encontrou sua dúvida?
        </h3>
        <p className="text-gray-600 mb-4">
          Entre em contato conosco e teremos prazer em ajudá-lo!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            Suporte 24/7
          </span>
          <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
            Resposta rápida
          </span>
        </div>
      </div>
    </motion.div>
  );
}
