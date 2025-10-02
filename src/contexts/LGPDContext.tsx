import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { lgpdApi } from '@/api/lgpd';
import { TermoUso, PoliticaPrivacidade, AceiteTermo, AceitePolitica } from '@/types/lgpd';

interface LGPDContextType {
  // Dados
  termoAtual: TermoUso | null;
  politicaAtual: PoliticaPrivacidade | null;
  aceitesTermos: AceiteTermo[];
  aceitesPoliticas: AceitePolitica[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Ações
  aceitarTermo: (request: { versao: string; aceito: boolean }) => Promise<void>;
  aceitarPolitica: (request: { versao: string; aceito: boolean }) => Promise<void>;
  verificarAceiteTermo: () => Promise<boolean>;
  verificarAceitePolitica: () => Promise<boolean>;
  verificarAceiteCompleto: () => Promise<boolean>;
  carregarDados: () => Promise<void>;
}

const LGPDContext = createContext<LGPDContextType | undefined>(undefined);

interface LGPDProviderProps {
  children: React.ReactNode;
}

export function LGPDProvider({ children }: LGPDProviderProps) {
  const [termoAtual, setTermoAtual] = useState<TermoUso | null>(null);
  const [politicaAtual, setPoliticaAtual] = useState<PoliticaPrivacidade | null>(null);
  const [aceitesTermos, setAceitesTermos] = useState<AceiteTermo[]>([]);
  const [aceitesPoliticas, setAceitesPoliticas] = useState<AceitePolitica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const hasLoaded = useRef(false);

  const carregarDados = async () => {
    if (hasLoaded.current || loading) return;
    
    try {
      setLoading(true);
      setError(null);

      const [termo, politica, aceitesTermosData, aceitesPoliticasData] = await Promise.all([
        lgpdApi.getTermoAtivo(),
        lgpdApi.getPoliticaAtiva(),
        lgpdApi.getMeusAceitesTermos(),
        lgpdApi.getMeusAceitesPoliticas()
      ]);

      setTermoAtual(termo);
      setPoliticaAtual(politica);
      setAceitesTermos(aceitesTermosData);
      setAceitesPoliticas(aceitesPoliticasData);
      setInitialized(true);
      hasLoaded.current = true;
    } catch (err) {
      console.error('Erro ao carregar dados LGPD:', err);
      setError('Erro ao carregar dados LGPD');
    } finally {
      setLoading(false);
    }
  };

  const aceitarTermo = async (request: { versao: string; aceito: boolean }) => {
    try {
      await lgpdApi.aceitarTermo(request);
      await carregarDados(); // Recarregar dados após aceite
    } catch (err) {
      console.error('Erro ao aceitar termo:', err);
      throw err;
    }
  };

  const aceitarPolitica = async (request: { versao: string; aceito: boolean }) => {
    try {
      await lgpdApi.aceitarPolitica(request);
      await carregarDados(); // Recarregar dados após aceite
    } catch (err) {
      console.error('Erro ao aceitar política:', err);
      throw err;
    }
  };

  const verificarAceiteTermo = async () => {
    try {
      const response = await lgpdApi.verificarAceiteTermo();
      return response.aceitou;
    } catch (err) {
      console.error('Erro ao verificar aceite do termo:', err);
      return false;
    }
  };

  const verificarAceitePolitica = async () => {
    try {
      const response = await lgpdApi.verificarAceitePolitica();
      return response.aceitou;
    } catch (err) {
      console.error('Erro ao verificar aceite da política:', err);
      return false;
    }
  };

  // Verificar se ambos os documentos foram aceitos
  const verificarAceiteCompleto = async () => {
    try {
      // Se já temos os dados carregados, verificar localmente primeiro
      if (termoAtual && politicaAtual && aceitesTermos.length > 0 && aceitesPoliticas.length > 0) {
        const termoAceito = aceitesTermos.some(aceite => 
          aceite.versao === termoAtual.versao && aceite.aceito
        );
        const politicaAceita = aceitesPoliticas.some(aceite => 
          aceite.versao === politicaAtual.versao && aceite.aceito
        );
        
        return termoAceito && politicaAceita;
      }

      // Se não temos dados locais, fazer verificação via API
      const [termoAceito, politicaAceita] = await Promise.all([
        verificarAceiteTermo(),
        verificarAceitePolitica()
      ]);
      
      return termoAceito && politicaAceita;
    } catch (err) {
      console.error('Erro ao verificar aceite completo:', err);
      return false;
    }
  };

  // Remover carregamento automático - dados serão carregados apenas quando necessário
  // useEffect(() => {
  //   carregarDados();
  // }, []);

  const value: LGPDContextType = {
    // Dados
    termoAtual,
    politicaAtual,
    aceitesTermos,
    aceitesPoliticas,
    loading,
    error,
    initialized,

    // Ações
    aceitarTermo,
    aceitarPolitica,
    verificarAceiteTermo,
    verificarAceitePolitica,
    verificarAceiteCompleto,
    carregarDados
  };

  return (
    <LGPDContext.Provider value={value}>
      {children}
    </LGPDContext.Provider>
  );
}

export function useLGPD() {
  const context = useContext(LGPDContext);
  if (context === undefined) {
    throw new Error('useLGPD deve ser usado dentro de um LGPDProvider');
  }
  return context;
}