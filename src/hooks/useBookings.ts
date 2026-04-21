import { useState, useEffect, useMemo } from 'react';
import { bookingRepository } from '../repositories/bookingRepository';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { withComputedStatus } from '../utils/bookingUtils';

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribe: () => void;

    try {
      if (user.role === 'admin') {
        unsubscribe = bookingRepository.subscribeToAllBookings((data) => {
          setBookings(data);
          setIsLoading(false);
        });
      } else {
        unsubscribe = bookingRepository.subscribeToUserBookings(user.id, (data) => {
          setBookings(data);
          setIsLoading(false);
        });
      }
    } catch (err) {
      console.error('Error subscribing to bookings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Apply withComputedStatus logic client-side
  const processedBookings = useMemo(() => {
    return bookings.map(withComputedStatus);
  }, [bookings]);

  return { 
    bookings: processedBookings, 
    isLoading, 
    error 
  };
};
