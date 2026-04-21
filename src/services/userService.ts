import { doc, updateDoc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { db, storage } from '../config/firebase';
import { UserType, PaymentMethod, NotificationSettings } from '../types';

export const userService = {
  /**
   * Updates a user's basic profile information
   */
  updateProfile: async (uid: string, updates: Partial<UserType>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Updates a user's notification preferences
   */
  updateNotificationSettings: async (uid: string, settings: NotificationSettings): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { notificationSettings: settings });
  },

  /**
   * Adds a room to the user's wishlist
   */
  saveRoom: async (uid: string, roomId: string): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      savedRoomIds: arrayUnion(roomId)
    });
  },

  /**
   * Removes a room from the user's wishlist
   */
  unsaveRoom: async (uid: string, roomId: string): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      savedRoomIds: arrayRemove(roomId)
    });
  },

  /**
   * Clears the user's entire wishlist
   */
  clearWishlist: async (uid: string): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { savedRoomIds: [] });
  },

  /**
   * Links a new payment method to the user's account
   */
  addPaymentMethod: async (uid: string, method: PaymentMethod): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      paymentMethods: arrayUnion(method)
    });
  },

  /**
   * Removes a linked payment method
   */
  removePaymentMethod: async (uid: string, method: PaymentMethod): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      paymentMethods: arrayRemove(method)
    });
  },

  /**
   * Sets a specific payment method as default using a transaction
   */
  setDefaultPaymentMethod: async (uid: string, methodId: string): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error('User does not exist');
      
      const userData = userDoc.data() as UserType;
      const methods = userData.paymentMethods || [];
      
      const updatedMethods = methods.map(m => ({
        ...m,
        isDefault: m.id === methodId
      }));
      
      transaction.update(userRef, { paymentMethods: updatedMethods });
    });
  },

  /**
   * Uploads and compresses a profile avatar
   */
  uploadAvatar: async (uid: string, localUri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const storageRef = ref(storage, `avatars/${uid}.jpg`);
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload profile picture.');
    }
  }
};
