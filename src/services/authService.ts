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
    password: 'password123',
  },
  {
    id: 'user_002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@luxestay.com',
    password: 'password123',
  },
];

// In-memory user store — replace with API calls when backend is ready
let registeredUsers: StoredUser[] = [...PLACEHOLDER_ACCOUNTS];

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
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<UserType> => {
    await new Promise(r => setTimeout(r, 600));
    const exists = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists.');
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      firstName,
      lastName,
      email,
      password,
    };
    registeredUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};