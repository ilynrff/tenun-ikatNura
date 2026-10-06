'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'checkout-prompt' | 'account'
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // 1. Sync auth state from Server Session (/api/auth/me) on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            setUser(data.user);
            try {
              localStorage.setItem('tenun_user', JSON.stringify(data.user));
            } catch (e) {}
            return;
          }
        }

        // Check if cached admin or user in localStorage
        const savedUser = localStorage.getItem('tenun_user');
        if (savedUser && isMounted) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.role === 'ADMIN') {
            setUser(parsed);
          } else {
            // Unverified customer session without cookie
            localStorage.removeItem('tenun_user');
            setUser(null);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to verify session:', e);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real Server-Side Customer Login
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Email atau kata sandi tidak sesuai.',
        };
      }

      const authUser = data.user;
      setUser(authUser);
      try {
        localStorage.setItem('tenun_user', JSON.stringify(authUser));
      } catch (e) {}

      setIsAuthModalOpen(false);
      setIsAccountDrawerOpen(false);
      return { success: true, user: authUser };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: 'Terjadi kesalahan jaringan saat login.',
      };
    }
  };

  // 3. Real Server-Side Customer Register
  const register = async ({ fullName, email, phone, password }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Pendaftaran gagal.',
        };
      }

      const authUser = data.user;
      setUser(authUser);
      try {
        localStorage.setItem('tenun_user', JSON.stringify(authUser));
      } catch (e) {}

      setIsAuthModalOpen(false);
      setIsAccountDrawerOpen(false);
      return { success: true, user: authUser };
    } catch (err) {
      console.error('Register error:', err);
      return {
        success: false,
        message: 'Terjadi kesalahan jaringan saat pendaftaran.',
      };
    }
  };

  // 4. Logout (Customer & Admin)
  const logout = async () => {
    const wasAdmin = user?.role === 'ADMIN';
    setUser(null);
    try {
      localStorage.removeItem('tenun_user');
    } catch (e) {}

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}

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
        isLoadingAuth,
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
