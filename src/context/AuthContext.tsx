import React, { createContext, useContext, useState } from 'react';
import { UserType } from '../types';

interface AuthContextType {
  user: UserType | null;
  login: (user: UserType) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<UserType>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  updateUser: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const login = (user: UserType) => setUser(user);
  const logout = () => setUser(null);
  const updateUser = (updates: Partial<UserType>) =>
    setUser(prev => (prev ? { ...prev, ...updates } : prev));
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
