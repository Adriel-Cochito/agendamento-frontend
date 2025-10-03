import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Shield,
  Check,
  Star,
  ArrowRight,
  Cloud,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento de Serviços',
      description:
        'Um sistema completo para agendamento de serviços, permitindo que seus clientes marquem horários de forma online 24/7.',
    },
    {
      icon: Clock,
      title: 'Gestão de Disponibilidade',
      description:
        'Configure seus horários de atendimento, bloqueie datas e gerencie sua disponibilidade com flexibilidade para evitar conflitos.',
    },
    {
      icon: Users,
      title: 'Gestão de Profissionais',
      description:
        'Gerencie múltiplos profissionais, atribua serviços e controle as agendas de toda a sua equipe em um único lugar.',
    },
    {
      icon: Shield,
      title: 'Segurança e Conformidade',
      description:
        'Plataforma 100% segura e em conformidade com a LGPD, garantindo a proteção dos dados dos seus clientes.',
    },
  ];

  const benefits = [
    'Reduza até 80% do tempo gasto com agendamentos',
    'Diminua ligações telefônicas para marcar consultas',
    'Aumente a satisfação dos seus clientes',
    'Tenha controle total da agenda em tempo real',
    'Acesse relatórios detalhados de performance',
    'Envie lembretes automáticos por WhatsApp',
  ];

  const testimonials = [
    {
      name: 'Clínicas e Consultórios',
      business: 'Área da Saúde',
      text: 'Com o AgendeSIM, você pode organizar suas consultas, enviar lembretes automáticos e reduzir faltas de pacientes.',
      rating: 5,
    },
    {
      name: 'Salões e Barbearias',
      business: 'Beleza e Estética',
      text: 'Permita que seus clientes agendem online a qualquer hora. Gerencie múltiplos profissionais e serviços com facilidade.',
      rating: 5,
    },
    {
      name: 'Academias e Estúdios',
      business: 'Fitness e Bem-estar',
      text: 'Organize aulas, treinos personalizados e atendimentos. Seus alunos podem reservar horários pelo celular.',
      rating: 5,
    },
  ];

  const integrations = [
    { name: 'E-mail', description: 'Gmail, Outlook e mais', icon: '📧' },
    { name: 'WhatsApp', description: 'Notificações diretas', icon: 'whatsapp' },
    { name: 'Google Calendar', description: 'Sincronização automática', icon: '📅' },
    { name: 'Pagamentos', description: 'Mercado Pago, PagSeguro', icon: '💳' },
  ];

  // const apiFeatures = [
  //   { title: 'Documentação Completa', description: 'Guias detalhados, exemplos de código e referência completa de endpoints.', icon: '📝' },
  //   { title: 'Autenticação Segura', description: 'OAuth 2.0 e API Keys para máxima segurança nas suas integrações.', icon: '🔑' },
  //   { title: 'Alta Performance', description: 'Respostas rápidas e rate limits generosos para suas aplicações.', icon: '⚡' },
  //   { title: 'Webhooks', description: 'Receba notificações em tempo real sobre eventos no sistema.', icon: '🔄' }
  // ];Inte

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AgendeSIM</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#funcionalidades"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#precos"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Preços
              </a>
              <a
                href="#integracoes"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Futuras Integrações
              </a>
              <a
                href="#sobre"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Sobre
              </a>

              <a
                href="/ajuda-publica"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Ajuda
              </a>
              {/* <a href="#api" className="text-gray-600 hover:text-primary-600 transition-colors">API</a> */}
            </nav>
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
                A plataforma de agendamento de
                <span className="text-primary-600 block">SERVIÇOS</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Concentre-se no que você faz de melhor e deixe que o AgendeSIM cuide dos
                seus agendamentos. Plataforma completa para agendamento de serviços, ideal
                para profissionais autônomos e empresas.
              </p>
              <div className="inline-flex items-center gap-3 bg-primary-100/60 border border-primary-200 text-primary-800 px-4 py-2 rounded-lg mb-6">
                <strong className="uppercase tracking-wider">Foco: SERVIÇOS</strong>
                <span className="text-sm">
                  Projetado para quem presta serviços — salões, clínicas, consultórios,
                  estúdios, prestadores autônomos e empresas de serviços.
                </span>
              </div>
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
                  Fazer Login
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
                    <span className="text-sm text-green-600 font-medium">
                      12 agendamentos
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { time: '09:00', client: 'Maria Silva', service: 'Corte + Escova' },
                      { time: '10:30', client: 'João Santos', service: 'Barba + Cabelo' },
                      { time: '14:00', client: 'Ana Costa', service: 'Manicure' },
                    ].map((appointment, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">
                              {appointment.time}
                            </span>
                            <span className="text-sm text-gray-500">
                              {appointment.service}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{appointment.client}</p>
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

      {/* Cloud Advantage Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <Cloud className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">100% na Nuvem</h2>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Acesse seus agendamentos de qualquer lugar, em qualquer dispositivo.
              Computador, tablet ou celular - seus dados sempre sincronizados e
              disponíveis!
            </p>
            <div className="flex justify-center gap-8 mt-8">
              <div className="flex flex-col items-center">
                <Monitor className="w-12 h-12 mb-2" />
                <span className="text-sm">Desktop</span>
              </div>
              <div className="flex flex-col items-center">
                <Tablet className="w-12 h-12 mb-2" />
                <span className="text-sm">Tablet</span>
              </div>
              <div className="flex flex-col items-center">
                <Smartphone className="w-12 h-12 mb-2" />
                <span className="text-sm">Celular</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades</h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar seus agendamentos
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Preços</h2>
            <p className="text-xl text-gray-600">Plano ideal para você começar agora</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">Plano Gratuito</h3>
                <div className="text-5xl font-bold my-4">R$ 0</div>
                <p className="text-xl opacity-90">🎉 Gratuito por tempo limitado!</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Agendamentos ilimitados</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Lembretes automáticos</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Gestão de clientes</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Calendário inteligente</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Acesso na nuvem</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Suporte por e-mail</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Todas as integrações</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>Relatórios básicos</span>
                </li>
              </ul>
              <Button
                size="lg"
                onClick={() => navigate('/cadastro')}
                className="w-full bg-white text-primary-600 hover:bg-gray-100 text-lg font-semibold"
              >
                Começar Agora
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integracoes" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Futuras Integrações</h2>
            <p className="text-xl text-gray-600">
              Conecte com as ferramentas que você já usa
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl text-center transition-colors"
              >
                {integration.icon === 'whatsapp' ? (
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-green-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                ) : (
                  <div className="text-5xl mb-4">{integration.icon}</div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {integration.name}
                </h3>
                <p className="text-gray-600">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o AgendeSIM?
            </h2>
            <p className="text-xl text-gray-600">Benefícios que você pode alcançar</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 bg-white p-4 rounded-lg"
              >
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sobre Nós</h2>
            <p className="text-xl text-gray-600">
              Transformando a gestão de agendamentos no Brasil
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-primary-600 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 mb-4">
                O AgendeSIM nasceu para simplificar a rotina de prestadores de serviços e
                empresas que vivem de agendamentos. Nossa plataforma, desenvolvida no
                Brasil, foca em simplicidade, segurança e eficiência para o gerenciamento
                de serviços.
              </p>
              <p className="text-gray-600 mb-4">
                Acreditamos que a tecnologia deve ser uma aliada, não um obstáculo. Por
                isso, criamos uma solução intuitiva que qualquer profissional ou empresa
                pode usar para otimizar seu tempo e melhorar a experiência do cliente.
              </p>
              <p className="text-gray-600">
                Nossa missão é transformar a rotina dos prestadores de serviços em todo o
                Brasil, oferecendo uma plataforma de agendamentos que economiza tempo,
                reduz custos e fortalece o relacionamento com seus clientes.{' '}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">Meta</div>
                <p>100k+ agendamentos</p>
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">Meta</div>
                <p>10k+ empresas</p>
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <p>Uptime garantido</p>
              </div>
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p>Disponibilidade</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Section */}
      {/* <section id="api" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">API</h2>
            <p className="text-xl text-gray-300">Integre o AgendeSIM ao seu sistema</p>
          </motion.div>
          <div className="mb-12">
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Nossa API RESTful completa permite que você integre todas as funcionalidades do AgendeSIM em seus próprios sistemas e aplicações.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {apiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 p-6 rounded-xl"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Acessar Documentação
            </Button>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ideal para diversos segmentos
            </h2>
            <p className="text-xl text-gray-600">
              Veja como o AgendeSIM pode transformar seu negócio
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Seja uma das primeiras empresas a automatizar seus agendamentos. Comece
              grátis hoje mesmo!
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-8 h-8 text-primary-400" />
                <span className="text-2xl font-bold">AgendeSIM</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma de agendamento online mais completa e segura do Brasil.
              </p>
              <div className="space-y-2 text-gray-400">
                <p>☁️ 100% na nuvem</p>
                <p>🔒 Segurança garantida</p>
                <p>🇧🇷 Feito no Brasil</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#funcionalidades"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#precos"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#integracoes"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Integrações
                  </a>
                </li>
                {/* <li>
                  <a href="#api" className="text-gray-400 hover:text-white transition-colors">
                    API
                  </a>
                </li> */}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#sobre"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sobre Nós
                  </a>
                </li>
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     Contato (Suporte)
                   </a>
                 </li>
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     Ajuda
                   </a>
                 </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Legal</h4>
              <ul className="space-y-2">
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     Política de Privacidade
                   </a>
                 </li>
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     Termos de Uso
                   </a>
                 </li>
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     LGPD
                   </a>
                 </li>
                 <li>
                   <a
                     href="/ajuda-publica"
                     className="text-gray-400 hover:text-white transition-colors"
                   >
                     Cookies
                   </a>
                 </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 AgendeSIM. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
