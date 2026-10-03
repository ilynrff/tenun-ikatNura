'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { formatRupiah, parsePriceToNumber } from '@/lib/format';

const CartContext = createContext();

function normalizeCartItem(item) {
  if (!item || typeof item !== 'object') return null;
  const numPrice = parsePriceToNumber(item.numPrice ?? item.price);
  const stock = typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : 5;
  const qty = Math.max(1, Math.min(Number(item.quantity) || 1, stock > 0 ? stock : 1));
  const size = item.size || item.selectedSize || 'Free Size';
  const variant = item.variant || item.selectedVariant || null;
  const productId = String(item.productId || item.id || item.sku || 'item');
  const key = item.key || `${productId}__${size}${variant ? `__${variant}` : ''}`;

  return {
    key,
    productId: item.productId || item.id || productId,
    id: item.id || productId,
    sku: item.sku || 'NURA-ITEM',
    slug: item.slug || '',
    name: item.name || 'Karya Tenun Nura',
    price: numPrice,
    numPrice: numPrice,
    formattedPrice: formatRupiah(numPrice),
    image: item.image || (Array.isArray(item.images) && item.images[0]) || '/images/hero/hero-main.jpg',
    size,
    selectedSize: size,
    variant,
    selectedVariant: variant,
    quantity: qty,
    stock,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load saved cart from localStorage on mount safely
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('tenun_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const valid = parsed.map(normalizeCartItem).filter(Boolean);
          setCart(valid);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart changes to localStorage safely
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

  const addToCart = (product, size = 'Free Size', quantity = 1, variant = null) => {
    if (!product) return;

    const maxStock = typeof product.stock === 'number' ? Math.max(0, Math.floor(product.stock)) : 5;
    if (maxStock <= 0) return; // Do not allow out of stock items

    const numPrice = parsePriceToNumber(product.price);
    const productId = String(product.id || product.sku || product.slug || 'item');
    const sizeKey = size ? String(size).trim() : 'Free Size';
    const variantKey = variant
      ? (typeof variant === 'object' ? (variant.name || variant.id || '') : String(variant).trim())
      : '';
    const itemKey = `${productId}__${sizeKey}${variantKey ? `__${variantKey}` : ''}`;
    const qtyToAdd = Math.max(1, Math.min(Number(quantity) || 1, maxStock));

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.key === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity || 1;
        const newQty = Math.min(maxStock, currentQty + qtyToAdd);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          stock: maxStock,
          price: numPrice,
          numPrice: numPrice,
          formattedPrice: formatRupiah(numPrice),
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            key: itemKey,
            productId: product.id ? String(product.id) : productId,
            id: product.id ? String(product.id) : productId,
            sku: product.sku || 'NURA-ITEM',
            slug: product.slug || '',
            name: product.name || 'Karya Tenun Nura',
            price: numPrice,
            numPrice: numPrice,
            formattedPrice: formatRupiah(numPrice),
            image: product.primaryImage || (Array.isArray(product.images) && product.images[0]) || product.image || '/images/hero/hero-main.jpg',
            size: sizeKey,
            selectedSize: sizeKey,
            variant: variantKey || null,
            selectedVariant: variantKey || null,
            quantity: qtyToAdd,
            stock: maxStock,
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
      prevCart.map((item) => {
        if (item.key === key) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999;
          const currentQty = item.quantity || 1;
          const newQty = currentQty + delta;
          if (newQty < 1) return item; // Do not drop below 1 with minus button
          const clampedQty = Math.min(maxStock, newQty);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const rawSubtotal = cart.reduce((sum, item) => sum + (item.numPrice || item.price || 0) * (item.quantity || 0), 0);

  const formattedSubtotal = formatRupiah(rawSubtotal);

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
