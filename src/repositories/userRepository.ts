import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserType } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const USER_COLLECTION = 'users';

const userConverter = createConverter<UserType>();

export const userRepository = {
  /**
   * Fetches a user profile by UID
   */
  getUser: async (uid: string): Promise<UserType | null> => {
    const userDocRef = doc(db, USER_COLLECTION, uid).withConverter(userConverter);
    const userSnap = await getDoc(userDocRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  /**
   * Creates a new user profile document
   */
  createUser: async (uid: string, data: UserType): Promise<void> => {
    const userDocRef = doc(db, USER_COLLECTION, uid).withConverter(userConverter);
    await setDoc(userDocRef, data);
  },

  /**
   * Updates an existing user profile document
   */
  updateUser: async (uid: string, updates: Partial<UserType>): Promise<void> => {
    const userDocRef = doc(db, USER_COLLECTION, uid).withConverter(userConverter);
    await updateDoc(userDocRef, updates as any);
  },

  /**
   * Deletes a user profile document
   */
  deleteUser: async (uid: string): Promise<void> => {
    const userDocRef = doc(db, USER_COLLECTION, uid);
    await deleteDoc(userDocRef);
  }
};
