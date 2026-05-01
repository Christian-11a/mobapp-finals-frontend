import { bookingRepository } from '../repositories/bookingRepository';
import { systemRepository } from '../repositories/systemRepository';
import { notificationService } from './notificationService';
import { Booking } from '../types';

export class DomainError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = 'DomainError';
  }
}

export const bookingService = {
  /**
   * Creates a new booking after checking room availability.
   */
  createBooking: async (params: Omit<Booking, 'id' | 'status' | 'bookedAt'>): Promise<string> => {
    // 1. Check availability
    const isAvailable = await bookingRepository.checkRoomAvailability(
      params.room.id,
      params.checkInDate,
      params.checkOutDate
    );

    if (!isAvailable) {
      throw new DomainError('DOUBLE_BOOKING');
    }

    // 2. Determine initial status based on system config
    const systemConfig = await systemRepository.getSystemConfig();
    const status: Booking['status'] = systemConfig?.autoConfirmBookings ? 'Confirmed' : 'Pending';

    // 3. Prepare booking data
    const bookingData: Omit<Booking, 'id'> = {
      ...params,
      status,
      bookedAt: new Date().toISOString(),
    };

    // 4. Save to Firestore
    const bookingId = await bookingRepository.addBooking(bookingData);

    // 5. Trigger notification (Note: notificationService is a stub in Phase 4)
    try {
      // @ts-ignore - notificationService is a stub
      if (typeof notificationService.sendNotification === 'function') {
        // @ts-ignore
        await notificationService.sendNotification(
          params.userId,
          'Booking Created',
          `Your booking for ${params.room.title} is now ${status.toLowerCase()}.`,
          'booking'
        );
      }
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }

    return bookingId;
  },

  /**
   * Cancels a booking and calculates cancellation fees.
   * < 1 day  → 100% of totalPrice
   * < 3 days → 50%  of totalPrice
   * otherwise → 0
   */
  cancelBooking: async (bookingId: string, userId: string): Promise<void> => {
    const booking = await bookingRepository.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== userId) throw new Error('Unauthorized');

    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const diffInMs = checkInDate.getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    let cancellationFee = 0;
    if (diffInDays < 1) {
      cancellationFee = booking.totalPrice;
    } else if (diffInDays < 3) {
      cancellationFee = booking.totalPrice * 0.5;
    }

    await bookingRepository.updateBooking(bookingId, {
      status: 'Cancelled',
      cancellationFee,
    });

    // Trigger notification
    try {
      // @ts-ignore
      if (typeof notificationService.sendNotification === 'function') {
        // @ts-ignore
        await notificationService.sendNotification(
          userId,
          'Booking Cancelled',
          `Your booking for ${booking.room.title} has been cancelled.`,
          'booking'
        );
      }
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }
  },

  /**
   * Edits an existing booking's dates and guests.
   */
  editBooking: async (
    bookingId: string,
    userId: string,
    newDates: { checkIn: string; checkOut: string },
    newGuests: number,
    newPrice: number
  ): Promise<void> => {
    const booking = await bookingRepository.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== userId) throw new Error('Unauthorized');

    // Check availability for new dates, excluding this booking
    const isAvailable = await bookingRepository.checkRoomAvailability(
      booking.room.id,
      newDates.checkIn,
      newDates.checkOut,
      bookingId
    );

    if (!isAvailable) {
      throw new DomainError('DOUBLE_BOOKING');
    }

    await bookingRepository.updateBooking(bookingId, {
      checkInDate: newDates.checkIn,
      checkOutDate: newDates.checkOut,
      totalGuests: newGuests,
      totalPrice: newPrice,
    });
  },

  /**
   * Approves a pending booking (admin only)
   */
  approveBooking: async (bookingId: string): Promise<void> => {
    const booking = await bookingRepository.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const isAvailable = await bookingRepository.checkRoomAvailability(
      booking.room.id,
      booking.checkInDate,
      booking.checkOutDate,
      bookingId
    );

    if (!isAvailable) {
      throw new DomainError('DOUBLE_BOOKING');
    }

    await bookingRepository.updateBooking(bookingId, { status: 'Confirmed' });
  },

  /**
   * Updates booking status (admin only)
   */
  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<void> => {
    if (status === 'Confirmed') {
      const booking = await bookingRepository.getBookingById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const isAvailable = await bookingRepository.checkRoomAvailability(
        booking.room.id,
        booking.checkInDate,
        booking.checkOutDate,
        bookingId
      );

      if (!isAvailable) {
        throw new DomainError('DOUBLE_BOOKING');
      }
    }
    await bookingRepository.updateBooking(bookingId, { status });
  },

  /**
   * Fetches a booking by ID
   */
  getBookingById: async (bookingId: string): Promise<Booking | null> => {
    return await bookingRepository.getBookingById(bookingId);
  },

  /**
   * Syncs all past 'Confirmed' bookings to 'Completed'.
   */
  syncCompletedStatus: async (): Promise<void> => {
    const allBookings = await bookingRepository.getAllBookings();
    const now = new Date();
    
    const updates = allBookings
      .filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) < now)
      .map(b => bookingRepository.updateBooking(b.id, { status: 'Completed' }));
    
    await Promise.all(updates);
  }
};
