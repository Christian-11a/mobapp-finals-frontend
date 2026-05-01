import React, { createContext, useContext, useMemo } from 'react';
import { Notification, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';
import { useNotifications as useNotificationsHook } from '../hooks/useNotifications';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (title: string, message: string, type: Notification['type']) => Promise<void>;
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  push: { bookings: true, promos: true, account: true },
  email: { newsletters: false, billing: true }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading } = useNotificationsHook();

  const settings = user?.notificationSettings || DEFAULT_SETTINGS;

  const markAsRead = async (id: string) => {
    if (!user) return;
    await notificationService.markAsRead(user.id, id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
  };

  const addNotification = async (title: string, message: string, type: Notification['type']) => {
    if (!user) return;
    await notificationService.sendNotification(user.id, title, message, type);
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return;
    const newSettings = { 
      push: { ...settings.push, ...(updates.push || {}) },
      email: { ...settings.email, ...(updates.email || {}) }
    };
    await userService.updateNotificationSettings(user.id, newSettings);
  };

  const contextValue = useMemo(() => ({ 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead, 
    markAllAsRead, 
    addNotification, 
    settings, 
    updateSettings 
  }), [notifications, unreadCount, isLoading, settings, user?.id]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
