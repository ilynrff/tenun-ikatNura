'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './categories.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [currentProductCount, setCurrentProductCount] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Helper to auto-generate slug
  const toSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/categories');

      // If unauthorized, redirect directly to unified login
      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/categories';
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        throw new Error(data.error || `Gagal memuat data kategori (Status ${res.status}).`);
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.warn('[AdminCategoriesPage] Fetch warning:', err.message);
      setError(err.message || 'Terjadi kesalahan saat memuat data kategori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Client-side filtering & sorting
  const filteredCategories = useMemo(() => {
    let list = categories;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (statusFilter === 'active') {
      list = list.filter((c) => c.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((c) => !c.isActive);
    }

    return list;
  }, [categories, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return { total, active, inactive, totalProducts };
  }, [categories]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentId(null);
    setCurrentProductCount(0);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
    });
    setSlugManuallyEdited(false);
    setFormError(null);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (category) => {
    setModalMode('edit');
    setCurrentId(category.id);
    setCurrentProductCount(category.productCount || 0);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      isActive: category.isActive !== false,
    });
    setSlugManuallyEdited(true); // Don't auto-overwrite slug on edit unless user types
    setFormError(null);
    setModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setFormError(null);
  };

  // Name change handler with auto-slug in create mode
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: modalMode === 'create' && !slugManuallyEdited ? toSlug(val) : prev.slug,
    }));
  };

  // Slug change handler
  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: toSlug(e.target.value),
    }));
  };

  // Save (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    const cleanSlug = formData.slug.trim() || toSlug(formData.name);
    if (!cleanSlug) {
      setFormError('Slug kategori tidak valid.');
      return;
    }

    if (cleanSlug === 'all') {
      setFormError('Slug "all" dicadangkan untuk sistem katalog.');
      return;
    }

    setSubmitting(true);

    try {
      const url =
        modalMode === 'create'
          ? '/api/admin/categories'
          : `/api/admin/categories/${currentId}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: cleanSlug,
          description: formData.description.trim() || null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat menyimpan kategori.');
      }

      setSuccessMsg(
        modalMode === 'create'
          ? `Kategori "${formData.name}" berhasil dibuat.`
          : `Kategori "${formData.name}" berhasil diperbarui.`
      );

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active/Inactive status directly from table
  const handleToggleStatus = async (category) => {
    const newStatus = !category.isActive;
    try {
      setError(null);
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah status kategori.');
      }

      setSuccessMsg(
        `Status kategori "${category.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`
      );
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Gagal mengubah status kategori.');
    }
  };

  // Delete Category Safely
  const handleDelete = async (category) => {
    // Front guard: reject if products attached
    if (category.productCount > 0) {
      alert(
        `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${category.productCount} produk.\n\nPindahkan atau ubah kategori produk-produk tersebut terlebih dahulu.`
      );
      return;
    }

    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${category.name}" (${category.slug})?`
    );
    if (!isConfirmed) return;

    try {
      setError(null);
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus kategori.');
      }

      setSuccessMsg(`Kategori "${category.name}" berhasil dihapus.`);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Gagal menghapus kategori.');
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h2 className={styles.pageTitle}>Kelola Kategori</h2>
          <p className={styles.pageDesc}>
            Atur klasifikasi produk tenun, kelola visibilitas katalog, dan pantau asosiasi produk.
          </p>
        </div>
        <button type="button" onClick={handleOpenCreate} className={styles.addBtn}>
          <span>+</span> Tambah Kategori
        </button>
      </div>

      {/* ── Notifications ── */}
      {successMsg && (
        <div className={styles.alertSuccess}>
          <span>✓ {successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className={styles.alertCloseBtn}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className={styles.alertError}>
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={fetchCategories}
            className={styles.retryBtn}
            style={{
              marginLeft: 'auto',
              background: '#ffffff',
              border: '1px solid #f87171',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.8125rem',
              color: '#991b1b',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={() => setError(null)}
            className={styles.alertCloseBtn}
            aria-label="Tutup error"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Kategori</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Kategori Aktif</span>
          <span className={styles.statValue} style={{ color: '#065f46' }}>
            {stats.active}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Kategori Nonaktif</span>
          <span className={styles.statValue} style={{ color: '#991b1b' }}>
            {stats.inactive}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Produk Terkait</span>
          <span className={styles.statValue} style={{ color: '#1d4ed8' }}>
            {stats.totalProducts}
          </span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari kategori berdasarkan nama, slug, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.selectFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif Saja</option>
          <option value="inactive">Nonaktif Saja</option>
        </select>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <h3 className={styles.emptyTitle}>Memuat data kategori...</h3>
            <p className={styles.emptyDesc}>Menghubungkan ke database Tenun Ikat Nura.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <h3 className={styles.emptyTitle}>
              {search || statusFilter !== 'all'
                ? 'Tidak ada kategori yang sesuai filter'
                : 'Belum ada kategori'}
            </h3>
            <p className={styles.emptyDesc}>
              {search || statusFilter !== 'all'
                ? 'Coba ubah kata kunci pencarian atau reset filter status.'
                : 'Klik tombol "+ Tambah Kategori" untuk membuat kategori busana tenun pertama.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.th}>Kategori & Deskripsi</th>
                  <th className={styles.th}>Slug</th>
                  <th className={styles.th}>Produk Terkait</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id || cat.slug} className={styles.tableRow}>
                    <td className={styles.td}>
                      <div className={styles.categoryNameCell}>
                        <span className={styles.categoryName}>{cat.name}</span>
                        {cat.description && (
                          <span className={styles.categoryDesc}>{cat.description}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <code className={styles.slugCode}>{cat.slug}</code>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.countBadge} ${
                          cat.productCount > 0 ? styles.countBadgeActive : ''
                        }`}
                        title={`${cat.productCount || 0} produk menggunakan kategori ini`}
                      >
                        📦 {cat.productCount || 0} Produk
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={cat.isActive ? styles.badgeActive : styles.badgeInactive}
                      >
                        {cat.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div
                        className={styles.actionGroup}
                        style={{ justifyContent: 'flex-end' }}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title="Edit kategori"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`${styles.actionBtn} ${styles.toggleBtn}`}
                          title={cat.isActive ? 'Nonaktifkan kategori' : 'Aktifkan kategori'}
                        >
                          {cat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className={`${styles.actionBtn} ${
                            cat.productCount > 0
                              ? styles.deleteBtnDisabled
                              : styles.deleteBtn
                          }`}
                          title={
                            cat.productCount > 0
                              ? `Tidak dapat dihapus: terikat ke ${cat.productCount} produk`
                              : 'Hapus kategori'
                          }
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Dialog for Create/Edit ── */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className={styles.modalCloseBtn}
                disabled={submitting}
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalBody}>
                {formError && (
                  <div className={styles.alertError} style={{ margin: 0 }}>
                    <span>⚠️ {formError}</span>
                  </div>
                )}

                {/* Nama Kategori */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nama Kategori <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Contoh: Selendang & Syal"
                    value={formData.name}
                    onChange={handleNameChange}
                    disabled={submitting}
                    required
                    autoFocus
                  />
                  <span className={styles.formHint}>
                    Nama kategori yang akan ditampilkan pada filter katalog toko.
                  </span>
                </div>

                {/* Slug */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Slug URL <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="contoh: selendang-syal"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    disabled={submitting}
                    required
                  />
                  <span className={styles.formHint}>
                    Pengenal unik berbasis teks URL (hanya huruf kecil, angka, dan strip).
                  </span>
                </div>

                {/* Warning if slug is edited on category with products */}
                {modalMode === 'edit' && currentProductCount > 0 && (
                  <div className={styles.formWarning}>
                    ℹ️ <strong>Perhatian:</strong> Kategori ini saat ini digunakan oleh{' '}
                    <strong>{currentProductCount} produk</strong>. Jika Anda mengubah slug,
                    sistem akan secara otomatis dan aman memperbarui relasi seluruh produk
                    terkait dalam transaksi database.
                  </div>
                )}

                {/* Deskripsi */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deskripsi (Opsional)</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Deskripsi singkat mengenai koleksi dalam kategori ini..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </div>

                {/* Status Aktif */}
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      disabled={submitting}
                    />
                    <span>
                      <strong>Aktifkan Kategori</strong> (tampilkan di etalase katalog customer)
                    </span>
                  </label>
                  <span className={styles.formHint} style={{ marginLeft: '1.75rem' }}>
                    Jika dinonaktifkan, tab kategori tidak akan muncul pada halaman publik.
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.modalCancelBtn}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Menyimpan...'
                    : modalMode === 'create'
                    ? 'Buat Kategori'
                    : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
