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
        <Link href="/" target="_blank" className={styles.storeLink} aria-label="Buka etalase toko di tab baru">
          <span>Lihat Website Toko</span>
          <span>&nearr;</span>
        </Link>
      </div>
    </header>
  );
}
