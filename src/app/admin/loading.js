import styles from './dashboard.module.css';

export default function AdminDashboardLoading() {
  const skeletonCards = [
    { label: 'Total Produk Aktif', icon: '📦', footnote: 'Koleksi yang aktif di etalase' },
    { label: 'Stok Menipis', icon: '⚠️', footnote: 'Produk tersisa ≤ 3 buah' },
    { label: 'Stok Habis', icon: '🚫', footnote: 'Perlu restock kain / produksi' },
    { label: 'Featured Products', icon: '✨', footnote: 'Tampil di Beranda' },
  ];

  return (
    <div className={styles.dashboardContainer} aria-busy="true" aria-label="Memuat statistik dashboard">
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <h2 className={styles.welcomeTitle}>Admin Dashboard</h2>
        <p className={styles.welcomeDesc}>
          Kelola katalog produk, ketersediaan stok, dan penempatan etalase Tenun Ikat Nura.
        </p>
      </div>

      {/* 4 Statistics Cards (Skeleton Shimmer) */}
      <div className={styles.statsGrid}>
        {skeletonCards.map((item, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{item.label}</span>
              <span className={styles.statIcon}>{item.icon}</span>
            </div>
            <div className={styles.skeletonStatValue}>
              <div className={styles.skeletonShimmer} />
            </div>
            <span className={styles.statFootnote}>{item.footnote}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions Placeholder */}
      <div className={styles.quickActionsSection}>
        <h3 className={styles.sectionTitle}>Aksi Cepat</h3>
        <div className={styles.actionsGrid}>
          <div className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>+ Tambah Produk Baru</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Unggah foto karya tenun baru, atur harga, stok, dan kategori.
            </p>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>Kelola Semua Produk</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Lihat daftar katalog lengkap, perbarui stok, dan sesuaikan etalase.
            </p>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionTitle}>
              <span>Kelola Kategori</span>
              <span className={styles.actionArrow}>&rarr;</span>
            </div>
            <p className={styles.actionDesc}>
              Atur daftar kategori busana (Gaun, Outerwear, Sarimbit, dll).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

