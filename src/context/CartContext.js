'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load saved cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('tenun_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tenun_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (product, size = 'Free Size', quantity = 1) => {
    const itemSku = product.sku || 'NURA-ITEM';
    const itemKey = `${itemSku}-${size}`;

    // Clean numerical price for subtotal calculations
    const cleanPriceStr = product.price ? product.price.replace(/[^0-9]/g, '') : '0';
    const numPrice = parseInt(cleanPriceStr, 10) || 0;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.key === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            key: itemKey,
            id: product.id || itemSku,
            sku: itemSku,
            name: product.name,
            price: product.price || 'Rp 450.000',
            numPrice: numPrice || 450000,
            image: product.images ? product.images[0] : (product.image || '/images/hero/hero-main.jpg'),
            size,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (key) => {
    setCart((prevCart) => prevCart.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const rawSubtotal = cart.reduce((sum, item) => sum + item.numPrice * item.quantity, 0);

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(rawSubtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal: formattedSubtotal,
        rawSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
