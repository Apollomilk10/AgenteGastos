import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchOrcamentos,
  criarOrcamento as criarOrcamentoApi,
  entrarOrcamento as entrarOrcamentoApi,
  excluirOrcamento as excluirOrcamentoApi,
} from '../services/orcamentos';
import { useAuth } from './AuthContext';

const OrcamentosContext = createContext(null);

export function OrcamentosProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    setError('');
    try {
      const rows = await fetchOrcamentos();
      setOrcamentos(rows);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function criarOrcamento(nome) {
    const result = await criarOrcamentoApi(nome);
    await reload();
    return result;
  }

  async function entrarOrcamento(codigo) {
    const result = await entrarOrcamentoApi(codigo);
    await reload();
    return result;
  }

  async function excluirOrcamento(orcamentoId) {
    await excluirOrcamentoApi(orcamentoId);
    await reload();
  }

  const value = {
    orcamentos,
    loading,
    error,
    reload,
    criarOrcamento,
    entrarOrcamento,
    excluirOrcamento,
  };

  return <OrcamentosContext.Provider value={value}>{children}</OrcamentosContext.Provider>;
}

export function useOrcamentos() {
  const ctx = useContext(OrcamentosContext);
  if (!ctx) throw new Error('useOrcamentos precisa estar dentro de OrcamentosProvider');
  return ctx;
}
