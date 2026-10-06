'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/format';
import siteData from '@/data/site.json';
import styles from './CheckoutPage.module.css';

// Simple email regex validation
function isValidEmail(email) {
  if (!email || !email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { cart, subtotal, rawSubtotal, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerWhatsapp: '',
    customerEmail: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    note: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submission & Result States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submittedCustomer, setSubmittedCustomer] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // 1. Auth Gate: Redirect unauthenticated guest to login
  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn && !createdOrder) {
      router.replace('/login?callbackUrl=/checkout');
    }
  }, [isLoadingAuth, isLoggedIn, createdOrder, router]);

  // 2. Pre-fill customer information from authenticated user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
        customerWhatsapp: prev.customerWhatsapp || user.phone || '',
      }));
    }
  }, [user]);

  // Payment Config from site.json (fallback provided)
  const paymentInfo = siteData?.payment || {
    bank: 'BCA',
    accountNumber: '1234567890',
    accountName: 'TENUN IKAT NURA',
  };

  // WhatsApp Admin Config
  const adminWa = siteData?.contact?.whatsapp || '6281252783496';

  const handleCopyAccount = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paymentInfo.accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nama lengkap wajib diisi.';
    }

    if (!formData.customerWhatsapp.trim()) {
      newErrors.customerWhatsapp = 'Nomor WhatsApp wajib diisi.';
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Alamat pengiriman lengkap wajib diisi.';
    }

    if (formData.customerEmail && !isValidEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Format email tidak valid (contoh: nama@domain.com).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (cart.length === 0) {
      setSubmitError('Keranjang belanja Anda masih kosong. Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (!validateForm()) {
      setSubmitError('Mohon lengkapi seluruh informasi wajib bertanda bintang (*).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerWhatsapp: formData.customerWhatsapp.trim(),
        customerEmail: formData.customerEmail.trim() || undefined,
        shippingAddress: formData.shippingAddress.trim(),
        shippingCity: formData.shippingCity.trim() || undefined,
        shippingPostalCode: formData.shippingPostalCode.trim() || undefined,
        note: formData.note.trim() || undefined,
        items: cart.map((item) => ({
          productId: String(item.productId || item.id),
          size: item.size || null,
          variant: item.variant || null,
          quantity: item.quantity || 1,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409 || (data.message && data.message.toLowerCase().includes('stok'))) {
          throw new Error('Maaf, stok salah satu produk sudah berubah. Silakan kembali ke keranjang.');
        }
        throw new Error(data.message || 'Pesanan gagal dibuat. Silakan coba lagi.');
      }

      // Order created successfully
      setSubmittedCustomer({ ...formData });
      setCreatedOrder(data.order);
      clearCart();

      // Scroll to top
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setSubmitError(err.message || 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render SUCCESS STATE ────────────────────────────────────
  if (createdOrder) {
    const formattedTotal = formatRupiah(createdOrder.total);
    const waMessage = `Halo Admin Tenun Ikat Nura, saya ingin mengonfirmasi pembayaran pesanan.

Nomor Pesanan: ${createdOrder.orderNumber}
Nama: ${submittedCustomer?.customerName || 'Pelanggan'}
Total Pembayaran: ${formattedTotal}
Metode Pembayaran: ${paymentInfo.bank}

Saya sudah melakukan pembayaran. Mohon dilakukan pengecekan dan konfirmasi. Terima kasih.`;

    const waUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

    return (
      <>
        <Navbar />
        <main className={styles.checkoutPage}>
          <div className={styles.container}>
            <div className={styles.successContainer}>
              <ScrollReveal>
                <div className={styles.successCard}>
                  <div className={styles.successIconWrapper}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>

                  <span className={styles.eyebrow}>PESANAN DITERIMA</span>
                  <h1 className={styles.successTitle}>Pesanan Berhasil Dibuat</h1>
                  <p className={styles.successSubtitle}>
                    Terima kasih atas pesanan Anda. Silakan selesaikan pembayaran agar pesanan dapat segera kami proses.
                  </p>

                  {/* 1. Detail Ringkasan Pesanan */}
                  <div className={styles.orderReceipt}>
                    <div className={styles.receiptHeader}>
                      <div>
                        <div className={styles.orderNumberLabel}>NOMOR PESANAN</div>
                        <div className={styles.orderNumberValue}>{createdOrder.orderNumber}</div>
                      </div>
                      <span className={styles.statusBadge}>Menunggu Pembayaran</span>
                    </div>

                    <div className={styles.receiptGrid}>
                      <div>
                        <div className={styles.receiptItemLabel}>NAMA PEMESAN</div>
                        <div className={styles.receiptItemValue}>{submittedCustomer?.customerName}</div>
                      </div>
                      <div>
                        <div className={styles.receiptItemLabel}>WHATSAPP</div>
                        <div className={styles.receiptItemValue}>{submittedCustomer?.customerWhatsapp}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className={styles.receiptItemLabel}>ALAMAT PENGIRIMAN</div>
                        <div className={styles.receiptItemValue}>
                          {submittedCustomer?.shippingAddress}
                          {submittedCustomer?.shippingCity ? `, ${submittedCustomer.shippingCity}` : ''}
                          {submittedCustomer?.shippingPostalCode ? ` ${submittedCustomer.shippingPostalCode}` : ''}
                        </div>
                      </div>
                      {submittedCustomer?.note && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div className={styles.receiptItemLabel}>CATATAN</div>
                          <div className={styles.receiptItemValue}>{submittedCustomer.note}</div>
                        </div>
                      )}
                    </div>

                    <div className={styles.receiptTotalRow}>
                      <span className={styles.receiptTotalLabel}>TOTAL PEMBAYARAN</span>
                      <span className={styles.receiptTotalValue}>{formattedTotal}</span>
                    </div>
                  </div>

                  {/* 2. Informasi Rekening Pembayaran */}
                  <div className={styles.paymentCard}>
                    <div className={styles.paymentCardHeader}>
                      <h3 className={styles.paymentCardTitle}>
                        <span>💳</span> Informasi Pembayaran
                      </h3>
                      <span className={styles.bankBadge}>{paymentInfo.bank}</span>
                    </div>

                    <div className={styles.paymentAccountBox}>
                      <div className={styles.receiptItemLabel}>TRANSFER KE REKENING:</div>
                      <div className={styles.accountRow}>
                        <div className={styles.accountNumberWrapper}>
                          <span className={styles.accountNumber}>{paymentInfo.accountNumber}</span>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className={`${styles.copyBtn} ${isCopied ? styles.copiedBtn : ''}`}
                            aria-label="Salin nomor rekening"
                          >
                            {isCopied ? (
                              <>
                                <span>✓</span>
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <span>📋</span>
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className={styles.accountHolder}>
                        a.n. <strong>{paymentInfo.accountName}</strong>
                      </div>
                    </div>

                    <div className={styles.amountToPayBox}>
                      <span className={styles.amountToPayLabel}>Total yang Harus Dibayar:</span>
                      <span className={styles.amountToPayValue}>{formattedTotal}</span>
                    </div>
                  </div>

                  {/* 3. Instruksi Pembayaran */}
                  <div className={styles.instructionBox}>
                    <div className={styles.instructionTitle}>PETUNJUK PEMBAYARAN:</div>
                    <p className={styles.instructionText}>
                      Silakan lakukan transfer sesuai nominal total pembayaran. Setelah melakukan transfer, konfirmasi pembayaran melalui WhatsApp agar pesanan dapat segera kami proses.
                    </p>
                  </div>

                  {/* 4. Tombol WhatsApp & Aksi */}
                  <div className={styles.successActions}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappBtn}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.12.553 4.11 1.523 5.838l-1.617 5.906 6.077-1.594c1.657.904 3.557 1.417 5.578 1.417 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                      </svg>
                      Konfirmasi Pembayaran via WhatsApp
                    </a>

                    <Link href="/collections" className={styles.backHomeBtn}>
                      Jelajahi Koleksi Lainnya
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Render EMPTY CART STATE ─────────────────────────────────
  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className={styles.checkoutPage}>
          <div className={styles.container}>
            <div className={styles.header}>
              <span className={styles.eyebrow}>PEMESANAN</span>
              <h1 className={styles.title}>Checkout</h1>
            </div>

            <ScrollReveal>
              <div className={styles.emptyCard}>
                <div className={styles.emptyIconWrapper}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h2 className={styles.emptyTitle}>Keranjang Masih Kosong</h2>
                <p className={styles.emptyDesc}>
                  Anda belum menambahkan karya tenun ke dalam keranjang belanja. Silakan pilih busana warisan favorit Anda terlebih dahulu.
                </p>
                <Link href="/collections" className={styles.shopNowBtn}>
                  Kembali ke Koleksi
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Render CHECKOUT FORM & SUMMARY ──────────────────────────
  const totalItemCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <>
      <Navbar />
      <main className={styles.checkoutPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>PEMESANAN</span>
            <h1 className={styles.title}>Checkout</h1>
            <p className={styles.subtitle}>
              Lengkapi data pengiriman di bawah ini untuk menyelesaikan pesanan karya tenun ikat pilihan Anda.
            </p>
          </div>

          <div className={styles.checkoutGrid}>
            {/* ── Left Column: Form Customer ──────────────────── */}
            <ScrollReveal>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <span className={styles.stepBadge}>1</span> Informasi Pengiriman
                  </h2>
                </div>

                <div className={styles.guestNote}>
                  ✨ <strong>Guest Checkout:</strong> Anda tidak perlu membuat akun untuk melakukan pemesanan. Pesanan akan langsung diteruskan ke WhatsApp Admin kami.
                </div>

                <form onSubmit={handleSubmitOrder} noValidate>
                  {/* Nama Lengkap */}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="customerName">
                      Nama Lengkap <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
                      placeholder="Contoh: Raden Ayu Sekar"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.customerName && (
                      <span className={styles.errorText}>{errors.customerName}</span>
                    )}
                  </div>

                  {/* WhatsApp & Email Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="customerWhatsapp">
                        Nomor WhatsApp <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="customerWhatsapp"
                        type="tel"
                        className={`${styles.input} ${errors.customerWhatsapp ? styles.inputError : ''}`}
                        placeholder="Contoh: 081234567890"
                        value={formData.customerWhatsapp}
                        onChange={(e) => handleInputChange('customerWhatsapp', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.customerWhatsapp && (
                        <span className={styles.errorText}>{errors.customerWhatsapp}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="customerEmail">
                        Email <span className={styles.optional}>(Opsional)</span>
                      </label>
                      <input
                        id="customerEmail"
                        type="email"
                        className={`${styles.input} ${errors.customerEmail ? styles.inputError : ''}`}
                        placeholder="nama@email.com"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.customerEmail && (
                        <span className={styles.errorText}>{errors.customerEmail}</span>
                      )}
                    </div>
                  </div>

                  {/* Alamat Pengiriman */}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingAddress">
                      Alamat Lengkap <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="shippingAddress"
                      rows={3}
                      className={`${styles.textarea} ${errors.shippingAddress ? styles.inputError : ''}`}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.shippingAddress && (
                      <span className={styles.errorText}>{errors.shippingAddress}</span>
                    )}
                  </div>

                  {/* Kota & Kode Pos Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="shippingCity">
                        Kota / Kabupaten <span className={styles.optional}>(Opsional)</span>
                      </label>
                      <input
                        id="shippingCity"
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: Jepara / Jakarta Selatan"
                        value={formData.shippingCity}
                        onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="shippingPostalCode">
                        Kode Pos <span className={styles.optional}>(Opsional)</span>
                      </label>
                      <input
                        id="shippingPostalCode"
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: 59411"
                        value={formData.shippingPostalCode}
                        onChange={(e) => handleInputChange('shippingPostalCode', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Catatan Pesanan */}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="note">
                      Catatan Pesanan <span className={styles.optional}>(Opsional)</span>
                    </label>
                    <textarea
                      id="note"
                      rows={2}
                      className={styles.textarea}
                      placeholder="Permintaan khusus ukuran, kemasan kado, instruksi kurir, dll."
                      value={formData.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              </div>
            </ScrollReveal>

            {/* ── Right Column: Order Summary ─────────────────── */}
            <ScrollReveal>
              <div className={styles.summarySticky}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <span className={styles.stepBadge}>2</span> Ringkasan Pesanan
                    </h2>
                    <span className={styles.itemsCount}>({totalItemCount} item)</span>
                  </div>

                  {/* Item List */}
                  <div className={styles.itemsList}>
                    {cart.map((item) => {
                      const itemPrice = item.price || item.numPrice || 0;
                      const itemSubtotal = itemPrice * (item.quantity || 1);

                      return (
                        <div key={item.key || `${item.id}-${item.size}-${item.variant}`} className={styles.itemRow}>
                          <div className={styles.itemImageWrapper}>
                            <img
                              src={item.image || '/images/hero/hero-main.jpg'}
                              alt={item.name}
                              className={styles.itemImage}
                            />
                          </div>
                          <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{item.name}</h3>
                            <div className={styles.itemMeta}>
                              SKU: {item.sku || 'NURA-ITEM'} | Size: {item.size || 'Free Size'}
                              {item.variant ? ` | Varian: ${item.variant}` : ''}
                            </div>
                            <div className={styles.itemQtyPrice}>
                              {item.quantity} × {formatRupiah(itemPrice)}
                            </div>
                          </div>
                          <div className={styles.itemSubtotal}>
                            {formatRupiah(itemSubtotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Breakdown */}
                  <div className={styles.pricingDetails}>
                    <div className={styles.priceRow}>
                      <span>Subtotal Produk</span>
                      <span>{subtotal}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>Biaya Pengiriman</span>
                      <span style={{ color: '#6B5749', fontStyle: 'italic' }}>Rp 0 (Konfirmasi Admin)</span>
                    </div>
                    <div className={styles.priceRowTotal}>
                      <span className={styles.totalLabel}>TOTAL</span>
                      <span className={styles.totalAmount}>{subtotal}</span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {submitError && (
                    <div className={styles.errorBanner} role="alert">
                      <span className={styles.errorIcon}>⚠</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className={styles.submitBtn}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.spinner}></span>
                        <span>Memproses Pesanan...</span>
                      </>
                    ) : (
                      <span>Buat Pesanan</span>
                    )}
                  </button>

                  <div className={styles.badgesRow}>
                    <div className={styles.badgeItem}>
                      <span>🌿</span> 100% Tenun Nusantara
                    </div>
                    <div className={styles.badgeItem}>
                      <span>💬</span> Konfirmasi Admin WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
