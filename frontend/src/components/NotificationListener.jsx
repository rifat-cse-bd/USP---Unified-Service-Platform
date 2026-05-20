import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';

export function NotificationListener() {
  const socket = useSocket();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!socket || !user) return;

    const onNotification = (payload) => {
      toast({
        title: payload.title || 'Notification',
        description: payload.body || '',
      });
    };

    const onBookingUpdate = (booking) => {
      toast({
        title: 'Booking updated',
        description: `Booking #${booking?.id} is now ${booking?.status}`,
      });
    };

    socket.on('notification', onNotification);
    socket.on('booking:update', onBookingUpdate);

    return () => {
      socket.off('notification', onNotification);
      socket.off('booking:update', onBookingUpdate);
    };
  }, [socket, user, toast, navigate]);

  return null;
}
