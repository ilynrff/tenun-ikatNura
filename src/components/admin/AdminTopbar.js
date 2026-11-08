'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminLayout.module.css';

export default function AdminTopbar({ onOpenMenu }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/products/new')) return 'Tambah Produk Baru';
    if (pathname.startsWith('/admin/products/')) return 'Edit Produk';
    if (pathname.startsWith('/admin/products')) return 'Manajemen Produk';
    if (pathname.startsWith('/admin/categories')) return 'Manajemen Kategori';
    return 'Admin Panel';
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button
          type="button"
          className={styles.menuToggleBtn}
          onClick={onOpenMenu}
          aria-label="Buka navigasi menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>

      <div className={styles.topbarRight}>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.storeLink}
          aria-label="Buka etalase toko di tab baru"
          title="Buka etalase toko di tab baru"
        >
          <span className={styles.storeLinkText}>Lihat Website Toko</span>
          <span className={styles.storeLinkTextMobile}>Lihat Toko</span>
          <svg
            className={styles.storeLinkIcon}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
