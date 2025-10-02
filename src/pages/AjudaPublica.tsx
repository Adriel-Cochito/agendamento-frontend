import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HelpNavigation } from '@/components/ajuda/HelpNavigation';
import { InicioRapido } from '@/components/ajuda/sections/InicioRapido';
import { AgendamentosHelp } from '@/components/ajuda/sections/AgendamentosHelp';
import { ProfissionaisHelp } from '@/components/ajuda/sections/ProfissionaisHelp';
import { ServicosHelp } from '@/components/ajuda/sections/ServicosHelp';
import { DisponibilidadesHelp } from '@/components/ajuda/sections/DisponibilidadesHelp';
import { FAQ } from '@/components/ajuda/sections/FAQ';
import { ProblemasHelp } from '@/components/ajuda/sections/ProblemasHelp';

export function AjudaPublica() {
  const [activeSection, setActiveSection] = useState('inicio');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio':
        return <InicioRapido />;
      case 'agendamentos':
        return <AgendamentosHelp />;
      case 'profissionais':
        return <ProfissionaisHelp />;
      case 'servicos':
        return <ServicosHelp />;
      case 'disponibilidades':
        return <DisponibilidadesHelp />;
      case 'faq':
        return <FAQ />;
      case 'problemas':
        return <ProblemasHelp />;
      case 'configuracoes':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Configurações da Empresa
              </h1>
              <p className="text-lg text-gray-600">
                Aprenda como configurar os dados da sua empresa e personalizar a plataforma.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Dados da Empresa
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Para configurar os dados da sua empresa, acesse o menu de configurações
                  no canto superior direito da tela após fazer login.
                </p>
                <p>
                  Você pode alterar informações como nome da empresa, telefone, endereço
                  e outras configurações importantes.
                </p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <InicioRapido />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Público */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">AgendaSIM</span>
              </div>
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

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegação Lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Central de Ajuda
              </h2>
              <HelpNavigation 
                activeSection={activeSection} 
                onSectionChange={setActiveSection}
                isPublic={true} // Indica que é versão pública
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Simples */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="w-6 h-6 text-primary-400" />
              <span className="text-xl font-bold">AgendaSIM</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
                Início
              </button>
              <button onClick={() => navigate('/lgpd-publica')} className="hover:text-white transition-colors">
                LGPD
              </button>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                Entrar
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400">
            <p>&copy; 2025 AgendaSIM. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
