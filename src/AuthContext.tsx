import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, User, signInWithPopup, googleProvider, isFirebaseEnabled, mockUser } from './lib/firebase';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      // In demo mode, we check localStorage for a mock session
      const savedUser = localStorage.getItem('mindlock_demo_user');
      if (savedUser) {
        setUser(mockUser);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    if (!isFirebaseEnabled) {
      // Mock login for demo mode
      setUser(mockUser);
      localStorage.setItem('mindlock_demo_user', 'true');
      toast.success("Demo Mode: Logged in as Enforcer");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in!");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/api-key-not-valid') {
        toast.error("Firebase configuration is still being provisioned. Please try again in a minute.");
      } else {
        toast.error("Failed to login. Please try again.");
      }
    }
  };

  const logout = async () => {
    if (!isFirebaseEnabled) {
      setUser(null);
      localStorage.removeItem('mindlock_demo_user');
      toast.success("Demo Mode: Logged out");
      return;
    }

    try {
      await auth.signOut();
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to logout.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
      <Toaster position="top-center" />
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
