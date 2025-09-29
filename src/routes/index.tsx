// src/routes/index.tsx - Atualizado com parâmetros da empresa
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Home } from '@/pages/Home';
import { Profissionais } from '@/pages/Profissionais';
import { Servicos } from '@/pages/Servicos';
import { Disponibilidades } from '@/pages/Disponibilidades';
import { Agendamentos } from '@/pages/Agendamentos';
import { LGPD } from '@/pages/LGPD';
import { Ajuda } from '@/pages/Ajuda';
import { MeusChamados } from '@/pages/MeusChamados';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import AgendamentoPublico from '@/pages/AgendamentoPublico';

export const router = createBrowserRouter([
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
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout><Home /></MainLayout>,
        index: true,
      },
      {
        path: 'agendamentos',
        element: <MainLayout><Agendamentos /></MainLayout>,
      },
      {
        path: 'profissionais',
        element: <MainLayout><Profissionais /></MainLayout>,
      },
      {
        path: 'servicos',
        element: <MainLayout><Servicos /></MainLayout>,
      },
      {
        path: 'disponibilidades',
        element: <MainLayout><Disponibilidades /></MainLayout>,
      },
      {
        path: 'lgpd',
        element: <MainLayout><LGPD /></MainLayout>,
      },
      {
        path: 'ajuda',
        element: <MainLayout><Ajuda /></MainLayout>,
      },
      {
        path: 'meus-chamados',
        element: <MainLayout><MeusChamados /></MainLayout>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);