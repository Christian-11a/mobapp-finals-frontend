import { UserType } from '../types';

// ─── Placeholder accounts (remove when backend is ready) ──────────────────────
export interface StoredUser extends UserType {
  password: string;
}

export const PLACEHOLDER_ACCOUNTS: StoredUser[] = [
  {
    id: 'user_001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@luxestay.com',
    phoneNumber: '09123456789',
    password: 'password123',
    role: 'guest',
    paymentMethods: [
      { id: 'm_001', type: 'card', label: '•••• 4242', isDefault: true, provider: 'Visa' },
      { id: 'm_002', type: 'gcash', label: '0912***6789', isDefault: false }
    ],
    savedRoomIds: ['room_001', 'room_003']
  },
  {
    id: 'user_002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@luxestay.com',
    phoneNumber: '09123456790',
    password: 'password123',
    role: 'guest',
    paymentMethods: [],
    savedRoomIds: []
  },
  {
    id: 'admin_001',
    firstName: 'Admin',
    lastName: 'Hotel',
    email: 'admin@hotel.com',
    phoneNumber: '09123456791',
    password: 'Admin123!',
    role: 'admin',
    paymentMethods: [],
    savedRoomIds: []
  },
];

// In-memory user store — replace with API calls when backend is ready
let registeredUsers: StoredUser[] = [...PLACEHOLDER_ACCOUNTS];

// Non-stub helpers
export const getRegisteredUsersCount = (): number => registeredUsers.length;

export const verifyPassword = (userId: string, password: string): boolean =>
  registeredUsers.find(u => u.id === userId)?.password === password;

export const checkEmailExists = (email: string, excludeUserId: string): boolean =>
  registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeUserId);

export const updateStoredUser = (
  userId: string,
  updates: Partial<UserType>,
): void => {
  registeredUsers = registeredUsers.map(u => (u.id === userId ? { ...u, ...updates } : u));
};

export const deleteStoredUser = (userId: string): void => {
  registeredUsers = registeredUsers.filter(u => u.id !== userId);
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  // TODO: replace with → POST /api/auth/login
  login: async (email: string, password: string): Promise<UserType> => {
    await new Promise(r => setTimeout(r, 600)); // simulate network delay
    const user = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password.');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // TODO: replace with → POST /api/auth/register
  register: async (firstName: string, lastName: string, email: string, password: string, phoneNumber?: string): Promise<UserType> => {
    await new Promise(r => setTimeout(r, 600));
    const exists = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists.');
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || '',
      password,
      role: 'guest',
      paymentMethods: [],
      notificationSettings: {
        push: { bookings: true, promos: true, account: true },
        email: { newsletters: false, billing: true }
      },
      savedRoomIds: []
    };
    registeredUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};
