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
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types';
import { createConverter } from '../utils/firestoreConverter';

const REVIEW_COLLECTION = 'reviews';
const reviewConverter = createConverter<Review>();

export const reviewRepository = {
  /**
   * Fetches reviews for a specific room
   */
  getReviewsByRoom: async (roomId: string): Promise<Review[]> => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const q = query(
      reviewsRef, 
      where('roomId', '==', roomId), 
      where('isHidden', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches reviews by a specific user
   */
  getReviewsByUser: async (userId: string): Promise<Review[]> => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const q = query(
      reviewsRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches all reviews (admin only)
   */
  getAllReviews: async (): Promise<Review[]> => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  /**
   * Fetches a review by booking ID
   */
  getReviewByBooking: async (bookingId: string): Promise<Review | null> => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const q = query(reviewsRef, where('bookingId', '==', bookingId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
  },

  /**
   * Adds a new review
   */
  addReview: async (review: Omit<Review, 'id'>): Promise<string> => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const docRef = await addDoc(reviewsRef, { ...review, isHidden: false } as Review);
    return docRef.id;
  },

  /**
   * Updates an existing review
   */
  updateReview: async (reviewId: string, updates: Partial<Review>): Promise<void> => {
    const docRef = doc(db, REVIEW_COLLECTION, reviewId).withConverter(reviewConverter);
    await updateDoc(docRef, updates as any);
  },

  /**
   * Deletes a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    const docRef = doc(db, REVIEW_COLLECTION, reviewId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribes to all reviews (admin only)
   */
  subscribeToAllReviews: (callback: (reviews: Review[]) => void): Unsubscribe => {
    const reviewsRef = collection(db, REVIEW_COLLECTION).withConverter(reviewConverter);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }
};
