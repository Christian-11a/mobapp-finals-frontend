import React, { createContext, useContext, useState } from 'react';
import { Booking, Review } from '../types';

// Auto-compute Completed status: Confirmed + checkOutDate in the past
const withComputedStatus = (booking: Booking): Booking => {
  if (booking.status === 'Confirmed' && new Date(booking.checkOutDate) < new Date()) {
    return { ...booking, status: 'Completed' };
  }
  return booking;
};

interface BookingContextType {
  bookings: Booking[];
  reviews: Review[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, checkInDate: string, checkOutDate: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  addReview: (review: Review) => void;
  deleteReview: (reviewId: string) => void;
  approveBooking: (bookingId: string) => void;
  isRoomBooked: (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => boolean;
}

const BookingContext = createContext<BookingContextType>({
  bookings: [],
  reviews: [],
  addBooking: () => {},
  cancelBooking: () => {},
  approveBooking: () => {},
  rescheduleBooking: () => {},
  getBookingById: () => undefined,
  addReview: () => {},
  deleteReview: () => {},
  isRoomBooked: () => false,
});

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [rawBookings, setRawBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Expose bookings with auto-computed Completed status
  const bookings = rawBookings.map(withComputedStatus);

  const addBooking = (booking: Booking) =>
    setRawBookings(prev => [booking, ...prev]);

  const cancelBooking = (bookingId: string) =>
    setRawBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
    );

  const approveBooking = (bookingId: string) =>
    setRawBookings(prev =>
      prev.map(b => b.id === bookingId && b.status === 'Pending' ? { ...b, status: 'Confirmed' } : b)
    );

  const rescheduleBooking = (bookingId: string, checkInDate: string, checkOutDate: string) =>
    setRawBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, checkInDate, checkOutDate } : b)
    );

  const getBookingById = (id: string): Booking | undefined =>
    bookings.find(b => b.id === id);

  const addReview = (review: Review) =>
    setReviews(prev => [review, ...prev]);

  const deleteReview = (reviewId: string) =>
    setReviews(prev => prev.filter(r => r.id !== reviewId));

  // Conflict check across ALL users' bookings
  const isRoomBooked = (
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string,
  ): boolean =>
    rawBookings.some(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.room.id !== roomId) return false;
      if (b.status === 'Cancelled') return false;
      return (
        new Date(b.checkInDate) < new Date(checkOut) &&
        new Date(b.checkOutDate) > new Date(checkIn)
      );
    });

  return (
    <BookingContext.Provider
      value={{
        bookings,
        reviews,
        addBooking,
        cancelBooking,
        approveBooking,
        rescheduleBooking,
        getBookingById,
        addReview,
        deleteReview,
        isRoomBooked,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => useContext(BookingContext);
