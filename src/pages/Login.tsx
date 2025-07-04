import { motion } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';

export function Login() {
  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Logo and Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-4">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </motion.div>

        {/* Login Card */}
        <Card className="backdrop-blur-md bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-xs text-gray-600">Agendamento Fácil</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg">
              <Users className="w-6 h-6 text-secondary-600" />
            </div>
            <p className="text-xs text-gray-600">Gestão de Clientes</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Economia de Tempo</p>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}