import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpNavigation } from '@/components/ajuda/HelpNavigation';
import { InicioRapido } from '@/components/ajuda/sections/InicioRapido';
import { AgendamentosHelp } from '@/components/ajuda/sections/AgendamentosHelp';
import { ProfissionaisHelp } from '@/components/ajuda/sections/ProfissionaisHelp';
import { ServicosHelp } from '@/components/ajuda/sections/ServicosHelp';
import { DisponibilidadesHelp } from '@/components/ajuda/sections/DisponibilidadesHelp';
import { FAQ } from '@/components/ajuda/sections/FAQ';
import { ProblemasHelp } from '@/components/ajuda/sections/ProblemasHelp';
import { ContatoHelp } from '@/components/ajuda/sections/ContatoHelp';

export function Ajuda() {
  const [activeSection, setActiveSection] = useState('inicio');

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
      case 'contato':
        return <ContatoHelp />;
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
                Configurações Básicas
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Dados da Empresa</h3>
                  <p className="text-gray-600 mb-2">
                    Configure nome, email, telefone e endereço da sua empresa.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Nome da empresa (obrigatório)</li>
                    <li>• Email para contato</li>
                    <li>• Telefone/WhatsApp</li>
                    <li>• Endereço completo</li>
                  </ul>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Personalização</h3>
                  <p className="text-gray-600 mb-2">
                    Personalize a aparência e comportamento da plataforma.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Logo da empresa</li>
                    <li>• Cores do tema</li>
                    <li>• Mensagens personalizadas</li>
                    <li>• Configurações de notificação</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'lgpd':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                LGPD - Proteção de Dados
              </h1>
              <p className="text-lg text-gray-600">
                Entenda como a plataforma protege seus dados pessoais conforme a Lei Geral de Proteção de Dados.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                O que é a LGPD?
              </h2>
              <p className="text-gray-600 mb-4">
                A Lei Geral de Proteção de Dados (LGPD) é uma legislação brasileira que regula o tratamento de dados pessoais. 
                Ela garante que seus dados sejam tratados de forma transparente e segura.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Seus Direitos</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Acesso aos seus dados</li>
                    <li>• Correção de dados incorretos</li>
                    <li>• Exclusão dos seus dados</li>
                    <li>• Portabilidade dos dados</li>
                    <li>• Revogação do consentimento</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Nossos Compromissos</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Transparência no tratamento</li>
                    <li>• Segurança dos dados</li>
                    <li>• Não compartilhamento indevido</li>
                    <li>• Respeito à sua privacidade</li>
                    <li>• Cumprimento da legislação</li>
                  </ul>
                </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <HelpNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
