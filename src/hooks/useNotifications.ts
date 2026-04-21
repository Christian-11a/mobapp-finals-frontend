import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribe: () => void;

    try {
      unsubscribe = notificationService.subscribeToNotifications(user.id, (data) => {
        setNotifications(data);
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { 
    notifications, 
    unreadCount, 
    isLoading, 
    error 
  };
};
