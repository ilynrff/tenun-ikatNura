'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'checkout-prompt' | 'account'
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Sync auth state with localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('tenun_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user state', e);
    }
  }, []);

  const login = (email, password) => {
    // Demo authentication - mock user login
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    const mockUser = {
      name: formattedName || 'Pelanggan Nura',
      email: email,
      phone: '0812-3456-7890',
    };
    setUser(mockUser);
    localStorage.setItem('tenun_user', JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
    setIsAccountDrawerOpen(false);
    return true;
  };

  const register = ({ fullName, email, phone, password }) => {
    const newUser = {
      name: fullName,
      email: email,
      phone: phone,
    };
    setUser(newUser);
    localStorage.setItem('tenun_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    setIsAccountDrawerOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tenun_user');
    setIsAccountDrawerOpen(false);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAccountDrawer = () => {
    setIsAccountDrawerOpen(true);
  };

  const closeAccountDrawer = () => {
    setIsAccountDrawerOpen(false);
  };

  const toggleAccountDrawer = () => {
    setIsAccountDrawerOpen((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        isAccountDrawerOpen,
        openAccountDrawer,
        closeAccountDrawer,
        toggleAccountDrawer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
