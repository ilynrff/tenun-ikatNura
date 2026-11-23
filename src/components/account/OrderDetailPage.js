'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/format';
import siteData from '@/data/site.json';
import styles from './OrderDetailPage.module.css';

// ── Progress Steps Definition ─────────────────────────────────
const PROGRESS_STEPS = [
  { key: 'PENDING', label: 'Menunggu Diproses' },
  { key: 'PROCESSING', label: 'Sedang Diproses' },
  { key: 'SHIPPED', label: 'Dalam Pengiriman' },
  { key: 'COMPLETED', label: 'Pesanan Selesai' },
];

const ORDER_STATUS_MAP = {
  PENDING: { label: 'Menunggu Diproses', styleClass: styles.statusPending },
  PROCESSING: { label: 'Sedang Diproses', styleClass: styles.statusProcessing },
  SHIPPED: { label: 'Dalam Pengiriman', styleClass: styles.statusShipped },
  COMPLETED: { label: 'Pesanan Selesai', styleClass: styles.statusCompleted },
  CANCELLED: { label: 'Dibatalkan', styleClass: styles.statusCancelled },
};

const PAYMENT_STATUS_MAP = {
  UNPAID: { label: 'Belum Dibayar', styleClass: styles.payUnpaid },
  PENDING: { label: 'Menunggu Verifikasi', styleClass: styles.payPending },
  PAID: { label: 'Lunas', styleClass: styles.payPaid },
  FAILED: { label: 'Gagal', styleClass: styles.payFailed },
  REFUNDED: { label: 'Dikembalikan', styleClass: styles.payRefunded },
};

function formatOrderDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatCompletionSource(source) {
  if (source === 'CUSTOMER_CONFIRMED') {
    return 'Dikonfirmasi langsung oleh Anda (Pelanggan)';
  }
  if (source === 'ADMIN_CONFIRMED') {
    return 'Diselesaikan oleh Administrator';
  }
  return null;
}

export default function OrderDetailPage({ orderId: propOrderId }) {
  const router = useRouter();
  const routeParams = useParams();

  // Support both passed prop and App Router route params defensively
  const rawId = propOrderId || routeParams?.id || '';
  const orderId = typeof rawId === 'string' ? decodeURIComponent(rawId).trim() : '';

  const { user, isLoggedIn, isLoadingAuth } = useAuth();

  const [order, setOrder] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isCopiedTracking, setIsCopiedTracking] = useState(false);

  // Receipt Confirmation States (Tahap Customer Account 3D)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setIsLoadingOrder(false);
      setIsNotFound(true);
      return;
    }

    setIsLoadingOrder(true);
    setErrorMessage('');
    setIsNotFound(false);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.status === 401) {
        // Redirect unauthorized customer to unified login
        router.push(
          `/login?redirect=${encodeURIComponent(`/account/orders/${orderId}`)}`
        );
        return;
      }

      const data = await res.json();

      if (res.status === 404 || !data.success) {
        if (res.status === 404) {
          setIsNotFound(true);
        } else {
          setErrorMessage(data.error || 'Gagal memuat detail pesanan.');
        }
        return;
      }

      setOrder(data.order || null);
    } catch (err) {
      console.error('Fetch order detail error:', err);
      setErrorMessage('Terjadi gangguan koneksi. Silakan periksa jaringan Anda.');
    } finally {
      setIsLoadingOrder(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isLoggedIn) {
        const redirectPath = orderId
          ? `/account/orders/${encodeURIComponent(orderId)}`
          : '/account/orders';
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        fetchOrderDetail();
      }
    }
  }, [isLoadingAuth, isLoggedIn, fetchOrderDetail, orderId, router]);

  const handleCopyTracking = (tracking) => {
    if (!tracking) return;
    try {
      navigator.clipboard.writeText(tracking);
      setIsCopiedTracking(true);
      setTimeout(() => setIsCopiedTracking(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isConfirmModalOpen && !isSubmittingReceive) {
        setIsConfirmModalOpen(false);
        setConfirmError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmModalOpen, isSubmittingReceive]);

  // Handler for customer receipt confirmation (Tahap Customer Account 3D)
  const handleConfirmReceive = async () => {
    if (isSubmittingReceive || !order) return;

    setIsSubmittingReceive(true);
    setConfirmError('');

    try {
      const targetId = order.id || order.orderNumber || orderId;
      const res = await fetch(`/api/orders/${encodeURIComponent(targetId)}/receive`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(`/account/orders/${orderId}`)}`);
          return;
        }

        if (res.status === 409) {
          // Status has changed (e.g. already COMPLETED or changed by admin)
          setConfirmError(
            data.error || 'Pesanan sudah diselesaikan sebelumnya atau status pesanan telah berubah.'
          );
          // Refresh order data to sync with latest server state
          fetchOrderDetail();
          return;
        }

        setConfirmError(
          data.error || 'Gagal mengonfirmasi penerimaan pesanan. Silakan coba beberapa saat lagi.'
        );
        return;
      }

      // Success: update state locally without reloading entire page
      const updatedOrderData = data.order || {};
      setOrder((prev) => ({
        ...prev,
        ...updatedOrderData,
        orderStatus: 'COMPLETED',
        receivedAt: updatedOrderData.receivedAt || new Date().toISOString(),
        completionSource: updatedOrderData.completionSource || 'CUSTOMER_CONFIRMED',
      }));

      setIsConfirmModalOpen(false);
      setSuccessNotice('Terima kasih! Pesanan Anda telah berhasil dikonfirmasi selesai.');
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      console.error('Error confirming receipt:', err);
      setConfirmError('Terjadi gangguan koneksi. Silakan periksa jaringan internet Anda.');
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  // Stepper calculations
  const orderStatus = order?.orderStatus || 'PENDING';
  const isCancelled = orderStatus === 'CANCELLED';

  const stepOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
  const currentStepIndex = stepOrder.indexOf(orderStatus);

  const orderStatusInfo =
    ORDER_STATUS_MAP[orderStatus] || {
      label: orderStatus,
      styleClass: styles.statusPending,
    };
  const paymentStatusInfo =
    PAYMENT_STATUS_MAP[order?.paymentStatus] || {
      label: order?.paymentStatus || 'UNPAID',
      styleClass: styles.payUnpaid,
    };

  const bank = siteData?.payment?.bank || 'BCA';
  const accountNumber = siteData?.payment?.accountNumber || '1234567890';
  const accountName = siteData?.payment?.accountName || 'TENUN IKAT NURA';
  const whatsappNumber = siteData?.contact?.whatsapp || '6281252783496';

  const waConfirmLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo Tenun Ikat Nura, saya ingin konfirmasi pembayaran untuk pesanan ${
      order?.orderNumber || orderId
    }.`
  )}`;

  return (
    <>
      <Navbar />

      <main className={styles.detailPage}>
        <div className={styles.container}>
          {/* Back Navigation */}
          <Link href="/account/orders" className={styles.backLink}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Daftar Pesanan
          </Link>

          {/* Loading Skeleton */}
          {(isLoadingAuth || isLoadingOrder) && (
            <div aria-busy="true" aria-label="Memuat detail pesanan">
              <div className={styles.skeletonBlock}>
                <div className={styles.skeletonLine} style={{ width: '30%' }} />
                <div className={styles.skeletonLine} style={{ width: '60%', height: '32px' }} />
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
              </div>
              <div className={styles.skeletonBlock}>
                <div className={styles.skeletonLine} style={{ width: '100%', height: '80px' }} />
              </div>
            </div>
          )}

          {/* Not Found State */}
          {!isLoadingAuth && !isLoadingOrder && isNotFound && (
            <div className={styles.notFoundBox}>
              <h1 className={styles.notFoundTitle}>Pesanan Tidak Ditemukan</h1>
              <p className={styles.notFoundDesc}>
                Pesanan dengan nomor atau ID <strong>&ldquo;{orderId}&rdquo;</strong> tidak ditemukan
                pada akun Anda. Pastikan Anda masuk dengan akun yang sesuai saat bertransaksi.
              </p>
              <Link href="/account/orders" className={styles.actionBtn}>
                Lihat Semua Pesanan
              </Link>
            </div>
          )}

          {/* Error State */}
          {!isLoadingAuth && !isLoadingOrder && !isNotFound && errorMessage && (
            <div className={styles.notFoundBox}>
              <h1 className={styles.notFoundTitle}>Gagal Memuat Pesanan</h1>
              <p className={styles.notFoundDesc}>{errorMessage}</p>
              <button
                type="button"
                onClick={fetchOrderDetail}
                className={styles.actionBtn}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Order Detail Content */}
          {!isLoadingAuth && !isLoadingOrder && !isNotFound && !errorMessage && order && (
            <div>
              {/* Header Card */}
              <div className={styles.headerCard}>
                <div className={styles.headerTop}>
                  <div className={styles.titleGroup}>
                    <span className={styles.orderLabel}>Detail Pemesanan</span>
                    <h1 className={styles.orderNumber}>{order.orderNumber}</h1>
                    <time className={styles.orderDate} dateTime={order.createdAt}>
                      Dipesan pada {formatOrderDate(order.createdAt)}
                    </time>
                  </div>

                  <div className={styles.badgesGroup}>
                    <span
                      className={`${styles.badge} ${orderStatusInfo.styleClass}`}
                      title={`Status Pesanan: ${orderStatusInfo.label}`}
                    >
                      {orderStatusInfo.label}
                    </span>
                    <span
                      className={`${styles.badge} ${paymentStatusInfo.styleClass}`}
                      title={`Status Pembayaran: ${paymentStatusInfo.label}`}
                    >
                      {paymentStatusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Success Banner after Confirmation */}
                {successNotice && (
                  <div className={styles.successBanner} role="status">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{successNotice}</span>
                  </div>
                )}

                {/* Receipt Confirmation CTA (only when SHIPPED) */}
                {orderStatus === 'SHIPPED' && (
                  <div className={styles.receiptActionBox}>
                    <div className={styles.receiptActionContent}>
                      <div className={styles.receiptActionTitle}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                        Pesanan Sedang Dalam Pengiriman
                      </div>
                      <p className={styles.receiptActionDesc}>
                        Kain tenun Anda sedang dalam perjalanan ke alamat tujuan. Jika paket sudah Anda terima dengan baik, silakan konfirmasi di bawah ini untuk menyelesaikan pesanan.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.receiveBtn}
                      onClick={() => {
                        setConfirmError('');
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Barang Sudah Saya Terima
                    </button>
                  </div>
                )}

                {/* Completion Details Notice (only when COMPLETED) */}
                {orderStatus === 'COMPLETED' && (
                  <div className={styles.completedNoticeBox}>
                    <div className={styles.completedNoticeIconWrapper}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className={styles.completedNoticeContent}>
                      <div className={styles.completedNoticeTitle}>Pesanan Telah Selesai Diterima</div>
                      <div className={styles.completedNoticeMeta}>
                        {order.receivedAt ? (
                          <span>
                            Waktu Penerimaan: <strong>{formatOrderDate(order.receivedAt)} WIB</strong>
                          </span>
                        ) : (
                          <span>Paket telah selesai diserahterimakan.</span>
                        )}
                        {order.completionSource && (
                          <span>
                            Sumber Penyelesaian: <strong>{formatCompletionSource(order.completionSource)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* B. Order Progress Stepper */}
              <section className={styles.card} aria-label="Progres Pesanan">
                <h2 className={styles.cardTitle}>Progres Pesanan</h2>

                {isCancelled ? (
                  <div className={styles.cancelledBanner} role="alert">
                    <svg
                      className={styles.cancelledIcon}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className={styles.cancelledTitle}>Pesanan Dibatalkan</h3>
                      <p className={styles.cancelledText}>
                        Pesanan ini telah dibatalkan. Jika Anda memiliki pertanyaan atau
                        memerlukan bantuan lebih lanjut, silakan hubungi tim kami melalui
                        layanan pelanggan WhatsApp resmi.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.stepperContainer}>
                    <div className={styles.stepper}>
                      {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = currentStepIndex > index;
                        const isActive = currentStepIndex === index;

                        return (
                          <div
                            key={step.key}
                            className={`${styles.step} ${
                              isCompleted ? styles.stepCompleted : ''
                            } ${isActive ? styles.stepActive : ''}`}
                          >
                            <div className={styles.stepIconWrapper}>
                              {isCompleted ? (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <span className={styles.stepLabel}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* C. Payment Information */}
              <section className={styles.card} aria-label="Informasi Pembayaran">
                <h2 className={styles.cardTitle}>Informasi Pembayaran</h2>

                <div className={styles.paymentInfoBox}>
                  <div className={styles.bankRow}>
                    <div className={styles.bankCol}>
                      <div className={styles.bankLabel}>Metode Pembayaran</div>
                      <div className={styles.bankAccount}>
                        Transfer Bank {bank}
                      </div>
                    </div>
                    <div className={styles.bankCol}>
                      <div className={styles.bankLabel}>Nomor Rekening Resmi</div>
                      <div className={styles.bankAccount}>{accountNumber}</div>
                      <div className={styles.bankHolder}>a.n. {accountName}</div>
                    </div>
                  </div>

                  {order.paymentStatus === 'PAID' ? (
                    <div className={styles.paidConfirmation}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>
                        Pembayaran telah diverifikasi lunas. Pesanan Anda diproses dengan
                        seksama oleh tim artisan Tenun Ikat Nura.
                      </span>
                    </div>
                  ) : order.paymentStatus === 'REFUNDED' ? (
                    <p className={styles.paymentNotice}>
                      Dana pembayaran untuk pesanan ini telah dikembalikan (refund).
                    </p>
                  ) : (
                    <div>
                      <p className={styles.paymentNotice}>
                        Silakan transfer tepat sebesar <strong>{formatRupiah(order.total)}</strong>{' '}
                        ke rekening BCA di atas. Setelah melakukan pembayaran, segera konfirmasi
                        dengan menyertakan bukti transfer dan nomor pesanan melalui WhatsApp resmi.
                      </p>
                      <a
                        href={waConfirmLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.waConfirmBtn}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                        </svg>
                        Konfirmasi Pembayaran via WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* D. Shipping & Customer Details */}
              <section className={styles.card} aria-label="Informasi Pengiriman">
                <h2 className={styles.cardTitle}>Informasi Pengiriman & Penerima</h2>

                <div className={styles.infoGrid}>
                  {/* Courier & Tracking */}
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Ekspedisi & Layanan</span>
                    <div className={styles.infoBlockValue}>
                      <strong>{order.courier ? order.courier.toUpperCase() : 'Kurir Rekanan'}</strong>
                      {order.shippingService && ` — Layanan ${order.shippingService}`}
                    </div>

                    <span className={styles.infoBlockLabel} style={{ marginTop: '10px' }}>
                      Nomor Resi Pengiriman
                    </span>
                    {order.trackingNumber ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={styles.trackingNumberBadge}>
                          {order.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.trackingNumber)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(197, 154, 61, 0.4)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: '#4A3A2F',
                            fontFamily: 'inherit',
                          }}
                        >
                          {isCopiedTracking ? '✓ Disalin' : 'Salin Resi'}
                        </button>
                      </div>
                    ) : (
                      <span className={styles.noTracking}>
                        Nomor resi belum tersedia. Resi akan diperbarui setelah paket
                        diserahkan ke pihak ekspedisi.
                      </span>
                    )}

                    {orderStatus === 'COMPLETED' && (
                      <div className={styles.deliveryCompletedBox}>
                        <span className={styles.infoBlockLabel}>Status Penerimaan Paket</span>
                        <div className={styles.deliveryCompletedBadge}>
                          <span className={styles.deliveryCheckmark}>✓</span>
                          <span>Paket telah diterima oleh pelanggan</span>
                        </div>
                        {order.receivedAt && (
                          <div className={styles.deliveryMetaText}>
                            Diterima pada {formatOrderDate(order.receivedAt)} WIB
                          </div>
                        )}
                        {order.completionSource && (
                          <div className={styles.deliveryMetaText}>
                            ({formatCompletionSource(order.completionSource)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recipient Address */}
                  <div className={styles.infoBlock}>
                    <span className={styles.infoBlockLabel}>Penerima & Alamat</span>
                    <div className={styles.infoBlockValue}>
                      <strong>{order.customerName}</strong>
                      <div>{order.customerWhatsapp}</div>
                      {order.customerEmail && <div>{order.customerEmail}</div>}
                      <div style={{ marginTop: '6px' }}>
                        {order.shippingAddress}
                        {order.shippingCity && `, ${order.shippingCity}`}
                        {order.shippingPostalCode && ` ${order.shippingPostalCode}`}
                      </div>
                      {order.note && (
                        <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#6B5749' }}>
                          Catatan: &ldquo;{order.note}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* E. Product Details & Financial Breakdown */}
              <section className={styles.card} aria-label="Rincian Produk dan Biaya">
                <h2 className={styles.cardTitle}>Rincian Produk ({order.totalItemsCount || order.items?.length || 0} item)</h2>

                <div className={styles.itemsList}>
                  {Array.isArray(order.items) &&
                    order.items.map((item) => (
                      <div key={item.id} className={styles.itemCard}>
                        <div className={styles.itemThumbWrapper}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName || 'Produk Tenun'}
                              className={styles.itemThumb}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className={styles.itemThumbPlaceholder}>Tenun Nura</span>
                          )}
                        </div>

                        <div className={styles.itemContent}>
                          <h3 className={styles.itemName}>{item.productName}</h3>
                          <div className={styles.itemMeta}>
                            {item.sku && (
                              <span className={styles.itemMetaTag}>SKU: {item.sku}</span>
                            )}
                            {item.size && (
                              <span className={styles.itemMetaTag}>Ukuran: {item.size}</span>
                            )}
                            {(item.color || item.variant) && (
                              <span className={styles.itemMetaTag}>
                                Varian: {item.color || item.variant}
                              </span>
                            )}
                          </div>
                          <div className={styles.itemPriceQty}>
                            {item.quantity} &times; {formatRupiah(item.unitPrice)}
                          </div>
                        </div>

                        <div className={styles.itemSubtotal}>
                          {formatRupiah(item.subtotal)}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Financial Summary */}
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal Produk</span>
                    <span>{formatRupiah(order.subtotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Ongkos Kirim ({order.courier ? order.courier.toUpperCase() : 'Kurir'})</span>
                    <span>{formatRupiah(order.shippingCost)}</span>
                  </div>
                  <div className={styles.summaryRowTotal}>
                    <span>Total Transaksi</span>
                    <span className={styles.totalHighlight}>
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
          {/* Confirmation Dialog Modal */}
          {isConfirmModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={() => {
                if (!isSubmittingReceive) {
                  setIsConfirmModalOpen(false);
                  setConfirmError('');
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div className={styles.modalIconWrapper}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 id="confirm-dialog-title" className={styles.modalTitle}>
                    Konfirmasi Penerimaan Pesanan
                  </h3>
                </div>

                <div className={styles.modalBody}>
                  <p className={styles.modalText}>
                    Apakah kamu yakin sudah menerima pesanan ini? Setelah dikonfirmasi, status pesanan akan berubah menjadi selesai.
                  </p>

                  {confirmError && (
                    <div className={styles.modalErrorBox} role="alert">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{confirmError}</span>
                    </div>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setConfirmError('');
                    }}
                    disabled={isSubmittingReceive}
                    className={styles.modalCancelBtn}
                  >
                    Belum
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReceive}
                    disabled={isSubmittingReceive}
                    className={styles.modalConfirmBtn}
                  >
                    {isSubmittingReceive ? (
                      <>
                        <span className={styles.btnSpinner} aria-hidden="true" />
                        Memproses...
                      </>
                    ) : (
                      'Ya, Saya Sudah Terima'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
