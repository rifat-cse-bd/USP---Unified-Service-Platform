import * as React from 'react';
import api from '@/services/api';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [worker, setWorker] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const token = localStorage.getItem('worksure_token');
    if (!token) {
      setUser(null);
      setWorker(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setWorker(data.worker || null);
    } catch {
      localStorage.removeItem('worksure_token');
      setUser(null);
      setWorker(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('worksure_token', data.token);
    await refresh();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('worksure_token', data.token);
    await refresh();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('worksure_token');
    setUser(null);
    setWorker(null);
  };

  const value = React.useMemo(
    () => ({ user, worker, loading, login, register, logout, refresh }),
    [user, worker, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
