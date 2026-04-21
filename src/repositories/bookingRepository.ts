import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  Unsubscribe,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const BOOKING_COLLECTION = 'bookings';
const bookingConverter = createConverter<Booking>();

export const bookingRepository = {
  /**
   * Fetches a booking by ID
   */
  getBookingById: async (bookingId: string): Promise<Booking | null> => {
    const docRef = doc(db, BOOKING_COLLECTION, bookingId).withConverter(bookingConverter);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  /**
   * Fetches all bookings for a specific user
   */
  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    const q = query(
      bookingsRef, 
      where('userId', '==', userId), 
      orderBy('bookedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches all bookings (admin only)
   */
  getAllBookings: async (): Promise<Booking[]> => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    const q = query(bookingsRef, orderBy('bookedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Adds a new booking and returns the generated ID
   */
  addBooking: async (booking: Omit<Booking, 'id'>): Promise<string> => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    const docRef = await addDoc(bookingsRef, booking as Booking);
    return docRef.id;
  },

  /**
   * Updates an existing booking
   */
  updateBooking: async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
    const docRef = doc(db, BOOKING_COLLECTION, bookingId).withConverter(bookingConverter);
    await updateDoc(docRef, updates as any);
  },

  /**
   * Subscribes to real-time user bookings updates
   */
  subscribeToUserBookings: (userId: string, callback: (bookings: Booking[]) => void): Unsubscribe => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    const q = query(
      bookingsRef, 
      where('userId', '==', userId), 
      orderBy('bookedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  },

  /**
   * Subscribes to all bookings (admin only)
   */
  subscribeToAllBookings: (callback: (bookings: Booking[]) => void): Unsubscribe => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    const q = query(bookingsRef, orderBy('bookedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  },

  /**
   * Checks if a room is available for the given dates
   */
  checkRoomAvailability: async (
    roomId: string, 
    checkIn: string, 
    checkOut: string, 
    excludeId?: string
  ): Promise<boolean> => {
    const bookingsRef = collection(db, BOOKING_COLLECTION).withConverter(bookingConverter);
    // Query all non-cancelled bookings for this room
    const q = query(
      bookingsRef,
      where('room.id', '==', roomId),
      where('status', 'not-in', ['Cancelled'])
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => doc.data());
    
    const newIn = new Date(checkIn).getTime();
    const newOut = new Date(checkOut).getTime();
    
    // Check for overlap in-memory
    const hasOverlap = bookings.some(b => {
      if (excludeId && b.id === excludeId) return false;
      
      const bIn = new Date(b.checkInDate).getTime();
      const bOut = new Date(b.checkOutDate).getTime();
      
      // Overlap occurs if (StartA < EndB) and (EndA > StartB)
      return newIn < bOut && newOut > bIn;
    });
    
    return !hasOverlap;
  }
};
