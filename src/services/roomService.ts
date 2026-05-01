import * as ImageManipulator from 'expo-image-manipulator';
import { roomRepository } from '../repositories/roomRepository';
import { cloudinaryService } from './cloudinaryService';
import { Room } from '../types';

export const roomService = {
  /**
   * Fetches all rooms
   */
  getRooms: async (): Promise<Room[]> => {
    return await roomRepository.getAllRooms();
  },

  /**
   * Fetches a single room by ID
   */
  getRoomById: async (roomId: string): Promise<Room | null> => {
    return await roomRepository.getRoomById(roomId);
  },

  /**
   * Creates a new room with default values for ratings
   */
  createRoom: async (data: Omit<Room, 'id' | 'averageRating' | 'reviewCount'>): Promise<string> => {
    if (data.pricePerNight <= 0) {
      throw new Error('Price per night must be a positive number.');
    }

    const roomData: Omit<Room, 'id'> = {
      ...data,
      averageRating: 0,
      reviewCount: 0,
    };

    return await roomRepository.addRoom(roomData);
  },

  /**
   * Updates an existing room's details
   */
  updateRoom: async (roomId: string, updates: Partial<Room>): Promise<void> => {
    if (updates.pricePerNight !== undefined && updates.pricePerNight <= 0) {
      throw new Error('Price per night must be a positive number.');
    }

    await roomRepository.updateRoom(roomId, updates);
  },

  /**
   * Deletes a room
   */
  deleteRoom: async (roomId: string): Promise<void> => {
    // Note: In a production app, we'd check for active bookings here.
    // For now, we'll proceed with direct deletion.
    await roomRepository.deleteRoom(roomId);
  },

  /**
   * Compresses and uploads a room photo to Cloudinary.
   * This is compatible with Expo Go and avoids native Firebase Storage issues.
   */
  uploadRoomPhoto: async (roomId: string, localUri: string): Promise<string> => {
    try {
      // 1. Compress and resize image
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 2. Upload to Cloudinary using existing service
      return await cloudinaryService.uploadImage(manipResult.uri, 'rooms');
    } catch (error: any) {
      console.error('Error uploading room photo:', error);
      throw new Error(`Failed to upload room photo: ${error.message || 'Unknown error'}`);
    }
  }
};
