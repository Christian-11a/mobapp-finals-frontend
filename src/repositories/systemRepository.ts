import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SystemConfig } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const SYSTEM_COLLECTION = 'systemConfig';
const SYSTEM_DOC_ID = 'main';
const systemConverter = createConverter<SystemConfig>();

export const systemRepository = {
  /**
   * Fetches the hotel system configuration
   */
  getSystemConfig: async (): Promise<SystemConfig | null> => {
    const docRef = doc(db, SYSTEM_COLLECTION, SYSTEM_DOC_ID).withConverter(systemConverter);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  /**
   * Updates the hotel system configuration
   */
  updateSystemConfig: async (updates: Partial<SystemConfig>): Promise<void> => {
    const docRef = doc(db, SYSTEM_COLLECTION, SYSTEM_DOC_ID).withConverter(systemConverter);
    // Use setDoc with merge: true for the system config singleton
    await setDoc(docRef, updates as SystemConfig, { merge: true });
  },

  /**
   * Subscribes to real-time configuration updates
   */
  subscribeToSystemConfig: (callback: (config: SystemConfig) => void): Unsubscribe => {
    const docRef = doc(db, SYSTEM_COLLECTION, SYSTEM_DOC_ID).withConverter(systemConverter);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }
};
