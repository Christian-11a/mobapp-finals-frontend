export interface Photo {
  url: string;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  type: 'Single' | 'Double' | 'Suite' | 'Family' | 'Exclusive';
  pricePerNight: number;
  maxPeople: number;
  amenities: string[];
  thumbnailPic?: Photo;
  photos: Photo[];
  isAvailable: boolean;
  averageRating: number;
  reviewCount?: number;
  isTopRated?: boolean;
}

export interface UserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'admin';
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  roomId: string;
  rating: number; // 1–5
  text: string;
  createdAt: string;
  userName: string;
}

export interface Booking {
  id: string;
  userId: string;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalPrice: number;
  cancellationFee?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  bookedAt: string;
}

export type RootStackParamList = {
  SignIn: undefined;
  Register: undefined;
  MainTabs: undefined;
  AdminTabs: undefined;
  RoomDetail: { roomId: string };
  BookingDetail: { bookingId: string };
  BookingSuccess: { bookingId: string };
  EditProfile: undefined;
  AboutUs: undefined;
  FAQ: undefined;
  Policies: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Rooms: undefined;
  MyBookings: undefined;
  More: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  AdminRooms: undefined;
  AdminBookings: undefined;
  AdminReviews: undefined;
};
