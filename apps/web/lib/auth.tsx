"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  phone: string;
  role: 'worker' | 'customer' | 'admin';
  name?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  userId: string | null;
  token: string | null;
  login: (token: string, userId: string, userData?: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUserId) {
      setToken(storedToken);
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          setUser({ id: storedUserId, phone: '', role: 'customer' });
        }
      } else {
        setUser({ id: storedUserId, phone: '', role: 'customer' });
      }
    }
  }, []);

  const login = (newToken: string, userId: string, userData?: Partial<User>) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userId', userId);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setToken(newToken);
    const userRole = userData?.role || 'customer';
    setUser({ 
      id: userId, 
      phone: userData?.phone || '', 
      role: userRole,
      name: userData?.name,
      email: userData?.email,
    });
    
    // Redirect based on role
    if (userRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData } as User;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, userId: user?.id || null, token, login, logout, isAuthenticated: !!token, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
