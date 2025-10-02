// src/routes/index.tsx - Atualizado com parâmetros da empresa
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Home } from '@/pages/Home';
import { LandingPage } from '@/pages/LandingPage';
import { Profissionais } from '@/pages/Profissionais';
import { Servicos } from '@/pages/Servicos';
import { Disponibilidades } from '@/pages/Disponibilidades';
import { Agendamentos } from '@/pages/Agendamentos';
import { LGPD } from '@/pages/LGPD';
import { Ajuda } from '@/pages/Ajuda';
import { AjudaPublica } from '@/pages/AjudaPublica';
import { MeusChamados } from '@/pages/MeusChamados';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import AgendamentoPublico from '@/pages/AgendamentoPublico';
// imports above already include Ajuda and LGPD

export const router = createBrowserRouter([
  // Página pública inicial (Landing Page)
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/cadastro',
    element: <Signup />,
  },
  // Rota pública para agendamentos com parâmetros da empresa
  {
    path: '/agendamento/:empresaId/:nomeEmpresa/:telefoneEmpresa',
    element: <AgendamentoPublico />,
  },
  // Rota alternativa com apenas empresaId (fallback)
  {
    path: '/agendamento/:empresaId',
    element: <AgendamentoPublico />,
  },
  // Rota alternativa com query params (fallback)
  {
    path: '/agendamento',
    element: <AgendamentoPublico />,
  },
  // Páginas públicas (para usuários não logados)
  {
    path: '/ajuda-publica',
    element: <AjudaPublica />,
  },
  {
    path: '/lgpd-publica',
    element: <LGPD />,
  },
  // Rotas protegidas (dashboard)
  {
    path: '/inicio',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Home /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/agendamentos',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Agendamentos /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/profissionais',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Profissionais /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/servicos',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Servicos /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/disponibilidades',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Disponibilidades /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/lgpd',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><LGPD /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/ajuda',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Ajuda /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '/meus-chamados',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><MeusChamados /></MainLayout>,
        index: true,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);