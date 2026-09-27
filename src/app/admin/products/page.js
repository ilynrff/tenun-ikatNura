'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './products.module.css';

/* ------------------------------------------------------------------ */
/* HELPERS                                                              */
/* ------------------------------------------------------------------ */

function getStockStatus(stock) {
  if (stock === 0) return { label: 'Stok Habis', key: 'empty' };
  if (stock <= 3) return { label: 'Stok Menipis', key: 'low' };
  return { label: 'Tersedia', key: 'ok' };
}

function ProductStatusBadge({ isActive }) {
  return (
    <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

function StockBadge({ stock }) {
  const { label, key } = getStockStatus(stock);
  return (
    <span className={`${styles.stockBadge} ${styles[`stock_${key}`]}`}>
      {label}
    </span>
  );
}

function FeaturedBadge({ featured }) {
  if (!featured) return <span className={styles.dash}>—</span>;
  return <span className={styles.featuredBadge}>✦ Featured</span>;
}

function ProductImage({ src, name }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={styles.imgPlaceholder} aria-label={`Gambar placeholder untuk ${name}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }
  return (
    <div className={styles.imgWrapper}>
      <Image
        src={src}
        alt={name}
        fill
        sizes="56px"
        className={styles.productImg}
        onError={() => setError(true)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SKELETON                                                             */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonImg} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EMPTY STATE                                                          */
/* ------------------------------------------------------------------ */

function EmptyState({ filtered, onReset }) {
  if (filtered) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>Tidak ada produk yang sesuai</h3>
        <p className={styles.emptyDesc}>
          Coba ubah kata kunci pencarian atau filter yang dipilih.
        </p>
        <button type="button" onClick={onReset} className={styles.resetBtn}>
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📦</div>
      <h3 className={styles.emptyTitle}>Belum ada produk</h3>
      <p className={styles.emptyDesc}>
        Tambahkan produk pertama Tenun Ikat Nura untuk mulai mengelola katalog.
      </p>
      <Link href="/admin/products/new" className={styles.addBtn}>
        + Tambah Produk
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PRODUCT ROW — desktop table row                                      */
/* ------------------------------------------------------------------ */

function ProductRow({ product, onDelete }) {
  const stockStatus = getStockStatus(product.stock);
  const editUrl = `/admin/products/${product.id || product.slug}/edit`;

  return (
    <tr className={styles.tableRow}>
      {/* Image + Name */}
      <td className={styles.tdProduct}>
        <div className={styles.productCell}>
          <ProductImage src={product.primaryImage} name={product.name} />
          <div className={styles.productInfo}>
            <span className={styles.productName}>{product.name}</span>
            {product.signature && <span className={styles.signatureMark}>Signature</span>}
          </div>
        </div>
      </td>
      {/* SKU */}
      <td className={styles.tdSku}>
        <span className={styles.skuText}>{product.sku}</span>
      </td>
      {/* Kategori */}
      <td className={styles.tdCategory}>
        <span className={styles.categoryChip}>{product.categoryLabel}</span>
      </td>
      {/* Harga */}
      <td className={styles.tdPrice}>
        <span className={styles.priceText}>{product.formattedPrice}</span>
      </td>
      {/* Stok */}
      <td className={styles.tdStock}>
        <div className={styles.stockCell}>
          <span className={`${styles.stockBadge} ${styles[`stock_${stockStatus.key}`]}`}>
            {stockStatus.label}
          </span>
          <span className={styles.stockNum}>({product.stock})</span>
        </div>
      </td>
      {/* Status */}
      <td className={styles.tdStatus}>
        <ProductStatusBadge isActive={product.isActive} />
      </td>
      {/* Featured */}
      <td className={styles.tdFeatured}>
        <FeaturedBadge featured={product.featured} />
      </td>
      {/* Aksi */}
      <td className={styles.tdAction}>
        <div className={styles.actionGroup}>
          <Link href={editUrl} className={styles.editBtn}>
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className={styles.deleteBtn}
            title="Hapus produk"
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* PRODUCT CARD — mobile view                                           */
/* ------------------------------------------------------------------ */

function ProductCard({ product, onDelete }) {
  const stockStatus = getStockStatus(product.stock);
  const editUrl = `/admin/products/${product.id || product.slug}/edit`;

  return (
    <div className={styles.productCard}>
      <div className={styles.cardTop}>
        <ProductImage src={product.primaryImage} name={product.name} />
        <div className={styles.cardMain}>
          <span className={styles.productName}>{product.name}</span>
          {product.signature && <span className={styles.signatureMark}>Signature</span>}
          <span className={styles.skuText}>{product.sku}</span>
          <span className={styles.categoryChip}>{product.categoryLabel}</span>
        </div>
      </div>
      <div className={styles.cardMeta}>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Harga</span>
          <span className={styles.priceText}>{product.formattedPrice}</span>
        </div>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Stok</span>
          <div className={styles.stockCell}>
            <span className={`${styles.stockBadge} ${styles[`stock_${stockStatus.key}`]}`}>
              {stockStatus.label}
            </span>
            <span className={styles.stockNum}>({product.stock})</span>
          </div>
        </div>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Status</span>
          <ProductStatusBadge isActive={product.isActive} />
        </div>
        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Featured</span>
          <FeaturedBadge featured={product.featured} />
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Link href={editUrl} className={styles.editBtn}>
          Edit Produk
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className={styles.deleteBtn}
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN PAGE                                                            */
/* ------------------------------------------------------------------ */

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ---- Fetch data on mount ---- */
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
        ]);

        if (!prodRes.ok) throw new Error('Gagal memuat data produk.');
        if (!catRes.ok) throw new Error('Gagal memuat data kategori.');

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setAllProducts(prodData.products || []);
        setCategories(catData.categories || []);
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ---- Client-side filtering ---- */
  const filtered = useMemo(() => {
    let list = allProducts;

    // Search: name, SKU, categoryLabel
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter && categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Status
    if (statusFilter === 'active') {
      list = list.filter((p) => p.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((p) => !p.isActive);
    }

    return list;
  }, [allProducts, search, categoryFilter, statusFilter]);

  const isFiltered =
    search.trim() !== '' || categoryFilter !== 'all' || statusFilter !== 'all';

  function handleReset() {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
  }

  async function handleDeleteProduct(product) {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${product.name}" (${product.sku})?`
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus produk.');
      }

      setAllProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  }

  /* ---- Render ---- */
  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h2 className={styles.pageTitle}>Produk</h2>
          <p className={styles.pageDesc}>Kelola katalog produk Tenun Ikat Nura.</p>
        </div>
        <Link href="/admin/products/new" className={styles.addBtn}>
          + Tambah Produk
        </Link>
      </div>

      {/* ── Toolbar: Search + Filters ── */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="product-search"
            type="search"
            className={styles.searchInput}
            placeholder="Cari nama produk, SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari produk"
          />
        </div>

        {/* Category Filter */}
        <select
          id="product-category-filter"
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter kategori"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          id="product-status-filter"
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter status"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>

        {/* Reset */}
        {isFiltered && (
          <button type="button" onClick={handleReset} className={styles.resetBtn} aria-label="Reset semua filter">
            Reset
          </button>
        )}
      </div>

      {/* ── Result Count ── */}
      {!loading && !error && (
        <div className={styles.resultCount} aria-live="polite">
          {filtered.length === 0
            ? 'Tidak ada produk ditemukan.'
            : `Menampilkan ${filtered.length} dari ${allProducts.length} produk`}
        </div>
      )}

      {/* ── States ── */}
      {loading && <Skeleton />}

      {!loading && error && (
        <div className={styles.errorState}>
          <span>⚠️</span>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()} className={styles.resetBtn}>
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState filtered={isFiltered} onReset={handleReset} />
      )}

      {/* ── Desktop Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thProduct}>Produk</th>
                  <th className={styles.thSku}>SKU</th>
                  <th className={styles.thCategory}>Kategori</th>
                  <th className={styles.thPrice}>Harga</th>
                  <th className={styles.thStock}>Stok</th>
                  <th className={styles.thStatus}>Status</th>
                  <th className={styles.thFeatured}>Featured</th>
                  <th className={styles.thAction}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className={styles.mobileList}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
