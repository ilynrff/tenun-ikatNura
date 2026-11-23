'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/format';
import styles from './OrdersListPage.module.css';

// ── Status Mappings ───────────────────────────────────────────
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

export default function OrdersListPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.status === 401) {
        // Redirect unauthorized customer to unified login
        router.push(`/login?redirect=${encodeURIComponent('/account/orders')}`);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Gagal memuat daftar pesanan Anda.');
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setErrorMessage('Terjadi gangguan koneksi. Silakan periksa jaringan Anda.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isLoggedIn) {
        router.push(`/login?redirect=${encodeURIComponent('/account/orders')}`);
      } else {
        fetchOrders();
      }
    }
  }, [isLoadingAuth, isLoggedIn, fetchOrders, router]);

  return (
    <>
      <Navbar />

      <main className={styles.ordersPage}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Navigasi remah roti">
            <Link href="/" className={styles.breadcrumbLink}>
              Beranda
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbLink}>Akun Saya</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbActive} aria-current="page">
              Pesanan Saya
            </span>
          </nav>

          {/* Header */}
          <header className={styles.header}>
            <span className={styles.eyebrow}>Riwayat Pembelian</span>
            <h1 className={styles.title}>Pesanan Saya</h1>
            <p className={styles.subtitle}>
              Pantau status pemesanan, riwayat belanja, dan detail pengiriman karya tenun Anda.
            </p>
          </header>

          {/* Loading Skeleton */}
          {(isLoadingAuth || isLoadingOrders) && (
            <div className={styles.ordersList} aria-busy="true" aria-label="Memuat pesanan">
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} style={{ width: '80%', height: '24px' }} />
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '30%', marginTop: '12px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoadingAuth && !isLoadingOrders && errorMessage && (
            <div className={styles.errorState} role="alert">
              <h2 className={styles.errorTitle}>Gagal Memuat Pesanan</h2>
              <p className={styles.errorDesc}>{errorMessage}</p>
              <button type="button" onClick={fetchOrders} className={styles.retryBtn}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingAuth && !isLoadingOrders && !errorMessage && orders.length === 0 && (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className={styles.emptyTitle}>Belum Ada Pesanan</h2>
              <p className={styles.emptyDesc}>
                Anda belum pernah melakukan pemesanan busana tenun. Jelajahi karya tenun ikat
                warisan Nusantara kami dan temukan busana favorit Anda.
              </p>
              <Link href="/collections" className={styles.shopBtn}>
                Jelajahi Koleksi
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!isLoadingAuth && !isLoadingOrders && !errorMessage && orders.length > 0 && (
            <div className={styles.ordersList}>
              {orders.map((order) => {
                const orderStatusInfo =
                  ORDER_STATUS_MAP[order.orderStatus] || {
                    label: order.orderStatus,
                    styleClass: styles.statusPending,
                  };
                const paymentStatusInfo =
                  PAYMENT_STATUS_MAP[order.paymentStatus] || {
                    label: order.paymentStatus,
                    styleClass: styles.payUnpaid,
                  };

                const displayedItems = Array.isArray(order.items) ? order.items : [];
                const primaryItem = displayedItems[0] || null;
                const remainingCount = displayedItems.length - 1;

                return (
                  <article key={order.id} className={styles.orderCard}>
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderNumber}>
                          {order.orderNumber}
                        </span>
                        <time className={styles.orderDate} dateTime={order.createdAt}>
                          {formatOrderDate(order.createdAt)}
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

                    {/* Card Body — Items */}
                    <div className={styles.cardBody}>
                      {primaryItem ? (
                        <div className={styles.itemRow}>
                          <div className={styles.itemThumbWrapper}>
                            {primaryItem.image ? (
                              <img
                                src={primaryItem.image}
                                alt={primaryItem.productName || 'Produk Tenun'}
                                className={styles.itemThumb}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className={styles.itemThumbPlaceholder}>Tenun Nura</span>
                            )}
                          </div>

                          <div className={styles.itemDetails}>
                            <h3 className={styles.itemName}>
                              {primaryItem.productName}
                            </h3>
                            <div className={styles.itemMeta}>
                              {primaryItem.sku && (
                                <span className={styles.itemMetaTag}>SKU: {primaryItem.sku}</span>
                              )}
                              {primaryItem.size && (
                                <span className={styles.itemMetaTag}>Ukuran: {primaryItem.size}</span>
                              )}
                              {(primaryItem.color || primaryItem.variant) && (
                                <span className={styles.itemMetaTag}>
                                  Varian: {primaryItem.color || primaryItem.variant}
                                </span>
                              )}
                            </div>
                            <div className={styles.itemPriceQty}>
                              {primaryItem.quantity} &times; {formatRupiah(primaryItem.unitPrice)}
                            </div>
                          </div>

                          <div className={styles.itemSubtotal}>
                            {formatRupiah(primaryItem.subtotal)}
                          </div>
                        </div>
                      ) : (
                        <p className={styles.itemMeta}>Detail produk tidak tersedia.</p>
                      )}

                      {remainingCount > 0 && (
                        <div className={styles.moreItems}>
                          + {remainingCount} produk tenun lainnya dalam pesanan ini
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.totalSection}>
                        <span className={styles.totalLabel}>
                          Total ({order.totalItemsCount || displayedItems.length} produk)
                        </span>
                        <span className={styles.totalAmount}>
                          {formatRupiah(order.total)}
                        </span>
                      </div>

                      <Link
                        href={`/account/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
                        className={styles.detailBtn}
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

