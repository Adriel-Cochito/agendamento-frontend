import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Home } from '@/pages/Home';
import { Profissionais } from '@/pages/Profissionais';
import { Servicos } from '@/pages/Servicos';
import { Disponibilidades } from '@/pages/Disponibilidades';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/cadastro',
    element: <Signup />,
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);