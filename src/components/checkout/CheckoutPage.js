'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

// ── Constants ──────────────────────────────────────────────────
const COURIERS = [
  { code: 'jne',     label: 'JNE' },
  { code: 'pos',     label: 'POS' },
  { code: 'tiki',    label: 'TIKI' },
  { code: 'sicepat', label: 'SiCepat' },
  { code: 'jnt',     label: 'J&T' },
];

const DEBOUNCE_MS = 500;

// ── Helpers ────────────────────────────────────────────────────
function isValidEmail(email) {
  if (!email || !email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Component ──────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { cart, subtotal, rawSubtotal, clearCart } = useCart();

  // ── Form State ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    customerName: '',
    customerWhatsapp: '',
    customerEmail: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    note: '',
  });

  // ── Destination Search State ────────────────────────────────
  const [destQuery, setDestQuery]         = useState('');
  const [destResults, setDestResults]     = useState([]);
  const [destLoading, setDestLoading]     = useState(false);
  const [destError, setDestError]         = useState('');
  const [destSelected, setDestSelected]   = useState(null);
  const [showDestDrop, setShowDestDrop]   = useState(false);
  const destRef   = useRef(null);
  const debounceRef = useRef(null);

  // ── Courier / Service State ─────────────────────────────────
  const [activeCourier, setActiveCourier]       = useState('jne');
  const [services, setServices]                 = useState([]);
  const [servicesLoading, setServicesLoading]   = useState(false);
  const [servicesError, setServicesError]       = useState('');
  const [selectedService, setSelectedService]   = useState(null);

  // ── Submission States ───────────────────────────────────────
  const [errors, setErrors]               = useState({});
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitError, setSubmitError]     = useState(null);
  const [createdOrder, setCreatedOrder]   = useState(null);
  const [submittedCustomer, setSubmittedCustomer] = useState(null);
  const [isCopied, setIsCopied]           = useState(false);

  // ── Config ──────────────────────────────────────────────────
  const paymentInfo = siteData?.payment || {
    bank: 'BCA',
    accountNumber: '1234567890',
    accountName: 'TENUN IKAT NURA',
  };
  const adminWa = siteData?.contact?.whatsapp || '6281252783496';

  // ── Auth Gate ───────────────────────────────────────────────
  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn && !createdOrder) {
      router.replace('/login?callbackUrl=/checkout');
    }
  }, [isLoadingAuth, isLoggedIn, createdOrder, router]);

  // ── Pre-fill from user ──────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName:     prev.customerName     || user.name  || '',
        customerEmail:    prev.customerEmail    || user.email || '',
        customerWhatsapp: prev.customerWhatsapp || user.phone || '',
      }));
    }
  }, [user]);

  // ── Close dropdown on outside click ────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Destination search ──────────────────────────────────────
  const searchDestination = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setDestResults([]);
      setDestError('');
      return;
    }
    setDestLoading(true);
    setDestError('');
    try {
      const res  = await fetch(`/api/shipping/destination?search=${encodeURIComponent(query.trim())}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDestError(data.error || 'Gagal mencari tujuan pengiriman.');
        setDestResults([]);
        return;
      }
      setDestResults(data.data || []);
      setShowDestDrop(true);
    } catch {
      setDestError('Koneksi gagal. Periksa jaringan Anda.');
      setDestResults([]);
    } finally {
      setDestLoading(false);
    }
  }, []);

  const handleDestQueryChange = (e) => {
    const val = e.target.value;
    setDestQuery(val);
    if (!val.trim()) {
      setDestSelected(null);
      setDestResults([]);
      setServices([]);
      setSelectedService(null);
      setServicesError('');
      setShowDestDrop(false);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDestination(val), DEBOUNCE_MS);
  };

  const handleDestSelect = (item) => {
    setDestSelected(item);
    setDestQuery('');
    setDestResults([]);
    setShowDestDrop(false);
    setDestError('');
    setServices([]);
    setSelectedService(null);
    setServicesError('');
    setFormData((prev) => ({
      ...prev,
      shippingCity:       item.city       || prev.shippingCity,
      shippingPostalCode: item.postalCode || prev.shippingPostalCode,
    }));
    fetchShippingCost(item.id, activeCourier);
  };

  const handleDestClear = () => {
    setDestSelected(null);
    setDestQuery('');
    setDestResults([]);
    setServices([]);
    setSelectedService(null);
    setServicesError('');
    setShowDestDrop(false);
  };

  // ── Fetch shipping costs ────────────────────────────────────
  const fetchShippingCost = useCallback(async (destinationId, courier) => {
    if (!destinationId || !courier) return;
    setServicesLoading(true);
    setServicesError('');
    setSelectedService(null);
    try {
      const payload = {
        destinationId,
        courier,
        items: cart.map((item) => ({
          productId: String(item.productId || item.id),
          quantity:  item.quantity || 1,
        })),
      };
      const res  = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setServicesError(data.error || 'Gagal memuat tarif pengiriman.');
        setServices([]);
        return;
      }
      if (!data.data || data.data.length === 0) {
        setServicesError(`Kurir ${courier.toUpperCase()} tidak tersedia untuk tujuan ini. Coba kurir lain.`);
        setServices([]);
        return;
      }
      setServices(data.data);
    } catch {
      setServicesError('Koneksi gagal saat memuat tarif pengiriman.');
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [cart]);

  const handleCourierChange = (courierCode) => {
    setActiveCourier(courierCode);
    setSelectedService(null);
    if (destSelected) fetchShippingCost(destSelected.id, courierCode);
  };

  // ── Form ────────────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim())
      newErrors.customerName = 'Nama lengkap wajib diisi.';
    if (!formData.customerWhatsapp.trim())
      newErrors.customerWhatsapp = 'Nomor WhatsApp wajib diisi.';
    if (!formData.shippingAddress.trim())
      newErrors.shippingAddress = 'Alamat pengiriman lengkap wajib diisi.';
    if (formData.customerEmail && !isValidEmail(formData.customerEmail))
      newErrors.customerEmail = 'Format email tidak valid (contoh: nama@domain.com).';
    if (!destSelected)
      newErrors.destination = 'Pilih kota/kecamatan tujuan pengiriman dari daftar.';
    if (!selectedService)
      newErrors.service = 'Pilih layanan pengiriman terlebih dahulu.';
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
        customerName:       formData.customerName.trim(),
        customerWhatsapp:   formData.customerWhatsapp.trim(),
        customerEmail:      formData.customerEmail.trim() || undefined,
        shippingAddress:    formData.shippingAddress.trim(),
        shippingCity:       formData.shippingCity.trim()       || undefined,
        shippingPostalCode: formData.shippingPostalCode.trim() || undefined,
        note:               formData.note.trim() || undefined,
        destinationId:      destSelected.id,
        courier:            selectedService.courier.toLowerCase(),
        service:            selectedService.service,
        shippingCost:       selectedService.cost,
        items: cart.map((item) => ({
          productId: String(item.productId || item.id),
          size:      item.size    || null,
          variant:   item.variant || null,
          quantity:  item.quantity || 1,
        })),
      };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 409 || (data.message && data.message.toLowerCase().includes('stok'))) {
          throw new Error('Maaf, stok salah satu produk sudah berubah. Silakan kembali ke keranjang.');
        }
        throw new Error(data.message || 'Pesanan gagal dibuat. Silakan coba lagi.');
      }
      setSubmittedCustomer({ ...formData, selectedService, destSelected });
      setCreatedOrder(data.order);
      clearCart();
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAccount = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paymentInfo.accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // ── Computed ─────────────────────────────────────────────
  const shippingCostDisplay = selectedService ? formatRupiah(selectedService.cost) : null;
  const totalDisplay = selectedService
    ? formatRupiah((rawSubtotal || 0) + selectedService.cost)
    : subtotal;
  const canSubmit = !isSubmitting && cart.length > 0 && Boolean(destSelected) && Boolean(selectedService);

  // ── SUCCESS ───────────────────────────────────────────────
  if (createdOrder) {
    const formattedTotal = formatRupiah(createdOrder.total);
    const waMessage = `Halo Admin Tenun Ikat Nura, saya ingin mengonfirmasi pembayaran pesanan.\n\nNomor Pesanan: ${createdOrder.orderNumber}\nNama: ${submittedCustomer?.customerName || 'Pelanggan'}\nTotal Pembayaran: ${formattedTotal}\nMetode Pembayaran: ${paymentInfo.bank}\n\nSaya sudah melakukan pembayaran. Mohon dilakukan pengecekan dan konfirmasi. Terima kasih.`;
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
                      {submittedCustomer?.destSelected && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div className={styles.receiptItemLabel}>TUJUAN PENGIRIMAN</div>
                          <div className={styles.receiptItemValue}>{submittedCustomer.destSelected.label}</div>
                        </div>
                      )}
                      {submittedCustomer?.selectedService && (
                        <div>
                          <div className={styles.receiptItemLabel}>KURIR &amp; LAYANAN</div>
                          <div className={styles.receiptItemValue}>
                            {submittedCustomer.selectedService.courier} {submittedCustomer.selectedService.service}
                            {' — '}{formatRupiah(createdOrder.shippingCost)}
                          </div>
                        </div>
                      )}
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

                  <div className={styles.paymentCard}>
                    <div className={styles.paymentCardHeader}>
                      <h3 className={styles.paymentCardTitle}><span>💳</span> Informasi Pembayaran</h3>
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
                            {isCopied ? (<><span>✓</span><span>Tersalin!</span></>) : (<><span>📋</span><span>Salin</span></>)}
                          </button>
                        </div>
                      </div>
                      <div className={styles.accountHolder}>a.n. <strong>{paymentInfo.accountName}</strong></div>
                    </div>
                    <div className={styles.amountToPayBox}>
                      <span className={styles.amountToPayLabel}>Total yang Harus Dibayar:</span>
                      <span className={styles.amountToPayValue}>{formattedTotal}</span>
                    </div>
                  </div>

                  <div className={styles.instructionBox}>
                    <div className={styles.instructionTitle}>PETUNJUK PEMBAYARAN:</div>
                    <p className={styles.instructionText}>
                      Silakan lakukan transfer sesuai nominal total pembayaran. Setelah melakukan transfer, konfirmasi pembayaran melalui WhatsApp agar pesanan dapat segera kami proses.
                    </p>
                  </div>

                  <div className={styles.successActions}>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.12.553 4.11 1.523 5.838l-1.617 5.906 6.077-1.594c1.657.904 3.557 1.417 5.578 1.417 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                      </svg>
                      Konfirmasi Pembayaran via WhatsApp
                    </a>
                    <Link href="/collections" className={styles.backHomeBtn}>Jelajahi Koleksi Lainnya</Link>
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

  // ── EMPTY CART ─────────────────────────────────────────────
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
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h2 className={styles.emptyTitle}>Keranjang Masih Kosong</h2>
                <p className={styles.emptyDesc}>
                  Anda belum menambahkan karya tenun ke dalam keranjang belanja. Silakan pilih busana warisan favorit Anda terlebih dahulu.
                </p>
                <Link href="/collections" className={styles.shopNowBtn}>Kembali ke Koleksi</Link>
              </div>
            </ScrollReveal>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── CHECKOUT FORM ──────────────────────────────────────────
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
            {/* ── Left: Form ──────────────────────────────── */}
            <ScrollReveal>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <span className={styles.stepBadge}>1</span> Informasi Pengiriman
                  </h2>
                </div>

                <div className={styles.guestNote}>
                  ✨ <strong>Pemesanan Aman:</strong> Data Anda diproses di server. Konfirmasi pesanan melalui WhatsApp Admin setelah pembayaran.
                </div>

                <form onSubmit={handleSubmitOrder} noValidate>
                  {/* Nama */}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="customerName">
                      Nama Lengkap <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="customerName" type="text"
                      className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
                      placeholder="Contoh: Raden Ayu Sekar"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      disabled={isSubmitting} required
                    />
                    {errors.customerName && <span className={styles.errorText}>{errors.customerName}</span>}
                  </div>

                  {/* WA & Email */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="customerWhatsapp">
                        Nomor WhatsApp <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="customerWhatsapp" type="tel"
                        className={`${styles.input} ${errors.customerWhatsapp ? styles.inputError : ''}`}
                        placeholder="Contoh: 081234567890"
                        value={formData.customerWhatsapp}
                        onChange={(e) => handleInputChange('customerWhatsapp', e.target.value)}
                        disabled={isSubmitting} required
                      />
                      {errors.customerWhatsapp && <span className={styles.errorText}>{errors.customerWhatsapp}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="customerEmail">
                        Email <span className={styles.optional}>(Opsional)</span>
                      </label>
                      <input
                        id="customerEmail" type="email"
                        className={`${styles.input} ${errors.customerEmail ? styles.inputError : ''}`}
                        placeholder="nama@email.com"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {errors.customerEmail && <span className={styles.errorText}>{errors.customerEmail}</span>}
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="shippingAddress">
                      Alamat Lengkap <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="shippingAddress" rows={3}
                      className={`${styles.textarea} ${errors.shippingAddress ? styles.inputError : ''}`}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      disabled={isSubmitting} required
                    />
                    {errors.shippingAddress && <span className={styles.errorText}>{errors.shippingAddress}</span>}
                  </div>

                  {/* Kota & Kodepos */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="shippingCity">
                        Kota / Kabupaten <span className={styles.optional}>(Opsional)</span>
                      </label>
                      <input
                        id="shippingCity" type="text"
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
                        id="shippingPostalCode" type="text"
                        className={styles.input}
                        placeholder="Contoh: 59411"
                        value={formData.shippingPostalCode}
                        onChange={(e) => handleInputChange('shippingPostalCode', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* ── Shipping Section ─────────────────── */}
                  <div className={styles.shippingSection}>
                    <div className={styles.shippingSectionTitle}>
                      🚚 Pilih Pengiriman <span className={styles.required}>*</span>
                    </div>

                    {/* Destination */}
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="destSearch">
                        Cari Kota/Kecamatan Tujuan <span className={styles.required}>*</span>
                      </label>

                      {destSelected ? (
                        <div className={styles.destSelectedChip}>
                          <span className={styles.destSelectedLabel}>{destSelected.label}</span>
                          <button
                            type="button" className={styles.destClearBtn}
                            onClick={handleDestClear} disabled={isSubmitting}
                            aria-label="Hapus pilihan tujuan"
                          >✕</button>
                        </div>
                      ) : (
                        <div className={styles.destSearchWrapper} ref={destRef}>
                          <input
                            id="destSearch" type="text" autoComplete="off"
                            className={`${styles.destSearchInput} ${errors.destination ? styles.inputError : ''}`}
                            placeholder="Ketik nama kecamatan/kota (min. 2 huruf)"
                            value={destQuery}
                            onChange={handleDestQueryChange}
                            onFocus={() => destResults.length > 0 && setShowDestDrop(true)}
                            disabled={isSubmitting}
                          />
                          {destLoading ? (
                            <span className={styles.destSearchSpinner} aria-label="Mencari..." />
                          ) : (
                            <span className={styles.destSearchIcon} aria-hidden="true">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                            </span>
                          )}
                          {showDestDrop && (
                            <div className={styles.destDropdown} role="listbox">
                              {destResults.length > 0 ? (
                                destResults.map((item) => (
                                  <button
                                    key={item.id} type="button"
                                    className={styles.destOption}
                                    role="option" aria-selected={false}
                                    onClick={() => handleDestSelect(item)}
                                  >
                                    <div className={styles.destOptionLabel}>{item.subdistrict || item.label}</div>
                                    <div className={styles.destOptionSub}>
                                      {[item.district, item.city, item.province, item.postalCode].filter(Boolean).join(' · ')}
                                    </div>
                                  </button>
                                ))
                              ) : destQuery.trim().length >= 2 && !destLoading ? (
                                <div className={styles.destDropdownEmpty}>
                                  Tidak ada hasil untuk &ldquo;{destQuery}&rdquo;. Coba kata kunci lain.
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}

                      {destError && <div className={styles.shippingError} role="alert">{destError}</div>}
                      {errors.destination && !destSelected && (
                        <span className={styles.errorText}>{errors.destination}</span>
                      )}
                    </div>

                    {/* Couriers — only after destination selected */}
                    {destSelected && (
                      <div className={styles.courierSection}>
                        <span className={styles.courierLabel}>Pilih Kurir</span>
                        <div className={styles.courierTabsRow}>
                          {COURIERS.map((c) => (
                            <button
                              key={c.code} type="button"
                              className={`${styles.courierTab} ${activeCourier === c.code ? styles.courierTabActive : ''}`}
                              onClick={() => handleCourierChange(c.code)}
                              disabled={isSubmitting || servicesLoading}
                            >{c.label}</button>
                          ))}
                        </div>

                        {servicesLoading && (
                          <div className={styles.shippingLoading} aria-label="Memuat tarif...">
                            <div className={styles.skeletonCard} />
                            <div className={styles.skeletonCard} />
                            <div className={styles.skeletonCard} />
                          </div>
                        )}

                        {!servicesLoading && servicesError && (
                          <div className={styles.shippingError} role="alert">{servicesError}</div>
                        )}

                        {!servicesLoading && !servicesError && services.length > 0 && (
                          <div className={styles.serviceList} role="radiogroup" aria-label="Pilih layanan pengiriman">
                            {services.map((svc) => {
                              const isSelected =
                                selectedService?.courier === svc.courier &&
                                selectedService?.service === svc.service;
                              return (
                                <button
                                  key={`${svc.courier}-${svc.service}`}
                                  type="button" role="radio" aria-checked={isSelected}
                                  className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                                  onClick={() => setSelectedService(svc)}
                                  disabled={isSubmitting}
                                >
                                  <div className={`${styles.serviceRadio} ${isSelected ? styles.serviceRadioSelected : ''}`}>
                                    {isSelected && <div className={styles.serviceRadioDot} />}
                                  </div>
                                  <div className={styles.serviceInfo}>
                                    <div className={styles.serviceName}>{svc.courier} — {svc.service}</div>
                                    <div className={styles.serviceDesc}>{svc.description}</div>
                                    {svc.etd && <div className={styles.serviceEtd}>Estimasi: {svc.etd}</div>}
                                  </div>
                                  <div className={styles.serviceCost}>{formatRupiah(svc.cost)}</div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {errors.service && !selectedService && (
                          <span className={styles.errorText}>{errors.service}</span>
                        )}

                        {selectedService && !servicesLoading && (
                          <div className={styles.shippingSuccess}>
                            ✓ Pengiriman: {selectedService.courier} {selectedService.service} — {formatRupiah(selectedService.cost)}
                            {selectedService.etd ? ` (est. ${selectedService.etd})` : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {!destSelected && (
                      <p className={styles.shippingHint}>
                        Cari dan pilih kota/kecamatan tujuan untuk melihat pilihan kurir dan tarif pengiriman.
                      </p>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className={styles.formGroup} style={{ marginTop: 28 }}>
                    <label className={styles.label} htmlFor="note">
                      Catatan Pesanan <span className={styles.optional}>(Opsional)</span>
                    </label>
                    <textarea
                      id="note" rows={2} className={styles.textarea}
                      placeholder="Permintaan khusus ukuran, kemasan kado, instruksi kurir, dll."
                      value={formData.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              </div>
            </ScrollReveal>

            {/* ── Right: Summary ───────────────────────── */}
            <ScrollReveal>
              <div className={styles.summarySticky}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <span className={styles.stepBadge}>2</span> Ringkasan Pesanan
                    </h2>
                    <span className={styles.itemsCount}>({totalItemCount} item)</span>
                  </div>

                  <div className={styles.itemsList}>
                    {cart.map((item) => {
                      const itemPrice    = item.price || item.numPrice || 0;
                      const itemSubtotal = itemPrice * (item.quantity || 1);
                      return (
                        <div key={item.key || `${item.id}-${item.size}-${item.variant}`} className={styles.itemRow}>
                          <div className={styles.itemImageWrapper}>
                            <img src={item.image || '/images/hero/hero-main.jpg'} alt={item.name} className={styles.itemImage} />
                          </div>
                          <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{item.name}</h3>
                            <div className={styles.itemMeta}>
                              SKU: {item.sku || 'NURA-ITEM'} | Size: {item.size || 'Free Size'}
                              {item.variant ? ` | Varian: ${item.variant}` : ''}
                            </div>
                            <div className={styles.itemQtyPrice}>{item.quantity} × {formatRupiah(itemPrice)}</div>
                          </div>
                          <div className={styles.itemSubtotal}>{formatRupiah(itemSubtotal)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.pricingDetails}>
                    <div className={styles.priceRow}>
                      <span>Subtotal Produk</span>
                      <span>{subtotal}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>Biaya Pengiriman</span>
                      <span style={shippingCostDisplay ? {} : { color: '#6B5749', fontStyle: 'italic' }}>
                        {shippingCostDisplay || 'Pilih layanan pengiriman'}
                      </span>
                    </div>
                    <div className={styles.priceRowTotal}>
                      <span className={styles.totalLabel}>TOTAL</span>
                      <span className={styles.totalAmount}>{totalDisplay}</span>
                    </div>
                  </div>

                  {submitError && (
                    <div className={styles.errorBanner} role="alert">
                      <span className={styles.errorIcon}>⚠</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    id="checkout-submit-btn"
                    onClick={handleSubmitOrder}
                    disabled={!canSubmit}
                    className={styles.submitBtn}
                    title={
                      !destSelected ? 'Pilih tujuan pengiriman terlebih dahulu'
                      : !selectedService ? 'Pilih layanan pengiriman terlebih dahulu'
                      : undefined
                    }
                  >
                    {isSubmitting ? (
                      <><span className={styles.spinner}></span><span>Memproses Pesanan...</span></>
                    ) : (
                      <span>Buat Pesanan</span>
                    )}
                  </button>

                  <div className={styles.badgesRow}>
                    <div className={styles.badgeItem}><span>🌿</span> 100% Tenun Nusantara</div>
                    <div className={styles.badgeItem}><span>💬</span> Konfirmasi Admin WhatsApp</div>
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

