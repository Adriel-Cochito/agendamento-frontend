import { LGPDGuard } from './LGPDGuard';
import { LGPDConsentBanner } from './LGPDConsentBanner';

/**
 * Exemplo de como integrar o sistema LGPD na aplicação
 * 
 * 1. Envolva sua aplicação principal com LGPDGuard
 * 2. Adicione o LGPDConsentBanner onde apropriado
 * 3. O sistema verificará automaticamente os aceites
 */

interface AppProps {
  children: React.ReactNode;
}

export function AppWithLGPD({ children }: AppProps) {
  return (
    <LGPDGuard>
      <div className="min-h-screen">
        {children}
        <LGPDConsentBanner />
      </div>
    </LGPDGuard>
  );
}

/**
 * Exemplo de uso em rotas protegidas:
 * 
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <LGPDGuard>
 *       <Dashboard />
 *     </LGPDGuard>
 *   </ProtectedRoute>
 * } />
 * 
 * Exemplo de uso em layout principal:
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <AppWithLGPD>
 *         <Routes>
 *           <Route path="/" element={<Home />} />
 *           <Route path="/lgpd" element={<LGPD />} />
 *           <Route path="/dashboard" element={<Dashboard />} />
 *         </Routes>
 *       </AppWithLGPD>
 *     </Router>
 *   );
 * }
 */
