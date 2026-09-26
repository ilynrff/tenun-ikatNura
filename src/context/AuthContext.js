'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'checkout-prompt' | 'account'
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Sync auth state with localStorage on mount
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

  const login = (email, password, extraData = {}) => {
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const userRole = extraData.role || (email.toLowerCase() === 'admin@tenunikatnura.com' ? 'ADMIN' : 'USER');

    const authUser = {
      name: extraData.name || formattedName || 'Pelanggan Nura',
      email: email,
      phone: extraData.phone || '0812-3456-7890',
      role: userRole,
    };

    setUser(authUser);
    try {
      localStorage.setItem('tenun_user', JSON.stringify(authUser));
    } catch (e) {}

    setIsAuthModalOpen(false);
    setIsAccountDrawerOpen(false);
    return true;
  };

  const register = ({ fullName, email, phone, password }) => {
    const newUser = {
      name: fullName,
      email: email,
      phone: phone,
      role: 'USER',
    };

    setUser(newUser);
    try {
      localStorage.setItem('tenun_user', JSON.stringify(newUser));
    } catch (e) {}

    setIsAuthModalOpen(false);
    setIsAccountDrawerOpen(false);
    return true;
  };

  const logout = async () => {
    const wasAdmin = user?.role === 'ADMIN';
    setUser(null);
    try {
      localStorage.removeItem('tenun_user');
    } catch (e) {}

    // If was admin, trigger server cookie cleanup
    if (wasAdmin) {
      try {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
      } catch (e) {}
    }

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
        isAdmin: user?.role === 'ADMIN',
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
