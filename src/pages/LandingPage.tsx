import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Shield, Check, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Online',
      description: 'Sistema completo de agendamento online 24/7. Seus clientes podem agendar a qualquer hora, de qualquer lugar.'
    },
    {
      icon: Clock,
      title: 'Gestão de Horários',
      description: 'Configure facilmente seus horários de atendimento e disponibilidade. Evite conflitos e otimize sua agenda.'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Gerencie profissionais, serviços e permissões em um só lugar. Tenha controle total da sua equipe.'
    },
    {
      icon: Shield,
      title: 'Segurança e LGPD',
      description: 'Plataforma 100% segura, em conformidade com a LGPD. Seus dados e de seus clientes protegidos.'
    }
  ];

  const benefits = [
    'Redução de 80% no tempo gasto com agendamentos',
    'Diminuição de 90% nas ligações para marcar consultas',
    'Aumento de 60% na satisfação dos clientes',
    'Controle total da agenda em tempo real',
    'Relatórios detalhados de performance',
    'Integração com WhatsApp para confirmações'
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      business: 'Clínica Bem Estar',
      text: 'Revolucionou nossa forma de trabalhar. Agora nossos clientes agendam sozinhos e temos muito mais tempo para focar no atendimento.',
      rating: 5
    },
    {
      name: 'João Santos',
      business: 'Barbearia Premium',
      text: 'Sistema muito intuitivo e fácil de usar. Nossos clientes adoraram a praticidade de agendar pelo celular.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      business: 'Estúdio de Beleza',
      text: 'Melhor investimento que fizemos. Organizou completamente nossa agenda e aumentou nossa produtividade.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AgendaSIM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/cadastro')}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Transforme sua empresa com
                <span className="text-primary-600 block">agendamentos inteligentes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Automatize seus agendamentos, reduza cancelamentos e ofereça uma experiência incrível aos seus clientes. 
                Tudo isso em uma plataforma Simples e segura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/cadastro')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg"
                >
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 text-lg"
                >
                  Ver Demonstração
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Agenda de Hoje</h3>
                    <span className="text-sm text-green-600 font-medium">12 agendamentos</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { time: '09:00', client: 'Maria Silva', service: 'Corte + Escova' },
                      { time: '10:30', client: 'João Santos', service: 'Barba + Cabelo' },
                      { time: '14:00', client: 'Ana Costa', service: 'Manicure' }
                    ].map((appointment, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{appointment.time}</span>
                            <span className="text-sm text-gray-500">{appointment.service}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.client}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvido especialmente para empresas que valorizam eficiência, organização e satisfação do cliente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Resultados que você pode esperar
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Empresas que usam o AgendaSIM veem melhorias significativas em produtividade e satisfação do cliente.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Estatísticas Reais</h3>
                <p className="text-gray-600">Baseado em dados de nossos clientes</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">80%</div>
                  <p className="text-sm text-gray-600">Redução no tempo de agendamento</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-600 mb-2">90%</div>
                  <p className="text-sm text-gray-600">Menos ligações recebidas</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
                  <p className="text-sm text-gray-600">Aumento na satisfação</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <p className="text-sm text-gray-600">Disponibilidade online</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que os clientes poderiam dizer
            </h2>
            <p className="text-xl text-gray-600">
              Milhares de empresas já podem transformar seus negócios com o AgendaSIM
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & LGPD Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Shield className="w-16 h-16 text-primary-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Segurança e Privacidade</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sua tranquilidade e a de seus clientes é nossa prioridade. Utilizamos as melhores práticas de segurança da indústria.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Conformidade LGPD</h3>
              <p className="text-gray-300">
                100% em conformidade com a Lei Geral de Proteção de Dados. Seus dados e de seus clientes estão seguros.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Criptografia SSL</h3>
              <p className="text-gray-300">
                Todas as informações são transmitidas com criptografia SSL de 256 bits, garantindo máxima segurança.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Backup Automático</h3>
              <p className="text-gray-300">
                Backups automáticos diários garantem que seus dados nunca sejam perdidos. Redundância em múltiplos servidores.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Junte-se a milhares de empresas que já automatizaram seus agendamentos. 
              Comece grátis hoje mesmo!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/cadastro')}
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Começar Grátis Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
              >
                Fazer Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-8 h-8 text-primary-400" />
                <span className="text-2xl font-bold">AgendaSIM</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma de agendamento online mais completa e segura do Brasil.
              </p>
              {/* <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>(11) 9999-9999</span>
                </div>
              </div> */}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                {/* <li><a href="#" className="hover:text-white transition-colors">Blog</a></li> */}
                {/* <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li> */}
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgendaSIM. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
