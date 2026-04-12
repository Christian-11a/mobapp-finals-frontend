import React, { createContext, useContext, useState } from 'react';
import { Room } from '../types';
import { PLACEHOLDER_ROOMS } from '../data/placeholders';

interface RoomContextType {
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
}

const RoomContext = createContext<RoomContextType>({
  rooms: [],
  addRoom: () => {},
  updateRoom: () => {},
  deleteRoom: () => {},
});

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>(PLACEHOLDER_ROOMS);

  const addRoom = (room: Room) => setRooms(prev => [...prev, room]);
  const updateRoom = (room: Room) => setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  const deleteRoom = (roomId: string) => setRooms(prev => prev.filter(r => r.id !== roomId));

  return (
    <RoomContext.Provider value={{ rooms, addRoom, updateRoom, deleteRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => useContext(RoomContext);
