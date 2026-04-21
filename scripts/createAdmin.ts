import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Determine if we are using an emulator or production.
// In development, the user might be using the Firebase Emulator.
const useEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (useEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = useEmulator;
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  }
}

console.log('🌱 Starting admin account creation process...');

// Initialize the Firebase Admin SDK
// This will automatically pick up GOOGLE_APPLICATION_CREDENTIALS if running against prod.
// Otherwise, it will try to use the emulator if FIREBASE_AUTH_EMULATOR_HOST is set.
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
  });
} catch (error) {
  if (!/already exists/.test((error as any).message)) {
    console.error('Firebase admin initialization error', error);
  }
}

const auth = admin.auth();
const db = admin.firestore();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@hotel.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

async function createAdmin() {
  let userRecord;
  try {
    // Check if the user already exists
    userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`ℹ️ Admin account (${adminEmail}) already exists. UID: ${userRecord.uid}`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // User doesn't exist, create them
      console.log(`📦 Creating admin account (${adminEmail})...`);
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'System Admin',
      });
      console.log(`✅ Created admin account. UID: ${userRecord.uid}`);
    } else {
      throw error;
    }
  }

  // Set the custom claim { admin: true }
  console.log(`⚙️ Setting admin custom claim for UID: ${userRecord.uid}...`);
  await auth.setCustomUserClaims(userRecord.uid, { admin: true });
  console.log(`✅ Custom claim set successfully.`);

  // Also ensure the user has a profile in Firestore (as per our app's data model)
  const userDocRef = db.collection('users').doc(userRecord.uid);
  const userDoc = await userDocRef.get();
  
  if (!userDoc.exists) {
    console.log(`📦 Creating Firestore profile for admin...`);
    await userDocRef.set({
      id: userRecord.uid,
      email: adminEmail,
      firstName: 'System',
      lastName: 'Admin',
      phoneNumber: '',
      role: 'admin',
      paymentMethods: [],
      savedRoomIds: [],
      notificationSettings: {
        push: { bookings: true, promos: true, account: true },
        email: { newsletters: false, billing: true }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Firestore profile created.`);
  } else {
    // Ensure role is admin in Firestore as well, just to be consistent
    await userDocRef.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`ℹ️ Firestore profile already exists. Updated role to admin.`);
  }

  console.log('✨ Admin account setup complete!');
}

createAdmin().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to create admin account:', error);
  process.exit(1);
});
