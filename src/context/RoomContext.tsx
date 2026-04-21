import React, { createContext, useContext } from 'react';
import { Room } from '../types';
import { useRooms as useRoomsHook } from '../hooks/useRooms';
import { roomService } from '../services/roomService';

interface RoomContextType {
  rooms: Room[];
  featuredRooms: Room[];
  availableRooms: Room[];
  isLoading: boolean;
  error: string | null;
  addRoom: (room: Omit<Room, 'id' | 'averageRating' | 'reviewCount'>) => Promise<string>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  uploadRoomPhoto: (roomId: string, localUri: string) => Promise<string>;
}

const RoomContext = createContext<RoomContextType>({
  rooms: [],
  featuredRooms: [],
  availableRooms: [],
  isLoading: true,
  error: null,
  addRoom: async () => '',
  updateRoom: async () => {},
  deleteRoom: async () => {},
  uploadRoomPhoto: async () => '',
});

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { rooms, featuredRooms, availableRooms, isLoading, error } = useRoomsHook();

  const addRoom = async (roomData: Omit<Room, 'id' | 'averageRating' | 'reviewCount'>) => {
    return await roomService.createRoom(roomData);
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    await roomService.updateRoom(roomId, updates);
  };

  const deleteRoom = async (roomId: string) => {
    await roomService.deleteRoom(roomId);
  };

  const uploadRoomPhoto = async (roomId: string, localUri: string) => {
    return await roomService.uploadRoomPhoto(roomId, localUri);
  };

  return (
    <RoomContext.Provider value={{ 
      rooms, 
      featuredRooms, 
      availableRooms, 
      isLoading, 
      error,
      addRoom, 
      updateRoom, 
      deleteRoom,
      uploadRoomPhoto
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => useContext(RoomContext);
export { useRoomsHook };
