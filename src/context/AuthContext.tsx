import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
    let unsubscribeUser: () => void = () => {};

    const unsubscribeAuth = authService.onAuthStateChange(async (profile) => {
      // Clean up previous listener if any
      unsubscribeUser();

      if (profile) {
        // 1. Setup real-time listener for user document in Firestore
        unsubscribeUser = onSnapshot(doc(db, 'users', profile.id), async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as UserType;
            
            // 2. Read custom claims for admin role
            try {
              const idTokenResult = await auth.currentUser?.getIdTokenResult(true);
              const adminClaim = idTokenResult?.claims.admin === true;
              setIsAdmin(adminClaim);
              
              // 3. Update local state with latest Firestore data + verified admin status
              setUser({ ...userData, role: adminClaim ? 'admin' : 'guest' });
            } catch (error) {
              console.error('Error fetching custom claims:', error);
              setUser(userData);
              setIsAdmin(userData.role === 'admin');
            }
          } else {
            // Profile exists in Auth but not in Firestore yet?
            setUser(profile);
            setIsAdmin(profile.role === 'admin');
          }
          setIsLoading(false);
        }, (error) => {
          console.error('Firestore user snapshot error:', error);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
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
      // No need to manual setUser here because onSnapshot will detect the change
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
