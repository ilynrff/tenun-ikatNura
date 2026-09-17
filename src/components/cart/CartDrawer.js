'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, totalItems, subtotal } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      setShowAuthWarning(true);
    } else {
      setShowAuthWarning(false);
      // Construct WhatsApp Order for items in cart
      const adminWa = '6281252783496';
      let message = `Halo Admin Tenun Ikat Nura,\n\nSaya ingin memesan produk berikut dari Cart:\n`;
      cart.forEach((item, idx) => {
        message += `\n${idx + 1}. *${item.name}* (Kode: ${item.sku}) - Size: ${item.size} x ${item.quantity} = ${item.price}`;
      });
      message += `\n\n*Total Estimasi*: ${subtotal}\n\nMohon konfirmasi ketersediaan dan proses pemesanannya. Terima kasih!`;
      
      const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.backdropOpen : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <aside
        className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h2 className={styles.title}>YOUR CART</h2>
            <span className={styles.countBadge}>({totalItems})</span>
          </div>
          <button
            onClick={closeCart}
            className={styles.closeBtn}
            aria-label="Tutup keranjang"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={styles.emptyIcon}
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <h3 className={styles.emptyText}>Keranjang Belanja Kosong</h3>
              <p className={styles.emptySubtext}>
                Jelajahi karya tenun ikat warisan Nusantara kami dan temukan pilihan busana timeless Anda.
              </p>
              <Link href="/collections" onClick={closeCart} className={styles.shopBtn}>
                Lihat Koleksi
              </Link>
            </div>
          ) : (
            <div className={styles.itemList}>
              {cart.map((item) => (
                <div key={item.key} className={styles.itemCard}>
                  <div className={styles.itemImageWrapper}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemDetails}>
                    <div>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      <div className={styles.itemMeta}>
                        KODE: {item.sku} | Ukuran: {item.size}
                      </div>
                      <div className={styles.itemPrice}>{item.price}</div>
                    </div>

                    <div className={styles.qtyRow}>
                      <div className={styles.qtyControls}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, -1)}
                          className={styles.qtyBtn}
                          aria-label="Kurangi jumlah"
                        >
                          -
                        </button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, 1)}
                          className={styles.qtyBtn}
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.key)}
                        className={styles.removeBtn}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>SUBTOTAL</span>
              <span className={styles.subtotalValue}>{subtotal}</span>
            </div>

            {/* Auth Warning notice when Guest tries to Checkout */}
            {showAuthWarning && !isLoggedIn && (
              <div className={styles.authNotice}>
                <p className={styles.authNoticeText}>
                  Please log in or create an account to continue to checkout.
                </p>
                <div className={styles.authNoticeBtns}>
                  <button
                    onClick={() => {
                      closeCart();
                      openAuthModal('login');
                    }}
                    className={styles.authBtnLogin}
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      openAuthModal('register');
                    }}
                    className={styles.authBtnRegister}
                  >
                    CREATE ACCOUNT
                  </button>
                </div>
              </div>
            )}

            <div className={styles.actionBtns}>
              <Link href="/collections" onClick={closeCart} className={styles.viewCartBtn}>
                DISCOVER MORE PIECES
              </Link>
              <button onClick={handleCheckoutClick} className={styles.checkoutBtn}>
                CHECKOUT
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
