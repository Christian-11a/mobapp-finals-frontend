import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  Unsubscribe,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const notificationConverter = createConverter<Notification>();

const getNotifsRef = (userId: string) => 
  collection(db, 'users', userId, 'notifications').withConverter(notificationConverter);

export const notificationRepository = {
  /**
   * Fetches all notifications for a user
   */
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    const q = query(getNotifsRef(userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * Adds a notification to a user's subcollection.
   * Uses setDoc with a generated ID to ensure idempotency on retries.
   */
  addNotification: async (userId: string, notification: Omit<Notification, 'id'>): Promise<string> => {
    const colRef = getNotifsRef(userId);
    const docRef = doc(colRef); // Generates a new ID locally
    await setDoc(docRef, notification as Notification);
    return docRef.id;
  },

  /**
   * Marks a notification as read
   */
  markAsRead: async (userId: string, notifId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, 'notifications', notifId).withConverter(notificationConverter);
    await updateDoc(docRef, { isRead: true } as any);
  },

  /**
   * Marks all notifications as read for a user
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    const q = query(getNotifsRef(userId));
    const snap = await getDocs(q);
    
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      if (!d.data().isRead) {
        batch.update(d.ref, { isRead: true });
      }
    });
    
    await batch.commit();
  },

  /**
   * Subscribes to real-time notification updates
   */
  subscribeToNotifications: (userId: string, callback: (notifs: Notification[]) => void): Unsubscribe => {
    const q = query(getNotifsRef(userId), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }
};
