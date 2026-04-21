import { Timestamp } from 'firebase/firestore';

export interface UserDocument {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'guest' | 'admin';
  avatarUrl?: string;
  savedRoomIds: string[];
  paymentMethods: any[];
  notificationSettings: any;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoomDocument {
  name: string;
  description: string;
  pricePerNight: number;
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  type: string;
  capacity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Add other document shapes as needed
