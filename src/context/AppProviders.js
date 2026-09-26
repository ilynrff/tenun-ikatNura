'use client';

import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import { WishlistProvider } from './WishlistContext';
import CartDrawer from '@/components/cart/CartDrawer';
import AccountDrawer from '@/components/auth/AccountDrawer';
import AuthModal from '@/components/auth/AuthModal';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <CartDrawer />
          <AccountDrawer />
          <AuthModal />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
