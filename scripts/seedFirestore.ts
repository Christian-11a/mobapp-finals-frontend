import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PLACEHOLDER_ROOMS = [
  {
    id: '1',
    title: 'Deluxe Ocean Suite',
    description: 'Breathtaking ocean views from your private balcony. Features a king-size bed, marble bathroom, and all modern amenities for the ultimate luxury stay.',
    type: 'Suite',
    pricePerNight: 350,
    maxPeople: 2,
    amenities: ['Free WiFi', 'TV', 'Breakfast', 'Balcony', 'Parking'],
    thumbnailPic: { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
    photos: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' }],
    isAvailable: true,
    averageRating: 4.9,
    reviewCount: 128,
    isTopRated: true,
  },
  {
    id: '2',
    title: 'Classic Double Room',
    description: 'A cozy and elegant double room perfect for couples or business travelers. Equipped with premium bedding, smart TV, and a work desk.',
    type: 'Double',
    pricePerNight: 180,
    maxPeople: 2,
    amenities: ['Free WiFi', 'TV', 'Coffee Maker', 'Parking'],
    thumbnailPic: { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' },
    photos: [{ url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' }],
    isAvailable: true,
    averageRating: 4.5,
    reviewCount: 84,
    isTopRated: false,
  },
  {
    id: '3',
    title: 'Family Suite',
    description: 'Spacious family suite with two bedrooms, a living area, and a kitchenette. The ideal choice for families wanting space and comfort.',
    type: 'Family',
    pricePerNight: 420,
    maxPeople: 4,
    amenities: ['Free WiFi', 'TV', 'Kitchen', 'Breakfast', 'Gym', 'Parking'],
    thumbnailPic: { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800' },
    photos: [{ url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800' }],
    isAvailable: true,
    averageRating: 4.7,
    reviewCount: 62,
    isTopRated: true,
  },
  {
    id: '4',
    title: 'Standard Single Room',
    description: 'A clean and comfortable single room with all the essentials. Great value for solo travelers on business or leisure.',
    type: 'Single',
    pricePerNight: 95,
    maxPeople: 1,
    amenities: ['Free WiFi', 'TV'],
    thumbnailPic: { url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800' },
    photos: [{ url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800' }],
    isAvailable: true,
    averageRating: 4.2,
    reviewCount: 210,
    isTopRated: false,
  },
  {
    id: '5',
    title: 'Executive Penthouse',
    description: 'The crown jewel of LuxeStay. A full-floor penthouse with panoramic city views, private terrace, and butler service.',
    type: 'Exclusive',
    pricePerNight: 900,
    maxPeople: 4,
    amenities: ['Free WiFi', 'TV', 'Breakfast', 'Gym', 'Pool', 'Parking', 'Balcony'],
    thumbnailPic: { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' },
    photos: [{ url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' }],
    isAvailable: false,
    averageRating: 5.0,
    reviewCount: 31,
    isTopRated: true,
  },
];

const DEFAULT_CONFIG = {
  hotelName: 'LuxeStay',
  currency: 'USD',
  taxRate: 12,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  autoConfirmBookings: true,
};

async function seed() {
  console.log('🌱 Starting seeding process...');
  
  // Seed Rooms
  console.log('📦 Seeding rooms...');
  for (const room of PLACEHOLDER_ROOMS) {
    const { id, ...roomData } = room;
    await setDoc(doc(db, 'rooms', id), {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`  ✅ Seeded room: ${room.title}`);
  }

  // Seed System Config
  console.log('⚙️ Seeding system configuration...');
  const systemConfigRef = doc(db, 'systemConfig', 'main');
  const systemConfigSnap = await getDoc(systemConfigRef);
  
  if (!systemConfigSnap.exists()) {
    await setDoc(systemConfigRef, {
      ...DEFAULT_CONFIG,
      updatedAt: serverTimestamp()
    });
    console.log('  ✅ Seeded systemConfig/main (initial)');
  } else {
    // Optionally use merge: true here if you want to ensure DEFAULT_CONFIG fields exist
    // but the prompt says "creates ... if it doesn't exist" and "re-running the seed doesn't overwrite admin changes"
    // So skipping if exists is the safest way to NOT overwrite admin changes.
    console.log('  ℹ️ systemConfig/main already exists, skipping seed.');
  }

  console.log('✨ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
