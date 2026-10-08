'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductForm.module.css';
import { slugify } from '@/lib/format';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'Custom Size'];

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    categorySlug: 'outer',
    price: '',
    stock: 5,
    weight: 1000,
    tagline: '',
    description: '',
    story: '',
    images: ['/images/hero/hero-main.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Terracotta Gold', 'Warm Linen'],
    material: {
      type: 'Tenun Ikat Tradisional & Sutra Alam',
      composition: '80% Fine Woven Cotton, 20% Natural Silk',
      texture: 'Halus bertekstur dengan drape jatuh yang mewah',
      comfort: 'Adem, lembut di kulit, dan menyerap keringat',
    },
    isActive: true,
    isVisible: true,
    featured: false,
    signature: false,
    archPosition: 0,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(null);
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');

  // Image upload state
  const [uploadPreviews, setUploadPreviews] = useState([]); // { src: string, status: 'local'|'uploaded'|'legacy', file?: File }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch categories & populate initial data
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          // Filter out 'all'
          setCategories(data.categories.filter((c) => c.slug !== 'all'));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();

    if (initialData) {
      const existingImages = Array.isArray(initialData.images) && initialData.images.length > 0
        ? initialData.images
        : ['/images/hero/hero-main.jpg'];

      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        slug: initialData.slug || '',
        categorySlug: initialData.categorySlug || initialData.category || 'outer',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        stock: initialData.stock !== undefined ? initialData.stock : 0,
        weight: initialData.weight !== undefined ? initialData.weight : 1000,
        tagline: initialData.tagline || '',
        description: initialData.description || '',
        story: initialData.story || '',
        images: existingImages,
        sizes: Array.isArray(initialData.sizes) ? initialData.sizes : ['S', 'M', 'L', 'XL'],
        colors: Array.isArray(initialData.colors) ? initialData.colors : [],
        material: typeof initialData.material === 'object' && initialData.material !== null ? initialData.material : {
          type: 'Tenun Ikat Tradisional',
          composition: 'Katun Tenun Halus',
          texture: 'Halus bertekstur',
          comfort: 'Nyaman dan adem',
        },
        isActive: initialData.isActive !== false,
        isVisible: initialData.isVisible !== false,
        featured: Boolean(initialData.featured),
        signature: Boolean(initialData.signature),
        archPosition: typeof initialData.archPosition === 'number' ? initialData.archPosition : 0,
      });

      // Populate previews from existing images (legacy/uploaded URLs)
      setUploadPreviews(existingImages.map((url) => ({ src: url, status: 'legacy' })));
      setAutoSlug(false);
    } else {
      // New product: start with empty upload previews
      setUploadPreviews([]);
    }
  }, [initialData, isEdit]);

  // Handle Name change and auto slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? slugify(name) : prev.slug,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  // Handle basic input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Handle material subfields
  const handleMaterialChange = (subfield, value) => {
    setFormData((prev) => ({
      ...prev,
      material: {
        ...prev.material,
        [subfield]: value,
      },
    }));
  };

  // ----------------------------------------------------------------
  // Image upload management
  // ----------------------------------------------------------------

  /** Sync formData.images from the current uploadPreviews list */
  const syncImagesFromPreviews = (previews) => {
    const urls = previews.map((p) => p.src).filter(Boolean);
    setFormData((prev) => ({ ...prev, images: urls.length > 0 ? urls : ['/images/hero/hero-main.jpg'] }));
  };

  /** Handle file selection from <input type="file" /> */
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadError(null);

    // Validate each file before upload
    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_MB = 5;
    for (const f of selectedFiles) {
      if (!ALLOWED.includes(f.type)) {
        setUploadError(`File "${f.name}" tidak didukung. Gunakan JPG, PNG, atau WebP.`);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setUploadError(`File "${f.name}" terlalu besar. Maksimal ${MAX_MB} MB.`);
        return;
      }
    }

    // Optimistic local preview
    const localPreviews = selectedFiles.map((f) => ({
      src: URL.createObjectURL(f),
      status: 'uploading',
      file: f,
    }));

    setUploadPreviews((prev) => {
      const next = [...prev, ...localPreviews];
      return next;
    });

    setUploading(true);

    try {
      const formPayload = new FormData();
      selectedFiles.forEach((f) => formPayload.append('file', f));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formPayload,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Upload gagal.');
      }

      // Replace local blob URLs with real uploaded URLs
      setUploadPreviews((prev) => {
        const updated = [...prev];
        let urlIndex = 0;
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status === 'uploading') {
            const realUrl = result.urls[urlIndex];
            if (realUrl) {
              // Revoke the blob URL to avoid memory leak
              URL.revokeObjectURL(updated[i].src);
              updated[i] = { src: realUrl, status: 'uploaded' };
            } else {
              // Upload failed for this file
              URL.revokeObjectURL(updated[i].src);
              updated[i] = { src: '', status: 'error' };
            }
            urlIndex++;
          }
        }
        // Remove errored entries
        const clean = updated.filter((p) => p.status !== 'error' && p.src);
        syncImagesFromPreviews(clean);
        return clean;
      });

      if (result.errors && result.errors.length > 0) {
        setUploadError(result.errors.join('\n'));
      }
    } catch (err) {
      // Remove optimistic previews on failure
      setUploadPreviews((prev) => {
        const clean = prev.filter((p) => p.status !== 'uploading');
        clean.forEach((p) => { if (p.status === 'uploading') URL.revokeObjectURL(p.src); });
        syncImagesFromPreviews(clean);
        return clean;
      });
      setUploadError(err.message || 'Gagal mengupload foto.');
    } finally {
      setUploading(false);
      // Reset file input so user can re-select same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /** Remove an image from preview list */
  const handleRemovePreview = (index) => {
    setUploadPreviews((prev) => {
      const p = prev[index];
      if (p && (p.status === 'local' || p.status === 'uploading')) {
        URL.revokeObjectURL(p.src);
      }
      const next = prev.filter((_, i) => i !== index);
      syncImagesFromPreviews(next);
      return next;
    });
  };

  // Sizes management
  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const nextSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  const addCustomSize = (e) => {
    e.preventDefault();
    if (!newSizeInput.trim()) return;
    const size = newSizeInput.trim();
    if (!formData.sizes.includes(size)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, size] }));
    }
    setNewSizeInput('');
  };

  // Colors management
  const addColor = (e) => {
    e.preventDefault();
    if (!newColorInput.trim()) return;
    const color = newColorInput.trim();
    if (!formData.colors.includes(color)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, color] }));
    }
    setNewColorInput('');
  };

  const removeColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  // Validate on client before submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama produk wajib diisi.';
    if (!formData.sku.trim()) newErrors.sku = 'SKU produk wajib diisi.';
    if (!formData.categorySlug) newErrors.categorySlug = 'Kategori produk wajib dipilih.';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Harga produk harus berupa angka valid.';
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stok produk harus berupa angka valid (minimal 0).';
    }
    if (formData.weight === '' || isNaN(Number(formData.weight)) || Number(formData.weight) < 1 || !Number.isInteger(Number(formData.weight))) {
      newErrors.weight = 'Berat produk harus berupa angka bulat minimal 1 gram.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price, 10),
        stock: parseInt(formData.stock, 10),
        weight: parseInt(formData.weight, 10) || 1000,
        images: formData.images.filter((img) => img && img.trim() !== ''),
        archPosition: parseInt(formData.archPosition, 10) || 0,
      };

      const url = isEdit && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
        }
        throw new Error(result.error || 'Terjadi kesalahan saat menyimpan produk.');
      }

      setServerSuccess(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil dibuat!');

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1200);
    } catch (err) {
      setServerError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Link href="/admin/products" className={styles.backLink}>
            ← Kembali ke Daftar Produk
          </Link>
          <h1 className={styles.title}>
            {isEdit ? `Edit Produk: ${initialData?.name || ''}` : 'Tambah Produk Baru'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit
              ? 'Perbarui detail karya tenun ikat, stok, harga, dan pengaturan display.'
              : 'Tambahkan karya tenun ikat baru ke dalam katalog Tenun Ikat Nura.'}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {serverSuccess && (
        <div className={`${styles.alertBox} ${styles.alertSuccess}`}>
          ✓ {serverSuccess} Mengalihkan ke daftar produk...
        </div>
      )}

      {serverError && (
        <div className={`${styles.alertBox} ${styles.alertError}`}>
          ⚠️ {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* Main Column */}
          <div>
            {/* 1. Basic Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Informasi Utama</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nama Produk <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Contoh: Nusa Indah Outer"
                  value={formData.name}
                  onChange={handleNameChange}
                  disabled={submitting}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    SKU (Kode Unik) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.sku ? styles.inputError : ''}`}
                    placeholder="Contoh: NURA-OUT-001"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    disabled={submitting}
                  />
                  {errors.sku && <span className={styles.errorText}>{errors.sku}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Slug (URL Key) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="contoh: nusa-indah-outer"
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      handleChange('slug', slugify(e.target.value));
                    }}
                    disabled={submitting}
                  />
                  <span className={styles.hint}>
                    {autoSlug ? '(Auto dari nama produk)' : '(Manual edit)'}
                  </span>
                </div>
              </div>

              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Kategori <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={`${styles.select} ${errors.categorySlug ? styles.inputError : ''}`}
                    value={formData.categorySlug}
                    onChange={(e) => handleChange('categorySlug', e.target.value)}
                    disabled={submitting}
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categorySlug && (
                    <span className={styles.errorText}>{errors.categorySlug}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tagline Singkat</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Contoh: Elegansi Berakar dari Warisan Nusantara"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Deskripsi Produk</label>
                <textarea
                  rows="3"
                  className={styles.textarea}
                  placeholder="Deskripsi estetika, siluet, dan karakteristik busana tenun..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cerita Warisan / Narasi Tenun (Story)</label>
                <textarea
                  rows="3"
                  className={styles.textarea}
                  placeholder="Kisah asal motif, teknik penenunan tradisional, filosofi motif..."
                  value={formData.story}
                  onChange={(e) => handleChange('story', e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* 2. Pricing & Inventory */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Harga & Inventori</h2>
              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Harga (IDR) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                    placeholder="Contoh: 1450000"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    disabled={submitting}
                  />
                  {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Jumlah Stok Unit <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`${styles.input} ${errors.stock ? styles.inputError : ''}`}
                    placeholder="Contoh: 6"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    disabled={submitting}
                  />
                  {errors.stock && <span className={styles.errorText}>{errors.stock}</span>}
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                <label className={styles.label}>
                  Berat Produk (gram) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={`${styles.input} ${errors.weight ? styles.inputError : ''}`}
                  placeholder="Contoh: 1000"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  disabled={submitting}
                />
                <span className={styles.hint}>
                  Gunakan satuan gram (misal: 500 = 500g, 1000 = 1 kg). Digunakan untuk perhitungan ongkir otomatis RajaOngkir.
                </span>
                {errors.weight && <span className={styles.errorText}>{errors.weight}</span>}
              </div>
            </div>

            {/* 3. Media & Images */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                Foto Karya
                <span className={styles.primaryBadge}>Foto pertama = Foto Utama</span>
              </h2>

              {/* Upload Error Banner */}
              {uploadError && (
                <div className={styles.uploadErrorBox}>
                  ⚠️ {uploadError}
                  <button type="button" onClick={() => setUploadError(null)} className={styles.uploadErrorClose}>✕</button>
                </div>
              )}

              {/* Preview Grid */}
              {uploadPreviews.length > 0 && (
                <div className={styles.uploadPreviewGrid}>
                  {uploadPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={`${styles.uploadPreviewItem} ${index === 0 ? styles.uploadPreviewPrimary : ''}`}
                    >
                      <div className={styles.uploadPreviewThumb}>
                        {preview.status === 'uploading' ? (
                          <div className={styles.uploadSpinner}>⏳</div>
                        ) : (
                          <Image
                            src={preview.src}
                            alt={`Foto ${index + 1}`}
                            fill
                            sizes="120px"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            unoptimized={preview.status === 'legacy'}
                          />
                        )}
                        {index === 0 && (
                          <span className={styles.primaryLabel}>Utama</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePreview(index)}
                        className={styles.uploadRemoveBtn}
                        title={`Hapus foto ${index + 1}`}
                        disabled={submitting || uploading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                className={`${styles.uploadZone} ${uploading ? styles.uploadZoneLoading : ''}`}
                onClick={() => !uploading && !submitting && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  disabled={submitting || uploading}
                />
                <div className={styles.uploadZoneIcon}>
                  {uploading ? '⏳' : '📷'}
                </div>
                <div className={styles.uploadZoneText}>
                  {uploading
                    ? 'Sedang mengupload foto...'
                    : 'Klik untuk pilih foto dari komputer'}
                </div>
                <div className={styles.uploadZoneHint}>
                  JPG, PNG, WebP · Maks 5 MB per file · Bisa pilih banyak sekaligus
                </div>
              </div>
            </div>

            {/* 4. Material Details */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Spesifikasi Material</h2>
              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Jenis Tenun & Serat</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Contoh: Tenun Ikat NTT & Sutra Alam"
                    value={formData.material?.type || ''}
                    onChange={(e) => handleMaterialChange('type', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Komposisi Benang</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Contoh: 80% Fine Woven Cotton, 20% Natural Silk"
                    value={formData.material?.composition || ''}
                    onChange={(e) => handleMaterialChange('composition', e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className={styles.rowTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Karakter Tekstur</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Contoh: Halus bertekstur dengan drape jatuh mewah"
                    value={formData.material?.texture || ''}
                    onChange={(e) => handleMaterialChange('texture', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kenyamanan</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Contoh: Adem, lembut di kulit, menyerap keringat"
                    value={formData.material?.comfort || ''}
                    onChange={(e) => handleMaterialChange('comfort', e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* 5. Placement & Visibility */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Visibilitas & Penempatan</h2>

              {/* Status Aktif */}
              <div className={styles.switchGroup}>
                <div>
                  <div className={styles.switchLabel}>Status Aktif</div>
                  <div className={styles.switchDesc}>Produk aktif di katalog internal</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    disabled={submitting}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {/* Visible to Customer */}
              <div className={styles.switchGroup}>
                <div>
                  <div className={styles.switchLabel}>Tampilkan ke Publik</div>
                  <div className={styles.switchDesc}>Dapat dilihat oleh pelanggan di website</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => handleChange('isVisible', e.target.checked)}
                    disabled={submitting}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {/* Featured */}
              <div className={styles.switchGroup}>
                <div>
                  <div className={styles.switchLabel}>Featured Collection</div>
                  <div className={styles.switchDesc}>Tampil di sorotan koleksi utama</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleChange('featured', e.target.checked)}
                    disabled={submitting}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {/* Signature */}
              <div className={styles.switchGroup}>
                <div>
                  <div className={styles.switchLabel}>Karya Signature</div>
                  <div className={styles.switchDesc}>Tandai sebagai mahakarya eksklusif</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={formData.signature}
                    onChange={(e) => handleChange('signature', e.target.checked)}
                    disabled={submitting}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {/* Home Arch Gallery Position */}
              <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                <label className={styles.label}>Posisi Galeri Arch Beranda</label>
                <select
                  className={styles.select}
                  value={formData.archPosition}
                  onChange={(e) => handleChange('archPosition', Number(e.target.value))}
                  disabled={submitting}
                >
                  <option value={0}>0 — Tidak ditampilkan di Arch</option>
                  <option value={1}>Posisi 1 (Arch Utama Kiri)</option>
                  <option value={2}>Posisi 2 (Arch Tengah Kiri)</option>
                  <option value={3}>Posisi 3 (Arch Centerpiece)</option>
                  <option value={4}>Posisi 4 (Arch Tengah Kanan)</option>
                  <option value={5}>Posisi 5 (Arch Kanan)</option>
                </select>
                <span className={styles.hint}>
                  Menentukan kurasi visual lengkungan arch di homepage.
                </span>
              </div>
            </div>

            {/* 6. Variants & Sizes */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Ukuran (Sizes)</h2>
              <div className={styles.tagContainer}>
                {DEFAULT_SIZES.map((size) => {
                  const isSelected = formData.sizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      className={`${styles.tag} ${isSelected ? styles.tagActive : ''}`}
                      onClick={() => toggleSize(size)}
                      disabled={submitting}
                    >
                      {size} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size add */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Tambah ukuran lain (cth: XXL)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className={styles.addImageBtn}
                  style={{ marginTop: 0 }}
                  disabled={submitting}
                >
                  +
                </button>
              </div>
            </div>

            {/* 7. Color Palette */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Varian Warna</h2>
              <div className={styles.tagContainer}>
                {formData.colors.map((color) => (
                  <span key={color} className={`${styles.tag} ${styles.tagActive}`}>
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      style={{
                        background: 'none',
                        border: 'none',
                        marginLeft: '0.4rem',
                        cursor: 'pointer',
                        color: '#0f0e0d',
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Cth: Terracotta Gold"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={addColor}
                  className={styles.addImageBtn}
                  style={{ marginTop: 0 }}
                  disabled={submitting}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className={styles.actionsBar}>
          <Link href="/admin/products" className={styles.cancelBtn}>
            Batal
          </Link>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk Baru'}
          </button>
        </div>
      </form>
    </div>
  );
}
