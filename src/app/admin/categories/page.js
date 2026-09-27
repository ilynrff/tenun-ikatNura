import Link from 'next/link';
import styles from './categories.module.css';

export const metadata = {
  title: 'Kelola Kategori — Admin Tenun Ikat Nura',
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Kelola Kategori</h2>
          <p className={styles.pageDesc}>
            Atur daftar kategori busana tenun: Gaun, Outerwear, Sarimbit, Syal, dan lainnya.
          </p>
        </div>
      </div>

      {/* Placeholder — akan diisi di Step 4 */}
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🏷️</div>
        <h3 className={styles.emptyTitle}>Manajemen Kategori</h3>
        <p className={styles.emptyDesc}>
          Fitur ini akan tersedia di <strong>Step 4 — Product Management</strong>.
          <br />
          CRUD kategori, pengurutan, dan asosiasi ke produk akan dibangun di sini.
        </p>
        <Link href="/admin" className={styles.backLink}>
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
