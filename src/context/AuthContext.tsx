import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserType } from '../types';
import { authService } from '../services/authService';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  updateUser: (updates: Partial<UserType>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  updateUser: async () => {},
  logout: async () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (profile) => {
      if (profile) {
        // Read custom claims for admin role
        try {
          const idTokenResult = await auth.currentUser?.getIdTokenResult(true);
          const adminClaim = idTokenResult?.claims.admin === true;
          setIsAdmin(adminClaim);
          // Override Firestore role with token claim for security
          setUser({ ...profile, role: adminClaim ? 'admin' : 'guest' });
        } catch (error) {
          console.error('Error fetching custom claims:', error);
          setUser(profile);
          setIsAdmin(profile.role === 'admin');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const updateUser = async (updates: Partial<UserType>) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      setUser(prev => (prev ? { ...prev, ...updates } : prev));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin,
      isLoading, 
      updateUser, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
