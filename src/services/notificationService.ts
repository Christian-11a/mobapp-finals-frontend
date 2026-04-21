import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationRepository } from '../repositories/notificationRepository';
import { Notification, NotificationSettings, UserType } from '../types';

export const notificationService = {
  /**
   * Sends a notification to a specific user, respecting their preferences
   */
  sendNotification: async (
    userId: string, 
    title: string, 
    message: string, 
    type: Notification['type']
  ): Promise<void> => {
    try {
      // 1. Fetch user settings
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data() as UserType;
      const settings = userData.notificationSettings;
      
      // 2. Filter based on push preferences
      if (settings?.push) {
        if (type === 'booking' && !settings.push.bookings) return;
        if (type === 'promo' && !settings.push.promos) return;
        if (type === 'account' && !settings.push.account) return;
      }
      
      // 3. Write to Firestore
      const notification: Omit<Notification, 'id'> = {
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      await notificationRepository.addNotification(userId, notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  /**
   * Marks a specific notification as read
   */
  markAsRead: async (userId: string, notifId: string): Promise<void> => {
    await notificationRepository.markAsRead(userId, notifId);
  },

  /**
   * Marks all notifications for a user as read
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    await notificationRepository.markAllAsRead(userId);
  },

  /**
   * Subscribes to real-time notification updates
   */
  subscribeToNotifications: (userId: string, callback: (notifs: Notification[]) => void) => {
    return notificationRepository.subscribeToNotifications(userId, callback);
  }
};
