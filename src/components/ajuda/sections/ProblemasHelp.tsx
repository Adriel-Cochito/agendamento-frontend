import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, RefreshCw, Wifi, Monitor, Smartphone, Database } from 'lucide-react';

export function ProblemasHelp() {
  const commonProblems = [
    {
      icon: Wifi,
      title: 'Problemas de Conexão',
      description: 'Site não carrega ou está lento',
      solutions: [
        'Verifique sua conexão com a internet',
        'Tente atualizar a página (F5)',
        'Limpe o cache do navegador',
        'Teste em outro navegador',
        'Reinicie seu roteador/modem'
      ],
      severity: 'high'
    },
    {
      icon: Monitor,
      title: 'Problemas de Visualização',
      description: 'Interface não aparece corretamente',
      solutions: [
        'Atualize seu navegador para a versão mais recente',
        'Desative extensões que podem interferir',
        'Verifique se o JavaScript está habilitado',
        'Teste em modo incógnito/privado',
        'Ajuste o zoom da página (Ctrl + 0)'
      ],
      severity: 'medium'
    },
    {
      icon: Database,
      title: 'Problemas de Dados',
      description: 'Informações não salvam ou aparecem incorretas',
      solutions: [
        'Verifique se todos os campos obrigatórios estão preenchidos',
        'Tente salvar novamente',
        'Atualize a página e tente novamente',
        'Verifique se não há caracteres especiais nos campos',
        'Entre em contato conosco se persistir'
      ],
      severity: 'high'
    },
    {
      icon: Smartphone,
      title: 'Problemas no Mobile',
      description: 'Site não funciona bem no celular',
      solutions: [
        'Atualize o navegador do celular',
        'Limpe o cache do navegador',
        'Reinicie o aplicativo do navegador',
        'Verifique se há espaço suficiente no dispositivo',
        'Teste em outro navegador mobile'
      ],
      severity: 'medium'
    }
  ];

  const troubleshootingSteps = [
    {
      step: 1,
      title: 'Identifique o Problema',
      description: 'Anote exatamente o que está acontecendo e quando ocorre',
      tips: [
        'Qual mensagem de erro aparece?',
        'Em qual página o problema ocorre?',
        'O problema acontece sempre ou às vezes?',
        'Alguma coisa mudou recentemente?'
      ]
    },
    {
      step: 2,
      title: 'Tente Soluções Básicas',
      description: 'Teste as soluções mais comuns primeiro',
      tips: [
        'Atualize a página (F5)',
        'Limpe o cache do navegador',
        'Teste em outro navegador',
        'Verifique sua conexão com a internet'
      ]
    },
    {
      step: 3,
      title: 'Documente o Problema',
      description: 'Anote detalhes para facilitar o suporte',
      tips: [
        'Tire prints da tela',
        'Anote mensagens de erro exatas',
        'Registre os passos que levaram ao problema',
        'Teste em diferentes dispositivos'
      ]
    },
    {
      step: 4,
      title: 'Entre em Contato',
      description: 'Se o problema persistir, procure ajuda',
      tips: [
        'Use a seção de contato',
        'Inclua todas as informações coletadas',
        'Seja específico sobre o problema',
        'Mencione se já tentou as soluções básicas'
      ]
    }
  ];

  const browserCompatibility = [
    { browser: 'Chrome', version: '90+', status: 'Suportado', icon: '✅' },
    { browser: 'Firefox', version: '88+', status: 'Suportado', icon: '✅' },
    { browser: 'Safari', version: '14+', status: 'Suportado', icon: '✅' },
    { browser: 'Edge', version: '90+', status: 'Suportado', icon: '✅' },
    { browser: 'Internet Explorer', version: 'Qualquer', status: 'Não Suportado', icon: '❌' }
  ];

  const quickFixes = [
    {
      problem: 'Página em branco',
      fix: 'Atualize a página (Ctrl + F5)',
      icon: RefreshCw
    },
    {
      problem: 'Botões não funcionam',
      fix: 'Verifique se o JavaScript está habilitado',
      icon: Monitor
    },
    {
      problem: 'Dados não salvam',
      fix: 'Verifique campos obrigatórios e tente novamente',
      icon: Database
    },
    {
      problem: 'Site muito lento',
      fix: 'Limpe o cache e feche outras abas',
      icon: Wifi
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
          <AlertTriangle className="w-8 h-8 mr-3 text-orange-500" />
          Solução de Problemas
        </h1>
        <p className="text-lg text-gray-600">
          Encontre soluções para problemas comuns e aprenda como resolver questões técnicas.
        </p>
      </div>

      {/* Quick Fixes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
          Soluções Rápidas
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickFixes.map((fix, index) => {
            const Icon = fix.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">{fix.problem}</h3>
                </div>
                <p className="text-sm text-gray-600">{fix.fix}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Common Problems */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
          Problemas Comuns
        </h2>
        {commonProblems.map((problem, index) => {
          const Icon = problem.icon;
          const severityColor = problem.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-lg border p-6 shadow-sm ${severityColor}`}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Soluções:</h4>
                <ol className="space-y-2">
                  {problem.solutions.map((solution, solutionIndex) => (
                    <li key={solutionIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        {solutionIndex + 1}
                      </span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Troubleshooting Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <RefreshCw className="w-6 h-6 mr-2 text-primary-600" />
          Passo a Passo para Resolver Problemas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {troubleshootingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-gray-600 mb-3">{step.description}</p>
              <ul className="space-y-1">
                {step.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Browser Compatibility */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Monitor className="w-6 h-6 mr-2 text-primary-600" />
          Compatibilidade de Navegadores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Navegador</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Versão Mínima</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {browserCompatibility.map((browser, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-100"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{browser.browser}</td>
                  <td className="py-3 px-4 text-gray-600">{browser.version}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center space-x-1 ${
                      browser.status === 'Suportado' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <span>{browser.icon}</span>
                      <span>{browser.status}</span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Ainda com problemas?
        </h3>
        <p className="text-gray-600 mb-4">
          Se nenhuma das soluções acima resolveu seu problema, entre em contato conosco. 
          Nossa equipe de suporte está pronta para ajudá-lo!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            Suporte Técnico
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Resposta em 24h
          </span>
        </div>
      </div>
    </motion.div>
  );
}
