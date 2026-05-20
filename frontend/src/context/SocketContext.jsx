import * as React from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const SocketContext = React.createContext(null);

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    if (loading) return;
    const token = localStorage.getItem('worksure_token');
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }
    const base =
      import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin.replace(':5173', ':5000') : '');
    const s = io(base, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return React.useContext(SocketContext);
}
