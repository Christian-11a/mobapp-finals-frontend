import { reviewRepository } from '../repositories/reviewRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { roomService } from './roomService';
import { Review } from '../types';

export const reviewService = {
  /**
   * Submits a new review for a completed booking.
   */
  submitReview: async (params: Omit<Review, 'id' | 'createdAt' | 'isHidden'>): Promise<string> => {
    // 1. Verify booking exists and is completed
    const booking = await bookingRepository.getBookingById(params.bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'Completed') {
      throw new Error('Reviews can only be submitted for completed bookings.');
    }

    // 2. Check if a review already exists for this booking
    const existingReview = await reviewRepository.getReviewByBooking(params.bookingId);
    if (existingReview) {
      throw new Error('A review has already been submitted for this booking.');
    }

    // 3. Save review
    const reviewData: Omit<Review, 'id'> = {
      ...params,
      createdAt: new Date().toISOString(),
    };

    const reviewId = await reviewRepository.addReview(reviewData);

    // 4. Update room rating
    // Note: roomService.updateRoomRating(roomId) is a Phase 3 requirement
    // @ts-ignore
    if (typeof roomService.updateRoomRating === 'function') {
      // @ts-ignore
      await roomService.updateRoomRating(params.roomId);
    }

    return reviewId;
  },

  /**
   * Deletes a review (admin only)
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    // Note: Real admin check happens via Firestore rules (Phase 7)
    // and custom claim check in the UI/service if needed.
    const review = await reviewRepository.getAllReviews().then(rs => rs.find(r => r.id === reviewId));
    await reviewRepository.deleteReview(reviewId);

    // Update room rating after deletion
    if (review) {
      // @ts-ignore
      if (typeof roomService.updateRoomRating === 'function') {
        // @ts-ignore
        await roomService.updateRoomRating(review.roomId);
      }
    }
  },

  /**
   * Toggles review visibility (admin moderation)
   */
  toggleReviewVisibility: async (
    reviewId: string, 
    isHidden: boolean, 
    reason?: Review['hiddenReason']
  ): Promise<void> => {
    await reviewRepository.updateReview(reviewId, {
      isHidden,
      hiddenReason: isHidden ? reason : undefined,
    });
  },

  /**
   * Adds an admin reply to a review
   */
  addAdminReply: async (reviewId: string, reply: string): Promise<void> => {
    await reviewRepository.updateReview(reviewId, {
      adminReply: reply,
    });
  }
};
