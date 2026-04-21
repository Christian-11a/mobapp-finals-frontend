import { Booking } from '../types';

/**
 * Auto-computes the 'Completed' status for a booking.
 * A booking is considered 'Completed' if it was 'Confirmed' and the check-out date is in the past.
 */
export const withComputedStatus = (booking: Booking): Booking => {
  if (booking.status === 'Confirmed' && new Date(booking.checkOutDate) < new Date()) {
    return { ...booking, status: 'Completed' };
  }
  return booking;
};
