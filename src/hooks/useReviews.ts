import { useState, useEffect } from 'react';
import { reviewRepository } from '../repositories/reviewRepository';
import { useAuth } from '../context/AuthContext';
import { Review } from '../types';

export const useReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribe: () => void;

    if (user.role === 'admin') {
      unsubscribe = reviewRepository.subscribeToAllReviews((data) => {
        setReviews(data);
        setIsLoading(false);
      });
    } else {
      // For guests, we might just fetch their reviews once or subscribe if needed.
      // The prompt suggests getReviewsByUser (guest) - typically this isn't real-time
      // but for consistency we'll fetch them.
      reviewRepository.getReviewsByUser(user.id)
        .then(data => {
          setReviews(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return { reviews, isLoading, error };
};
