import { notificationService } from './notificationService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  User as FirebaseUser,
  Unsubscribe
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserType } from '../types';
import { VALIDATION } from '../constants';

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

const mapAuthError = (error: any): AuthError => {
  const code = error.code || 'unknown';
  let message = error.message || 'An unexpected error occurred.';

  switch (code) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      message = VALIDATION.INVALID_CREDENTIALS;
      break;
    case 'auth/email-already-in-use':
      message = VALIDATION.EMAIL_ALREADY_IN_USE;
      break;
    case 'auth/weak-password':
      message = VALIDATION.WEAK_PASSWORD;
      break;
    case 'auth/too-many-requests':
      message = VALIDATION.TOO_MANY_REQUESTS;
      break;
    case 'auth/network-request-failed':
      message = VALIDATION.NETWORK_ERROR;
      break;
  }

  return new AuthError(code, message);
};

export const authService = {
  login: async (email: string, password: string): Promise<UserType> => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      return await fetchUserProfile(firebaseUser);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  register: async (firstName: string, lastName: string, email: string, password: string, phoneNumber?: string): Promise<UserType> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: Omit<UserType, 'role'> = {
        id: firebaseUser.uid,
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || '',
        paymentMethods: [],
        savedRoomIds: [],
        notificationSettings: {
          push: { bookings: true, promos: true, account: true },
          email: { newsletters: false, billing: true }
        }
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send welcome notification
      await notificationService.sendNotification(
        firebaseUser.uid,
        'Welcome to LuxeStay!',
        'Thank you for choosing us for your premium stay. Explore our rooms and start booking today.',
        'promo'
      );

      // Return with guest role as default after registration
      return { ...userData, role: 'guest' } as UserType;
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new AuthError('no-user', VALIDATION.REAUTHENTICATION_REQUIRED);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
    } catch (error) {
      if (error instanceof Error && (error as any).code === 'auth/wrong-password') {
        throw new AuthError('auth/wrong-password', VALIDATION.WRONG_CURRENT_PASSWORD);
      }
      throw mapAuthError(error);
    }
  },

  deleteAccount: async (password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new AuthError('no-user', VALIDATION.REAUTHENTICATION_REQUIRED);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  reauthenticate: async (password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new AuthError('no-user', VALIDATION.REAUTHENTICATION_REQUIRED);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      if (error instanceof Error && (error as any).code === 'auth/wrong-password') {
        throw new AuthError('auth/wrong-password', VALIDATION.WRONG_CURRENT_PASSWORD);
      }
      throw mapAuthError(error);
    }
  },

  onAuthStateChange: (callback: (user: UserType | null) => void): Unsubscribe => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // In Phase 9, custom claims are READ by AuthContext, not stored in Firestore profile
          const profile = await fetchUserProfile(firebaseUser);
          callback(profile);
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};

async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<UserType> {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) {
    throw new AuthError('no-profile', 'User profile not found.');
  }
  return userDoc.data() as UserType;
}
