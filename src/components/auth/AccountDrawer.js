'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './AccountDrawer.module.css';

export default function AccountDrawer() {
  const {
    user,
    isLoggedIn,
    logout,
    isAccountDrawerOpen,
    closeAccountDrawer,
  } = useAuth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close modal when Account Drawer itself closes
  useEffect(() => {
    if (!isAccountDrawerOpen) {
      setShowConfirmModal(false);
    }
  }, [isAccountDrawerOpen]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showConfirmModal && !isLoggingOut) {
        setShowConfirmModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmModal, isLoggingOut]);

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowConfirmModal(false);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      setShowConfirmModal(false);
      window.location.assign('/');
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${isAccountDrawerOpen ? styles.backdropOpen : ''}`}
        onClick={closeAccountDrawer}
        aria-hidden="true"
      />

      <aside
        className={`${styles.drawer} ${isAccountDrawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Akun Saya"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>MY ACCOUNT</h2>
          <button
            onClick={closeAccountDrawer}
            className={styles.closeBtn}
            aria-label="Tutup panel akun"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {!isLoggedIn ? (
            /* STATE A: NOT LOGGED IN */
            <div>
              <p className={styles.subtitle}>Welcome to Tenun Ikat Nura</p>
              
              <Link
                href="/login"
                onClick={closeAccountDrawer}
                className={styles.loginBtn}
              >
                LOGIN
              </Link>

              <div className={styles.registerBox}>
                <p className={styles.registerPrompt}>Don&apos;t have an account?</p>
                <Link
                  href="/register"
                  onClick={closeAccountDrawer}
                  className={styles.registerBtn}
                >
                  Create an Account
                </Link>
              </div>
            </div>
          ) : (
            /* STATE B: LOGGED IN */
            <div>
              <h3 className={styles.greeting}>Hello, {user.name}</h3>
              <p className={styles.userEmail}>{user.email}</p>

              <div className={styles.menuList}>
                <button
                  type="button"
                  onClick={() => alert('Profil Pengguna: ' + user.name + ' (' + user.email + ')')}
                  className={styles.menuItem}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                >
                  My Profile
                </button>
                <Link
                  href="/account/orders"
                  onClick={closeAccountDrawer}
                  className={styles.menuItem}
                >
                  My Orders
                </Link>
              </div>

              <button
                type="button"
                onClick={handleOpenConfirm}
                className={styles.logoutBtn}
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Confirmation Modal Dialog for Customer Logout */}
      {showConfirmModal && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCancelLogout}
          aria-hidden="true"
        >
          <div
            className={styles.modalBox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-logout-title"
            aria-describedby="customer-logout-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIconWrapper}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h3 id="customer-logout-title" className={styles.modalTitle}>
              Konfirmasi Keluar
            </h3>
            <p id="customer-logout-desc" className={styles.modalText}>
              Apakah kamu yakin ingin keluar dari akun?
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className={styles.modalCancelBtn}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className={styles.modalConfirmBtn}
              >
                {isLoggingOut ? (
                  <>
                    <span className={styles.btnSpinner} aria-hidden="true" />
                    <span>Mengeluarkan...</span>
                  </>
                ) : (
                  'Ya, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
