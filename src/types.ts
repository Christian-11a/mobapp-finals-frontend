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

export interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'maya';
  label: string; // e.g. "•••• 4242" or "0917***8888"
  isDefault: boolean;
  provider?: string; // "Visa", "Mastercard", etc.
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'account' | 'promo';
  createdAt: string;
  isRead: boolean;
}

export interface NotificationSettings {
  push: {
    bookings: boolean;
    promos: boolean;
    account: boolean;
  };
  email: {
    newsletters: boolean;
    billing: boolean;
  };
}

export interface UserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'guest' | 'admin';
  paymentMethods?: PaymentMethod[];
  notificationSettings?: NotificationSettings;
  savedRoomIds?: string[];
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
  Landing: undefined;
  SignIn: undefined;
  Register: undefined;
  MainTabs: undefined;
  AdminTabs: undefined;
  RoomDetail: { roomId: string };
  BookingStep1: { roomId: string };
  BookingStep2: {
    room: {
      id: string;
      name: string;
      image: string;
      price: number;
      category?: string;
      floor?: string | number;
      bedType?: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
  };
  Payment: {
    room: {
      id: string;
      name: string;
      image: string;
      price: number;
      category?: string;
      floor?: string | number;
      bedType?: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    specialRequests?: string;
  };
  BookingDetail: { bookingId: string; action?: 'edit' | 'cancel' };
  BookingSuccess: { bookingId: string };
  EditProfile: undefined;
  Security: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  SavedRooms: undefined;
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
