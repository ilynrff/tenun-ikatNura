'use client';

import { useState } from 'react';
import siteData from '@/data/site.json';
import { useCart } from '@/context/CartContext';
import styles from './ProductModal.module.css';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    product && product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size'
  );

  if (!product) return null;

  // Admin WhatsApp Number from site.json or default to 6281252783496
  const waNumber = siteData.contact.whatsapp || '6281252783496';

  // Construct auto-formatted WhatsApp message template including exact Product Code (SKU)
  const waMessage = `Halo Admin Tenun Ikat Nura,

Saya tertarik dan ingin memesan / menanyakan produk berikut:
📌 *Nama Produk*: ${product.name}
🏷️ *Kode Produk*: ${product.sku || 'NURA-ITEM'}
📏 *Ukuran Terpilih*: ${selectedSize}
🧵 *Material*: ${product.material?.type || product.categoryLabel}
💰 *Harga*: ${product.price || 'Custom Order'}

Apakah produk ini masih tersedia atau bisa di-custom order? Terima kasih!`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, 1);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup Detail Produk">
          &times;
        </button>

        <div className={styles.grid}>
          {/* Left Column: Product Image */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <img
                src={product.images ? product.images[0] : '/images/hero/hero-main.jpg'}
                alt={product.name}
                className={styles.image}
              />
              <span className={styles.skuBadge}>KODE: {product.sku || 'NURA-ITEM'}</span>
            </div>
          </div>

          {/* Right Column: Product Information & WA/Cart Actions */}
          <div className={styles.infoCol}>
            <span className={styles.categoryLabel}>{product.categoryLabel || 'Koleksi Tenun'}</span>
            
            <h2 className={styles.title}>{product.name}</h2>
            
            {/* Highlighted SKU Banner */}
            <div className={styles.skuBanner}>
              <span className={styles.skuLabel}>KODE PRODUK:</span>
              <strong className={styles.skuValue}>{product.sku || 'NURA-ITEM'}</strong>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price || 'Sesuai Pesanan'}</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Material Details */}
            {product.material && (
              <div className={styles.materialBox}>
                <h4 className={styles.materialTitle}>Spesifikasi Material:</h4>
                <ul className={styles.materialList}>
                  <li><strong>Jenis:</strong> {product.material.type}</li>
                  {product.material.composition && (
                    <li><strong>Komposisi:</strong> {product.material.composition}</li>
                  )}
                  {product.material.comfort && (
                    <li><strong>Karakter:</strong> {product.material.comfort}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.sizeSection}>
                <label className={styles.sizeLabel}>Pilih Ukuran:</label>
                <div className={styles.sizeGrid}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`${styles.sizeChip} ${selectedSize === size ? styles.sizeChipActive : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Direct WhatsApp Order */}
            <div className={styles.actionArea}>
              <button
                type="button"
                onClick={handleAddToCart}
                className={styles.addToCartBtn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>TAMBAH KE KERANJANG</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waBtn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.59-1.048 3.834 3.792-.996z"/>
                </svg>
                <span>Pesan via WhatsApp Admin</span>
              </a>
              <p className={styles.waHint}>
                *Terhubung langsung ke Admin WA (<strong>0812-5278-3496</strong>) dengan Kode <strong>({product.sku})</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
