import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  initializeAuth, 
  // @ts-ignore - getReactNativePersistence is available in the React Native entry point of the firebase package
  getReactNativePersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache,
  memoryLocalCache
} from 'firebase/firestore';
import { Platform } from 'react-native';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // 1. Initialize Auth with Persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage as any)
  });

  // 2. Initialize Firestore with platform-specific cache
  db = initializeFirestore(app, {
    localCache: Platform.OS === 'web' 
      ? persistentLocalCache({}) 
      : memoryLocalCache()
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

storage = getStorage(app);

// Messaging is typically web/native specific
if (Platform.OS === 'web') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging initialization failed:', error);
  }
}

export { app, auth, db, storage, messaging };
