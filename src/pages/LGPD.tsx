import { Card } from '@/components/ui/Card';
import { Shield, FileText } from 'lucide-react';

export function LGPD() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LGPD - Lei Geral de Proteção de Dados
          </h1>
          <p className="text-gray-600">
            Funcionalidades LGPD temporariamente desabilitadas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Termos de Uso
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Os termos de uso estão temporariamente indisponíveis.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Esta funcionalidade será reativada em breve.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Política de Privacidade
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              A política de privacidade está temporariamente indisponível.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Esta funcionalidade será reativada em breve.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}