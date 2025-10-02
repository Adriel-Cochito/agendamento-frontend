import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Users, 
  Calendar, 
  Clock, 
  Tag, 
  Shield,
  MessageCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface HelpNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPublic?: boolean;
}

const helpSections = [
  {
    id: 'inicio',
    title: 'Início Rápido',
    icon: BookOpen,
    description: 'Comece a usar a plataforma'
  },
  {
    id: 'agendamentos',
    title: 'Agendamentos',
    icon: Calendar,
    description: 'Como gerenciar agendamentos'
  },
  {
    id: 'profissionais',
    title: 'Profissionais',
    icon: Users,
    description: 'Gerenciar sua equipe'
  },
  {
    id: 'servicos',
    title: 'Serviços',
    icon: Tag,
    description: 'Configurar serviços oferecidos'
  },
  {
    id: 'disponibilidades',
    title: 'Disponibilidades',
    icon: Clock,
    description: 'Definir horários disponíveis'
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    icon: Settings,
    description: 'Configurações da empresa'
  },
  {
    id: 'lgpd',
    title: 'LGPD',
    icon: Shield,
    description: 'Privacidade e proteção de dados'
  },
  {
    id: 'faq',
    title: 'Perguntas Frequentes',
    icon: HelpCircle,
    description: 'Dúvidas comuns'
  },
  {
    id: 'problemas',
    title: 'Solução de Problemas',
    icon: AlertTriangle,
    description: 'Resolver problemas técnicos'
  },
  {
    id: 'contato',
    title: 'Contato',
    icon: MessageCircle,
    description: 'Fale conosco'
  }
];

export function HelpNavigation({ activeSection, onSectionChange, isPublic = false }: HelpNavigationProps) {
  const navigate = useNavigate();

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'contato' && !isPublic) {
      // Navegar para a página de Meus Chamados apenas se não for público
      navigate('/meus-chamados');
    } else {
      // Comportamento normal para outras seções
      onSectionChange(sectionId);
    }
  };

  // Filtrar seções baseado se é público ou não
  const filteredSections = isPublic 
    ? helpSections.filter(section => section.id !== 'contato') // Remove contato na versão pública
    : helpSections;

  return (
    <nav className="space-y-2">
      {filteredSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <div>
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-gray-500">{section.description}</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
            </motion.button>
          );
        })}
      </nav>
  );
}
