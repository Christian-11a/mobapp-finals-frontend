import { useState, useEffect, useMemo } from 'react';
import { roomRepository } from '../repositories/roomRepository';
import { Room } from '../types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = roomRepository.subscribeToRooms((updatedRooms) => {
      setRooms(updatedRooms);
      setIsLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Memoized view of featured rooms (e.g., top rated)
   */
  const featuredRooms = useMemo(() => 
    rooms.filter(r => r.isTopRated).slice(0, 5), 
  [rooms]);

  /**
   * Memoized view of all available rooms
   */
  const availableRooms = useMemo(() => 
    rooms.filter(r => r.isAvailable), 
  [rooms]);

  /**
   * Helper to filter rooms by type/category
   */
  const getRoomsByType = (type: string) => {
    if (type === 'All') return rooms;
    return rooms.filter(r => r.type === type);
  };

  return {
    rooms,
    featuredRooms,
    availableRooms,
    getRoomsByType,
    isLoading,
    error,
  };
};
