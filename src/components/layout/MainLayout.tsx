// src/components/layout/MainLayout.tsx (atualizado)
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, LogOut, Menu, X, Home, Tag, Clock, Settings, Shield, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmpresaAtual, useUpdateEmpresa } from '@/hooks/useEmpresa';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/error-handler';
import { EmpresaForm } from '@/components/forms/EmpresaForm';
// import { LGPDGuard } from '@/components/lgpd/LGPDGuard';
// import { LGPDConsentBanner } from '@/components/lgpd/LGPDConsentBanner';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { addToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
  
  // Usar o hook para buscar dados da empresa
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresaAtual();
  const updateEmpresaMutation = useUpdateEmpresa();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEmpresaSubmit = async (data: any) => {
    console.log('📤 Dados recebidos do formulário:', data);
    
    try {
      const result = await updateEmpresaMutation.mutateAsync(data);
      console.log('✅ Empresa atualizada com sucesso:', result);
      addToast('success', 'Empresa atualizada com sucesso!');
      setIsEmpresaModalOpen(false);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar empresa:', error);
      console.error('📋 Response data:', error.response?.data);
      console.error('📋 Status:', error.response?.status);
      addToast('error', 'Erro ao atualizar empresa', getErrorMessage(error));
    }
  };

  const menuItems = [
    { path: '/inicio', label: 'Dashboard', icon: Home },
    { path: '/agendamentos', label: 'Agendamentos', icon: Calendar },
    { path: '/profissionais', label: 'Profissionais', icon: Users },
    { path: '/servicos', label: 'Serviços', icon: Tag },
    { path: '/disponibilidades', label: 'Disponibilidades', icon: Clock },
    //{ path: '/meus-chamados', label: 'Meus Chamados', icon: MessageCircle },
    { path: '/lgpd', label: 'LGPD', icon: Shield },
    { path: '/ajuda', label: 'Ajuda', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isOwner = user?.role === 'OWNER';

  const getTituloSistema = () => {
    if (loadingEmpresa) {
      return 'AgendaSIM';
    }
    if (empresa?.nome) {
      return `AgendaSIM - ${empresa.nome}`;
    }
    return 'AgendaSIM';
  };

  return (
    // <LGPDGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {loadingEmpresa ? (
                      <div className="flex items-center space-x-2">
                        <span>AgendaSIM</span>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <span className="truncate">{getTituloSistema()}</span>
                    )}
                  </h1>
                  {empresa?.nome && !loadingEmpresa && (
                    <span className="text-xs text-gray-500 font-medium truncate">
                      Sistema de Agendamentos
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 truncate max-w-32">{user?.email}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {/* Info da empresa no sidebar */}
          {empresa?.nome && !loadingEmpresa && (
            <div className="mb-6 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-primary-900 text-sm">{empresa.nome}</h3>
                {/* Botão de configurações só para OWNER */}
                {isOwner && (
                  <button
                    onClick={() => setIsEmpresaModalOpen(true)}
                    className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded transition-colors"
                    title="Configurações da Empresa"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-primary-700">
                ID: {user?.empresaId} • {user?.role || 'USER'}
              </p>
              {empresa.email && (
                <p className="text-xs text-primary-600 mt-1">{empresa.email}</p>
              )}
              {empresa.telefone && (
                <p className="text-xs text-primary-600 mt-1">{empresa.telefone}</p>
              )}
              {isOwner && (
                <p className="text-xs text-primary-500 mt-1 italic">
                  Clique no ⚙️ para configurar
                </p>
              )}
            </div>
          )}

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Separador e link direto para configurações da empresa (OWNER) */}
          {/* {isOwner && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <button
                onClick={() => setIsEmpresaModalOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Configurações da Empresa</span>
              </button>
            </>
          )} */}
        </nav>

        {/* Footer do sidebar com informações da empresa */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">
              AgendaSIM v1.0
            </p>
            {empresa?.nome && !loadingEmpresa && (
              <p className="text-xs text-gray-400 mt-1">
                {empresa.nome}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Modal de Configurações da Empresa */}
      {isOwner && empresa && (
        <Modal
          isOpen={isEmpresaModalOpen}
          onClose={() => setIsEmpresaModalOpen(false)}
          title="Configurações da Empresa"
          size="lg"
        >
          <EmpresaForm
            empresa={empresa}
            onSubmit={handleEmpresaSubmit}
            isLoading={updateEmpresaMutation.isPending}
          />
        </Modal>
      )}
      {/* <LGPDConsentBanner /> */}
      </div>
    // </LGPDGuard>
  );
}