import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Room } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const ROOM_COLLECTION = 'rooms';
const roomConverter = createConverter<Room>();

export const roomRepository = {
  /**
   * Fetches all rooms sorted by name
   */
  getAllRooms: async (): Promise<Room[]> => {
    const roomsRef = collection(db, ROOM_COLLECTION).withConverter(roomConverter);
    const q = query(roomsRef, orderBy('title', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches a room by ID
   */
  getRoomById: async (roomId: string): Promise<Room | null> => {
    const roomDocRef = doc(db, ROOM_COLLECTION, roomId).withConverter(roomConverter);
    const roomSnap = await getDoc(roomDocRef);
    return roomSnap.exists() ? roomSnap.data() : null;
  },

  /**
   * Adds a new room and returns the generated ID
   */
  addRoom: async (room: Omit<Room, 'id'>): Promise<string> => {
    const roomsRef = collection(db, ROOM_COLLECTION).withConverter(roomConverter);
    const docRef = await addDoc(roomsRef, room as Room);
    return docRef.id;
  },

  /**
   * Updates an existing room
   */
  updateRoom: async (roomId: string, updates: Partial<Room>): Promise<void> => {
    const roomDocRef = doc(db, ROOM_COLLECTION, roomId).withConverter(roomConverter);
    await updateDoc(roomDocRef, updates as any);
  },

  /**
   * Deletes a room
   */
  deleteRoom: async (roomId: string): Promise<void> => {
    const roomDocRef = doc(db, ROOM_COLLECTION, roomId);
    await deleteDoc(roomDocRef);
  },

  /**
   * Subscribes to real-time room updates
   */
  subscribeToRooms: (callback: (rooms: Room[]) => void): Unsubscribe => {
    const roomsRef = collection(db, ROOM_COLLECTION).withConverter(roomConverter);
    const q = query(roomsRef, orderBy('title', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => doc.data());
      callback(rooms);
    });
  }
};
