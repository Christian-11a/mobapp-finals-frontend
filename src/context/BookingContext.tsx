import React, { createContext, useContext, useMemo } from 'react';
import { Booking, Review } from '../types';
import { useBookings as useBookingsHook } from '../hooks/useBookings';
import { useReviews as useReviewsHook } from '../hooks/useReviews';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { bookingRepository } from '../repositories/bookingRepository';
import { useAuth } from './AuthContext';

interface BookingContextType {
  bookings: Booking[];
  reviews: Review[];
  isLoading: boolean;
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'bookedAt'>) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  editBooking: (bookingId: string, checkInDate: string, checkOutDate: string, totalGuests: number, totalPrice: number) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'isHidden'>) => Promise<string>;
  deleteReview: (reviewId: string) => Promise<void>;
  toggleReviewVisibility: (reviewId: string, isHidden: boolean, reason?: Review['hiddenReason']) => Promise<void>;
  addReviewReply: (reviewId: string, reply: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  isRoomBooked: (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType>({
  bookings: [],
  reviews: [],
  isLoading: true,
  addBooking: async () => '',
  cancelBooking: async () => {},
  approveBooking: async () => {},
  updateBookingStatus: async () => {},
  editBooking: async () => {},
  getBookingById: () => undefined,
  addReview: async () => '',
  deleteReview: async () => {},
  toggleReviewVisibility: async () => {},
  addReviewReply: async () => {},
  isRoomBooked: async () => false,
});

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { bookings, isLoading: bookingsLoading } = useBookingsHook();
  const { reviews, isLoading: reviewsLoading } = useReviewsHook();

  const isLoading = bookingsLoading || reviewsLoading;

  const addBooking = async (booking: Omit<Booking, 'id' | 'status' | 'bookedAt'>) => {
    return await bookingService.createBooking(booking);
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user) return;
    await bookingService.cancelBooking(bookingId, user.id);
  };

  const approveBooking = async (bookingId: string) => {
    await bookingService.approveBooking(bookingId);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    await bookingService.updateBookingStatus(bookingId, status);
  };

  const editBooking = async (bookingId: string, checkInDate: string, checkOutDate: string, totalGuests: number, totalPrice: number) => {
    if (!user) return;
    await bookingService.editBooking(
      bookingId, 
      user.id, 
      { checkIn: checkInDate, checkOut: checkOutDate }, 
      totalGuests, 
      totalPrice
    );
  };

  const getBookingById = (id: string): Booking | undefined =>
    bookings.find(b => b.id === id);

  const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'isHidden'>) => {
    return await reviewService.submitReview(review);
  };

  const deleteReview = async (reviewId: string) => {
    await reviewService.deleteReview(reviewId);
  };

  const toggleReviewVisibility = async (reviewId: string, isHidden: boolean, reason?: Review['hiddenReason']) => {
    await reviewService.toggleReviewVisibility(reviewId, isHidden, reason);
  };

  const addReviewReply = async (reviewId: string, reply: string) => {
    await reviewService.addAdminReply(reviewId, reply);
  };

  const isRoomBooked = async (
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string,
  ): Promise<boolean> => {
    return !(await bookingRepository.checkRoomAvailability(roomId, checkIn, checkOut, excludeBookingId));
  };

  const contextValue = useMemo(() => ({
    bookings,
    reviews,
    isLoading,
    addBooking,
    cancelBooking,
    approveBooking,
    updateBookingStatus,
    editBooking,
    getBookingById,
    addReview,
    deleteReview,
    toggleReviewVisibility,
    addReviewReply,
    isRoomBooked,
  }), [bookings, reviews, isLoading, user]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => useContext(BookingContext);
