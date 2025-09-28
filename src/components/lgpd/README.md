# Sistema LGPD - Guia de Uso

## Visão Geral

O sistema LGPD foi completamente refeito para atender aos requisitos de proteção de dados. Ele inclui:

- **Documentos Estáticos**: Termos de Uso e Política de Privacidade em arquivos Markdown
- **Sistema de Aceites**: Integração completa com API para registrar aceites no banco
- **Verificação Automática**: Verifica se o usuário aceitou os documentos necessários
- **Modal Obrigatório**: Força o aceite antes de permitir uso da plataforma

## Componentes Principais

### 1. LGPDGuard
Componente que verifica automaticamente se o usuário aceitou os documentos necessários.

```tsx
import { LGPDGuard } from '@/components/lgpd/LGPDGuard';

function App() {
  return (
    <LGPDGuard>
      <YourAppContent />
    </LGPDGuard>
  );
}
```

### 2. ForcedAcceptanceModal
Modal que aparece quando o usuário não aceitou os documentos obrigatórios.

```tsx
import { ForcedAcceptanceModal } from '@/components/lgpd/ForcedAcceptanceModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <ForcedAcceptanceModal 
      isOpen={showModal} 
      onComplete={() => setShowModal(false)} 
    />
  );
}
```

### 3. LGPDConsentBanner
Banner que aparece na parte inferior da tela para lembrar sobre aceites pendentes.

```tsx
import { LGPDConsentBanner } from '@/components/lgpd/LGPDConsentBanner';

function Layout() {
  return (
    <div>
      <YourContent />
      <LGPDConsentBanner />
    </div>
  );
}
```

### 4. Página LGPD
Página completa para gerenciar aceites e visualizar documentos.

```tsx
import { LGPD } from '@/pages/LGPD';

// Rota: /lgpd
<Route path="/lgpd" element={<LGPD />} />
```

## Hook useLGPD

Hook principal para gerenciar dados e ações LGPD:

```tsx
import { useLGPD } from '@/hooks/useLGPD';

function MyComponent() {
  const {
    termoAtual,
    politicaAtual,
    aceitesTermos,
    aceitesPoliticas,
    loading,
    error,
    aceitarTermo,
    aceitarPolitica,
    verificarAceiteTermo,
    verificarAceitePolitica,
    verificarAceiteCompleto
  } = useLGPD();

  // Usar os dados e funções...
}
```

## Integração com API

### Endpoints Disponíveis

- `POST /api/lgpd/termos/aceitar?versao=1.0&aceito=true`
- `GET /api/lgpd/termos/meus-aceites`
- `GET /api/lgpd/termos/verificar-aceite`
- `POST /api/lgpd/politicas/aceitar?versao=1.0&aceito=true`
- `GET /api/lgpd/politicas/meus-aceites`
- `GET /api/lgpd/politicas/verificar-aceite`

### Estrutura de Dados

```typescript
interface TermoUso {
  versao: string;
  titulo: string;
  conteudo: string;
  dataAtualizacao: string;
}

interface AceiteTermo {
  id: number;
  termoId: number;
  versao: string;
  titulo: string;
  aceito: boolean;
  dataAceite: string;
  versaoAceita?: string;
  ipAddress?: string;
  userAgent?: string;
  dataCriacao: string;
}
```

## Fluxo de Aceite

1. **Verificação**: Sistema verifica se usuário aceitou documentos
2. **Modal**: Se não aceitou, mostra modal obrigatório
3. **Aceite**: Usuário aceita ou rejeita documentos
4. **Registro**: Aceite é registrado no banco via API
5. **Acesso**: Usuário pode acessar a plataforma

## Documentos Estáticos

Os documentos estão em:
- `src/assets/lgpd/termos-uso-v1.0.md`
- `src/assets/lgpd/politica-privacidade-v1.0.md`

### Atualizando Documentos

1. Edite o arquivo Markdown
2. Atualize a versão no arquivo
3. Atualize a data de atualização
4. O sistema detectará automaticamente as mudanças

## Configuração para Todos os Profissionais

Para aplicar o sistema a todos os profissionais:

1. **Envolva a aplicação principal**:
```tsx
function App() {
  return (
    <LGPDGuard>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </LGPDGuard>
  );
}
```

2. **Adicione o banner**:
```tsx
function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <LGPDConsentBanner />
    </div>
  );
}
```

## Testando o Sistema

1. **Limpe o banco** de aceites para testar
2. **Faça login** como qualquer profissional
3. **Modal deve aparecer** automaticamente
4. **Teste aceite e rejeição**
5. **Verifique** se os dados são salvos no banco

## Troubleshooting

### Modal não aparece
- Verifique se LGPDGuard está envolvendo a aplicação
- Verifique se a API está funcionando
- Verifique logs do console

### Aceite não é salvo
- Verifique se a API está respondendo
- Verifique se o usuário está autenticado
- Verifique logs do backend

### Documentos não carregam
- Verifique se os arquivos Markdown existem
- Verifique se as rotas estão configuradas
- Verifique se o utilitário está funcionando
