'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminLayout.module.css';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Pesanan',
    href: '/admin/orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    label: 'Produk',
    href: '/admin/products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Kategori',
    href: '/admin/categories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user } = useAuth();

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutConfirm && !isLoggingOut) {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm, isLoggingOut]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Gagal logout dari sesi admin.');
      }

      try {
        localStorage.removeItem('tenun_user');
      } catch (e) {}

      window.location.assign('/login');
    } catch (err) {
      setIsLoggingOut(false);
      alert(err.message || 'Terjadi kesalahan saat logout.');
    }
  };

  const isActiveRoute = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && <div className={styles.drawerBackdrop} onClick={onClose} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand Header */}
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brandLink} onClick={onClose}>
            <span className={styles.brandTagline}>ADMIN PANEL</span>
            <span className={styles.brandTitle}>TENUN IKAT NURA</span>
          </Link>
          <button
            type="button"
            className={styles.closeDrawerBtn}
            onClick={onClose}
            aria-label="Tutup navigasi sidebar"
          >
            &times;
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={styles.navSection} aria-label="Menu Admin">
          <span className={styles.navLabel}>Navigasi Utama</span>
          {navItems.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Admin Profile & Logout) */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>A</div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{user?.name || 'Administrator'}</span>
              <span className={styles.adminRole}>Super Admin</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            className={styles.logoutBtn}
            aria-label="Keluar dari panel admin"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Modal Dialog for Admin Logout */}
      {showLogoutConfirm && (
        <div
          className={styles.modalBackdrop}
          onClick={() => {
            if (!isLoggingOut) setShowLogoutConfirm(false);
          }}
          aria-hidden="true"
        >
          <div
            className={styles.modalBox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-logout-title"
            aria-describedby="admin-logout-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIconWrapper}>
              <svg
                width="24"
                height="24"
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

            <h3 id="admin-logout-title" className={styles.modalTitle}>
              Konfirmasi Keluar Administrator
            </h3>
            <p id="admin-logout-desc" className={styles.modalText}>
              Apakah kamu yakin ingin keluar dari akun administrator?
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className={styles.modalCancelBtn}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
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
