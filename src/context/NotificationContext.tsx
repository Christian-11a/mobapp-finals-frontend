import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  push: { bookings: true, promos: true, account: true },
  email: { newsletters: false, billing: true }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n_001',
      title: 'Welcome to LuxeStay!',
      message: 'Thank you for choosing us for your premium stay. Explore our rooms and start booking today.',
      type: 'promo',
      createdAt: new Date().toISOString(),
      isRead: false
    }
  ]);

  const settings = user?.notificationSettings || DEFAULT_SETTINGS;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    updateUser({ notificationSettings: newSettings });
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, unreadCount, markAsRead, markAllAsRead, addNotification, settings, updateSettings 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
