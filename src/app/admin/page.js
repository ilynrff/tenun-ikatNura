import Link from 'next/link';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <h2 className={styles.welcomeTitle}>Admin Dashboard</h2>
        <p className={styles.welcomeDesc}>
          Kelola katalog produk, ketersediaan stok, dan penempatan etalase Tenun Ikat Nura.
        </p>
      </div>

      {/* 4 Statistics Cards (Shell/Placeholder for Step 3) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Produk Aktif</span>
            <span className={styles.statIcon}>📦</span>
          </div>
          <div className={styles.statValue}>—</div>
          <span className={styles.statFootnote}>Koleksi yang aktif di etalase</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Stok Menipis</span>
            <span className={styles.statIcon}>⚠️</span>
          </div>
          <div className={styles.statValue}>—</div>
          <span className={styles.statFootnote}>Produk tersisa &le; 3 buah</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Stok Habis</span>
            <span className={styles.statIcon}>🚫</span>
          </div>
          <div className={styles.statValue}>—</div>
          <span className={styles.statFootnote}>Perlu restock kain / produksi</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Featured Products</span>
            <span className={styles.statIcon}>✨</span>
          </div>
          <div className={styles.statValue}>—</div>
          <span className={styles.statFootnote}>Tampil di Beranda</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h3 className={styles.sectionTitle}>Aksi Cepat</h3>
        <div className={styles.actionsGrid}>
          <Link href="/admin/products/new" className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>+ Tambah Produk Baru</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Unggah foto karya tenun baru, atur harga, stok, dan kategori.
            </p>
          </Link>

          <Link href="/admin/products" className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>Kelola Semua Produk</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Lihat daftar katalog lengkap, perbarui stok, dan sesuaikan etalase.
            </p>
          </Link>

          <Link href="/admin/categories" className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>Kelola Kategori</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Atur daftar kategori busana (Gaun, Outerwear, Sarimbit, dll).
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
