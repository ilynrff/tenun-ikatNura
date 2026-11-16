'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import styles from './orders.module.css';

/* ------------------------------------------------------------------ */
/* HELPERS & CONSTANTS                                                 */
/* ------------------------------------------------------------------ */

function formatRupiah(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const ORDER_STATUS_LABELS = {
  PENDING: 'Menunggu Pembayaran',
  PROCESSING: 'Diproses / Dikemas',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Belum Bayar',
  PENDING: 'Menunggu Verifikasi',
  PAID: 'Lunas',
  FAILED: 'Gagal',
  REFUNDED: 'Dana Dikembalikan',
};

function OrderStatusBadge({ status }) {
  const label = ORDER_STATUS_LABELS[status] || status || '—';
  return (
    <span className={`${styles.badge} ${styles[`order_${status}`] || ''}`}>
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const label = PAYMENT_STATUS_LABELS[status] || status || '—';
  return (
    <span className={`${styles.badge} ${styles[`pay_${status}`] || ''}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Page level notification banner
  const [pageNotification, setPageNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  const showPageNotification = (type, message) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setPageNotification({ type, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setPageNotification(null);
    }, 6000);
  };

  // Modal Detail & Edit states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  // Form draft in modal
  const [formDraft, setFormDraft] = useState({
    orderStatus: '',
    paymentStatus: '',
    courier: '',
    shippingService: '',
    trackingNumber: '',
    adminNotes: '',
  });

  // Debounce search input (400ms)
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1); // reset to page 1 on new search
    }, 400);
  };

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    // Validasi client-side: startDate tidak boleh lebih besar dari endDate
    if (startDate && endDate && startDate > endDate) {
      setDateError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
      return;
    }
    setDateError(null);

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '15');
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (orderStatusFilter !== 'all') params.set('orderStatus', orderStatusFilter);
      if (paymentStatusFilter !== 'all') params.set('paymentStatus', paymentStatusFilter);
      if (startDate.trim()) params.set('startDate', startDate.trim());
      if (endDate.trim()) params.set('endDate', endDate.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);

      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/orders';
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Gagal memuat data pesanan (HTTP ${res.status}).`);
      }

      setOrders(data.orders || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('[AdminOrdersPage] Fetch error:', err.message);
      setError(err.message || 'Terjadi gangguan saat memuat daftar pesanan.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, orderStatusFilter, paymentStatusFilter, startDate, endDate]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open modal detail
  const handleOpenDetail = async (orderSummary) => {
    setSelectedOrder(orderSummary);
    setModalError(null);
    setModalSuccess(null);

    // Initial draft from summary
    setFormDraft({
      orderStatus: orderSummary.orderStatus || '',
      paymentStatus: orderSummary.paymentStatus || '',
      courier: orderSummary.courier || '',
      shippingService: orderSummary.shippingService || '',
      trackingNumber: orderSummary.trackingNumber || '',
      adminNotes: orderSummary.adminNotes || '',
    });

    // Fetch full order detail to ensure complete data
    try {
      setModalLoading(true);
      const res = await fetch(`/api/admin/orders/${orderSummary.id}`);
      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/orders';
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.order) {
        setSelectedOrder(data.order);
        setFormDraft({
          orderStatus: data.order.orderStatus || '',
          paymentStatus: data.order.paymentStatus || '',
          courier: data.order.courier || '',
          shippingService: data.order.shippingService || '',
          trackingNumber: data.order.trackingNumber || '',
          adminNotes: data.order.adminNotes || '',
        });
      }
    } catch (fetchErr) {
      console.warn('[AdminOrdersPage] Detail fetch warning:', fetchErr.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (modalSubmitting) return;
    setSelectedOrder(null);
    setModalError(null);
    setModalSuccess(null);
  };

  // Submit form update
  const handleSaveUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder || modalSubmitting) return;

    // Validation checks before sending
    if (formDraft.orderStatus === 'SHIPPED') {
      const courierVal = formDraft.courier.trim();
      const trackingVal = formDraft.trackingNumber.trim();
      if (!courierVal) {
        setModalError('Status "SHIPPED" mewajibkan pengisian Kurir pengiriman.');
        return;
      }
      if (!trackingVal) {
        setModalError('Status "SHIPPED" mewajibkan pengisian Nomor Resi pengiriman.');
        return;
      }
    }

    // Two-request rule: cannot cancel and refund in one request
    if (formDraft.orderStatus === 'CANCELLED' && formDraft.paymentStatus === 'REFUNDED') {
      setModalError(
        'Pembatalan dan pengembalian dana (REFUNDED) harus melalui dua tahap terpisah. ' +
        'Batalkan pesanan terlebih dahulu, lalu lakukan refund setelah dana benar-benar dikembalikan.'
      );
      return;
    }

    // Prepare payload (only dirty or needed fields)
    const payload = {};
    if (formDraft.orderStatus !== selectedOrder.orderStatus) {
      payload.orderStatus = formDraft.orderStatus;
    }
    if (formDraft.paymentStatus !== selectedOrder.paymentStatus) {
      payload.paymentStatus = formDraft.paymentStatus;
    }
    if (formDraft.courier !== (selectedOrder.courier || '')) {
      payload.courier = formDraft.courier;
    }
    if (formDraft.shippingService !== (selectedOrder.shippingService || '')) {
      payload.shippingService = formDraft.shippingService;
    }
    if (formDraft.trackingNumber !== (selectedOrder.trackingNumber || '')) {
      payload.trackingNumber = formDraft.trackingNumber;
    }
    if (formDraft.adminNotes !== (selectedOrder.adminNotes || '')) {
      payload.adminNotes = formDraft.adminNotes;
    }

    if (Object.keys(payload).length === 0) {
      setModalSuccess('Tidak ada perubahan data yang disimpan.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);
      setModalSuccess(null);

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/orders';
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Gagal memperbarui data pesanan.');
      }

      // Tampilkan notifikasi keberhasilan di halaman utama dan tutup modal otomatis
      showPageNotification(
        'success',
        `Perubahan pesanan ${data.order?.orderNumber || selectedOrder.orderNumber} berhasil disimpan!`
      );
      setSelectedOrder(null);
      setModalError(null);
      setModalSuccess(null);

      // Refresh list
      fetchOrders();
    } catch (saveErr) {
      console.error('[AdminOrdersPage] Save error:', saveErr.message);
      setModalError(saveErr.message || 'Terjadi kesalahan saat menyimpan pesanan.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Dedicated Action: Cancel Order
  const handleQuickCancel = async () => {
    if (!selectedOrder || modalSubmitting) return;

    const confirmed = window.confirm(
      `Yakin ingin MEMBATALKAN pesanan ${selectedOrder.orderNumber}?\n\n` +
      `Tindakan ini akan mengembalikan stok produk ke gudang secara otomatis dan status pesanan tidak dapat diubah kembali.`
    );
    if (!confirmed) return;

    try {
      setModalSubmitting(true);
      setModalError(null);
      setModalSuccess(null);

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'CANCELLED',
          adminNotes: formDraft.adminNotes || selectedOrder.adminNotes || 'Dibatalkan oleh Admin.',
        }),
      });

      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/orders';
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Gagal membatalkan pesanan.');
      }

      setModalSuccess('Pesanan berhasil dibatalkan dan stok produk telah dikembalikan ke katalog!');
      setSelectedOrder(data.order);
      setFormDraft((prev) => ({
        ...prev,
        orderStatus: data.order.orderStatus,
        paymentStatus: data.order.paymentStatus,
      }));

      fetchOrders();
    } catch (err) {
      setModalError(err.message || 'Gagal membatalkan pesanan.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Dedicated Action: Mark Refunded (Only for CANCELLED orders with PAID status)
  const handleMarkRefunded = async () => {
    if (!selectedOrder || modalSubmitting) return;

    const confirmed = window.confirm(
      `Konfirmasi Pengembalian Dana untuk pesanan ${selectedOrder.orderNumber}?\n\n` +
      `Pastikan Anda telah benar-benar mentransfer dana pengembalian ke rekening bank pelanggan.`
    );
    if (!confirmed) return;

    try {
      setModalSubmitting(true);
      setModalError(null);
      setModalSuccess(null);

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'REFUNDED',
          adminNotes: formDraft.adminNotes || selectedOrder.adminNotes || 'Refund telah ditransfer ke pelanggan.',
        }),
      });

      if (res.status === 401) {
        window.location.href = '/login?redirect=/admin/orders';
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Gagal mengubah status refund.');
      }

      setModalSuccess('Status pembayaran berhasil diperbarui menjadi REFUNDED!');
      setSelectedOrder(data.order);
      setFormDraft((prev) => ({
        ...prev,
        paymentStatus: data.order.paymentStatus,
      }));

      fetchOrders();
    } catch (err) {
      setModalError(err.message || 'Gagal memproses status refund.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setOrderStatusFilter('all');
    setPaymentStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setDateError(null);
    setCurrentPage(1);
  };

  const isFiltered =
    debouncedSearch.trim() !== '' ||
    orderStatusFilter !== 'all' ||
    paymentStatusFilter !== 'all' ||
    startDate.trim() !== '' ||
    endDate.trim() !== '';

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h2 className={styles.pageTitle}>Manajemen Pesanan</h2>
          <p className={styles.pageDesc}>
            Pantau transaksi masuk, verifikasi transfer pembayaran, dan kelola pengiriman tenun pelanggan.
          </p>
        </div>
      </div>

      {/* ── Page Level Success Notification ── */}
      {pageNotification && (
        <div
          className={`${styles.pageNotification} ${
            pageNotification.type === 'success'
              ? styles.pageNotificationSuccess
              : styles.pageNotificationError
          }`}
          role="status"
        >
          <div className={styles.pageNotificationContent}>
            <span>{pageNotification.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{pageNotification.message}</span>
          </div>
          <button
            type="button"
            className={styles.notificationCloseBtn}
            onClick={() => setPageNotification(null)}
            aria-label="Tutup pemberitahuan"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Date Range Error Banner ── */}
      {dateError && (
        <div className={`${styles.pageNotification} ${styles.pageNotificationError}`} role="alert">
          <div className={styles.pageNotificationContent}>
            <span>⚠️</span>
            <span>{dateError}</span>
          </div>
          <button
            type="button"
            className={styles.notificationCloseBtn}
            onClick={() => setDateError(null)}
            aria-label="Tutup pesan error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Toolbar: Search + Status & Date Filters ── */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="order-search"
            type="search"
            className={styles.searchInput}
            placeholder="Cari No. Pesanan, nama, no. HP, resi…"
            value={searchInput}
            onChange={handleSearchChange}
            aria-label="Cari pesanan"
          />
        </div>

        {/* Filter Status Pesanan */}
        <select
          id="filter-order-status"
          className={styles.filterSelect}
          value={orderStatusFilter}
          onChange={(e) => {
            setOrderStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter status pesanan"
        >
          <option value="all">Semua Status Pesanan</option>
          <option value="PENDING">Menunggu Pembayaran (PENDING)</option>
          <option value="PROCESSING">Diproses / Dikemas (PROCESSING)</option>
          <option value="SHIPPED">Dikirim (SHIPPED)</option>
          <option value="COMPLETED">Selesai (COMPLETED)</option>
          <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
        </select>

        {/* Filter Status Pembayaran */}
        <select
          id="filter-payment-status"
          className={styles.filterSelect}
          value={paymentStatusFilter}
          onChange={(e) => {
            setPaymentStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter status pembayaran"
        >
          <option value="all">Semua Status Pembayaran</option>
          <option value="UNPAID">Belum Bayar (UNPAID)</option>
          <option value="PENDING">Menunggu Verifikasi (PENDING)</option>
          <option value="PAID">Lunas (PAID)</option>
          <option value="FAILED">Gagal (FAILED)</option>
          <option value="REFUNDED">Refund (REFUNDED)</option>
        </select>

        {/* Filter Rentang Tanggal (createdAt) */}
        <div className={styles.dateFilterGroup}>
          <div className={styles.dateInputWrapper}>
            <label htmlFor="filter-start-date" className={styles.dateLabel}>Mulai:</label>
            <input
              id="filter-start-date"
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tanggal mulai pesanan"
            />
          </div>
          <span className={styles.dateDivider} aria-hidden="true">&ndash;</span>
          <div className={styles.dateInputWrapper}>
            <label htmlFor="filter-end-date" className={styles.dateLabel}>Sampai:</label>
            <input
              id="filter-end-date"
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tanggal akhir pesanan"
            />
          </div>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className={styles.resetBtn}
            aria-label="Reset semua filter pencarian"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* ── Result Info ── */}
      {!loading && !error && (
        <div className={styles.resultInfo} aria-live="polite">
          <span>
            {pagination.total === 0
              ? 'Tidak ada pesanan ditemukan.'
              : `Menampilkan ${orders.length} dari ${pagination.total} pesanan`}
          </span>
          {pagination.totalPages > 1 && (
            <span>
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>
          )}
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className={styles.loadingBox} aria-busy="true">
          <div className={styles.spinner} />
          <p style={{ color: '#5C4A3D', fontSize: '0.875rem' }}>Memuat daftar pesanan pelanggan…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className={styles.errorState} role="alert">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
          <button type="button" onClick={fetchOrders} className={styles.resetBtn}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && orders.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>
            {isFiltered ? 'Tidak ada pesanan yang sesuai filter' : 'Belum ada pesanan masuk'}
          </h3>
          <p className={styles.emptyDesc}>
            {isFiltered
              ? 'Coba ubah kata kunci pencarian atau sesuaikan opsi status yang dipilih.'
              : 'Pesanan baru dari pelanggan etalase toko akan otomatis tercatat di halaman ini.'}
          </p>
          {isFiltered && (
            <button type="button" onClick={handleResetFilters} className={styles.resetBtn}>
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* ── Desktop Table View ── */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.th}>No. Pesanan & Tanggal</th>
                  <th className={styles.th}>Pelanggan</th>
                  <th className={styles.th}>Total Bayar</th>
                  <th className={styles.th}>Pembayaran</th>
                  <th className={styles.th}>Status Pesanan</th>
                  <th className={styles.th}>Pengiriman</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={styles.tableRow}>
                    {/* No Pesanan */}
                    <td className={styles.td}>
                      <div className={styles.orderNumberCell}>
                        <span className={styles.orderNumber}>{order.orderNumber}</span>
                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                      </div>
                    </td>

                    {/* Pelanggan */}
                    <td className={styles.td}>
                      <div className={styles.customerCell}>
                        <span className={styles.customerName}>{order.customerName}</span>
                        <span className={styles.customerPhone}>{order.customerWhatsapp}</span>
                      </div>
                    </td>

                    {/* Total Bayar */}
                    <td className={styles.td}>
                      <span className={styles.priceText}>{formatRupiah(order.total)}</span>
                      <div style={{ fontSize: '0.75rem', color: '#5C4A3D' }}>
                        {order.totalItemsCount || order.items?.length || 0} item
                      </div>
                    </td>

                    {/* Status Pembayaran */}
                    <td className={styles.td}>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>

                    {/* Status Pesanan */}
                    <td className={styles.td}>
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>

                    {/* Pengiriman */}
                    <td className={styles.td}>
                      <div className={styles.shippingInfo}>
                        <span>{order.courier ? order.courier.toUpperCase() : 'Kurir —'}</span>
                        {order.trackingNumber && (
                          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A120C' }}>
                            {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(order)}
                        className={styles.viewDetailBtn}
                        aria-label={`Lihat rincian pesanan ${order.orderNumber}`}
                      >
                        Detail & Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Stacked Cards View ── */}
          <div className={styles.mobileList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.orderNumberCell}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Pelanggan</span>
                    <span className={styles.customerName}>{order.customerName}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>WhatsApp</span>
                    <span>{order.customerWhatsapp}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Total Pembayaran</span>
                    <span className={styles.priceText}>{formatRupiah(order.total)}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Status Bayar</span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  {order.courier && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Kurir & Resi</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                        {order.courier.toUpperCase()} {order.trackingNumber ? `(${order.trackingNumber})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(order)}
                    className={styles.viewDetailBtn}
                  >
                    Detail & Kelola Pesanan
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination Controls ── */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                Menampilkan halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className={styles.pageNav}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                  aria-label="Halaman sebelumnya"
                >
                  &larr; Sebelumnya
                </button>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage || loading}
                  aria-label="Halaman selanjutnya"
                >
                  Selanjutnya &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODAL DETAIL & KELOLA PESANAN ── */}
      {selectedOrder && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-order-title"
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 id="modal-order-title" className={styles.modalTitle}>
                  Pesanan #{selectedOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#5C4A3D' }}>
                  Dibuat pada {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className={styles.modalCloseBtn}
                aria-label="Tutup modal"
                disabled={modalSubmitting}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Alert Feedback */}
              {modalError && (
                <div className={`${styles.alertNotice} ${styles.noticeDanger}`}>
                  ⚠️ <strong>Peringatan:</strong> {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className={`${styles.alertNotice} ${styles.noticeSuccess}`}>
                  ✅ {modalSuccess}
                </div>
              )}

              {/* Status Notice if Terminal */}
              {selectedOrder.orderStatus === 'COMPLETED' && (
                <div className={`${styles.alertNotice} ${styles.noticeInfo}`}>
                  ℹ️ <strong>Pesanan Selesai:</strong> Transaksi ini telah diselesaikan dan berstatus final. Tidak ada perubahan yang diizinkan.
                </div>
              )}
              {selectedOrder.orderStatus === 'CANCELLED' && (
                <div className={`${styles.alertNotice} ${styles.noticeWarning}`}>
                  🚫 <strong>Pesanan Dibatalkan:</strong> Stok telah dikembalikan ke katalog. Status pesanan tidak dapat diaktifkan kembali.
                  {selectedOrder.paymentStatus === 'PAID' && (
                    <div style={{ marginTop: '0.35rem' }}>
                      Dana pelanggan belum ditandai REFUNDED. Setelah dana ditransfer balik, gunakan tombol di bawah untuk konfirmasi refund.
                    </div>
                  )}
                </div>
              )}

              {/* 1. Rincian Pelanggan & Alamat */}
              <div className={styles.sectionBlock}>
                <div className={styles.sectionTitle}>
                  <span>👤</span> Informasi Pelanggan & Pengiriman
                </div>
                <div className={styles.gridTwoCol}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nama Pelanggan</span>
                    <span className={styles.detailVal}>{selectedOrder.customerName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nomor WhatsApp</span>
                    <span className={styles.detailVal}>
                      <a
                        href={`https://wa.me/${selectedOrder.customerWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#C59A3D', textDecoration: 'underline' }}
                      >
                        {selectedOrder.customerWhatsapp} ↗
                      </a>
                    </span>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email</span>
                      <span className={styles.detailVal}>{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Alamat Kirim</span>
                    <span className={styles.detailVal}>
                      {selectedOrder.shippingAddress}
                      {selectedOrder.shippingCity ? `, ${selectedOrder.shippingCity}` : ''}
                      {selectedOrder.shippingPostalCode ? ` ${selectedOrder.shippingPostalCode}` : ''}
                    </span>
                  </div>
                  {selectedOrder.note && (
                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.detailLabel}>Catatan dari Pelanggan</span>
                      <span className={styles.detailVal} style={{ fontStyle: 'italic' }}>
                        &ldquo;{selectedOrder.note}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Daftar Produk Dipesan */}
              <div className={styles.sectionBlock}>
                <div className={styles.sectionTitle}>
                  <span>🧶</span> Produk Dipesan ({selectedOrder.items?.length || 0} item)
                </div>

                <table className={styles.itemTable}>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {item.product?.images?.[0] ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.productName}
                                width={40}
                                height={40}
                                className={styles.itemImgThumb}
                              />
                            ) : (
                              <div className={styles.itemImgThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                🧶
                              </div>
                            )}
                            <div className={styles.itemDetailCell}>
                              <span className={styles.itemName}>{item.productName}</span>
                              <span className={styles.itemMeta}>
                                SKU: {item.sku}
                                {item.size ? ` | Ukuran: ${item.size}` : ''}
                                {item.variant ? ` | Varian: ${item.variant}` : ''}
                                {item.color ? ` | Warna: ${item.color}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatRupiah(item.unitPrice)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className={styles.financeSummary}>
                  <div className={styles.financeRow}>
                    <span>Subtotal Produk</span>
                    <span>{formatRupiah(selectedOrder.subtotal)}</span>
                  </div>
                  <div className={styles.financeRow}>
                    <span>Ongkos Kirim ({selectedOrder.courier ? selectedOrder.courier.toUpperCase() : 'Ekspedisi'})</span>
                    <span>{formatRupiah(selectedOrder.shippingCost)}</span>
                  </div>
                  <div className={styles.financeRowTotal}>
                    <span>Total Pembayaran</span>
                    <span style={{ color: '#1A120C' }}>{formatRupiah(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* 3. Form Pengelolaan Status & Pengiriman */}
              <form onSubmit={handleSaveUpdate}>
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionTitle}>
                    <span>⚙️</span> Pengelolaan Pesanan & Logistik
                  </div>

                  <div className={styles.gridTwoCol}>
                    {/* Status Pesanan */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="edit-order-status">
                        Status Pesanan
                      </label>
                      <select
                        id="edit-order-status"
                        className={styles.formSelect}
                        value={formDraft.orderStatus}
                        onChange={(e) => setFormDraft({ ...formDraft, orderStatus: e.target.value })}
                        disabled={
                          modalSubmitting ||
                          selectedOrder.orderStatus === 'COMPLETED' ||
                          selectedOrder.orderStatus === 'CANCELLED'
                        }
                      >
                        {/* Options disesuaikan dengan status asal */}
                        <option value={selectedOrder.orderStatus}>
                          {ORDER_STATUS_LABELS[selectedOrder.orderStatus]} (Status Saat Ini)
                        </option>

                        {selectedOrder.orderStatus === 'PENDING' && (
                          <>
                            <option value="PROCESSING">Diproses / Dikemas (PROCESSING)</option>
                            <option value="CANCELLED">Batalkan Pesanan (CANCELLED)</option>
                          </>
                        )}

                        {selectedOrder.orderStatus === 'PROCESSING' && (
                          <>
                            <option value="SHIPPED">Kirim Pesanan (SHIPPED)</option>
                            <option value="CANCELLED">Batalkan Pesanan (CANCELLED)</option>
                          </>
                        )}

                        {selectedOrder.orderStatus === 'SHIPPED' && (
                          <option value="COMPLETED">Tandai Selesai (COMPLETED)</option>
                        )}
                      </select>
                      <span className={styles.formHint}>
                        {selectedOrder.orderStatus === 'PENDING' && 'Catatan: Berpindah ke PROCESSING mewajibkan pembayaran PAID.'}
                        {selectedOrder.orderStatus === 'PROCESSING' && 'Catatan: Berpindah ke SHIPPED mewajibkan Kurir dan Nomor Resi.'}
                      </span>
                    </div>

                    {/* Status Pembayaran */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="edit-payment-status">
                        Status Pembayaran
                      </label>
                      <select
                        id="edit-payment-status"
                        className={styles.formSelect}
                        value={formDraft.paymentStatus}
                        onChange={(e) => setFormDraft({ ...formDraft, paymentStatus: e.target.value })}
                        disabled={
                          modalSubmitting ||
                          selectedOrder.orderStatus === 'COMPLETED' ||
                          selectedOrder.paymentStatus === 'REFUNDED' ||
                          (selectedOrder.orderStatus === 'CANCELLED' && selectedOrder.paymentStatus !== 'PAID')
                        }
                      >
                        <option value={selectedOrder.paymentStatus}>
                          {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]} (Status Saat Ini)
                        </option>

                        {selectedOrder.paymentStatus === 'UNPAID' && (
                          <>
                            <option value="PAID">Lunas (PAID) — Pembayaran Terverifikasi</option>
                            <option value="FAILED">Gagal (FAILED) — Batas Waktu Habis</option>
                          </>
                        )}

                        {selectedOrder.paymentStatus === 'FAILED' && (
                          <option value="PAID">Lunas (PAID) — Transfer Susulan Terverifikasi</option>
                        )}
                      </select>
                      <span className={styles.formHint}>
                        Verifikasi mutasi rekening bank secara manual sebelum menandai Lunas.
                      </span>
                    </div>

                    {/* Kurir Ekspedisi */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="edit-courier">
                        Kurir Pengiriman
                      </label>
                      <input
                        id="edit-courier"
                        type="text"
                        className={styles.formInput}
                        placeholder="Contoh: JNE, J&T, Sicepat, POS"
                        value={formDraft.courier}
                        onChange={(e) => setFormDraft({ ...formDraft, courier: e.target.value })}
                        disabled={
                          modalSubmitting ||
                          selectedOrder.orderStatus === 'COMPLETED' ||
                          selectedOrder.orderStatus === 'CANCELLED'
                        }
                      />
                    </div>

                    {/* Layanan Ekspedisi */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="edit-shipping-service">
                        Layanan Pengiriman
                      </label>
                      <input
                        id="edit-shipping-service"
                        type="text"
                        className={styles.formInput}
                        placeholder="Contoh: REG, YES, BEST, OKE"
                        value={formDraft.shippingService}
                        onChange={(e) => setFormDraft({ ...formDraft, shippingService: e.target.value })}
                        disabled={
                          modalSubmitting ||
                          selectedOrder.orderStatus === 'COMPLETED' ||
                          selectedOrder.orderStatus === 'CANCELLED'
                        }
                      />
                    </div>

                    {/* Nomor Resi */}
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel} htmlFor="edit-tracking-number">
                        Nomor Resi Pengiriman
                      </label>
                      <input
                        id="edit-tracking-number"
                        type="text"
                        className={styles.formInput}
                        placeholder="Masukkan nomor resi pengiriman dari kurir (wajib untuk status SHIPPED)"
                        value={formDraft.trackingNumber}
                        onChange={(e) => setFormDraft({ ...formDraft, trackingNumber: e.target.value })}
                        disabled={
                          modalSubmitting ||
                          selectedOrder.orderStatus === 'COMPLETED' ||
                          selectedOrder.orderStatus === 'CANCELLED'
                        }
                      />
                    </div>

                    {/* Catatan Admin Internal */}
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel} htmlFor="edit-admin-notes">
                        Catatan Internal Admin (Hanya terlihat oleh tim toko)
                      </label>
                      <textarea
                        id="edit-admin-notes"
                        className={styles.formTextarea}
                        placeholder="Tambahkan catatan internal mengenai pesanan, instruksi penenun, nomor rekening refund, dll."
                        value={formDraft.adminNotes}
                        onChange={(e) => setFormDraft({ ...formDraft, adminNotes: e.target.value })}
                        disabled={modalSubmitting || selectedOrder.orderStatus === 'COMPLETED'}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className={styles.modalFooter}>
                  {/* Action 1: Cancel Button (Only if PENDING or PROCESSING) */}
                  {['PENDING', 'PROCESSING'].includes(selectedOrder.orderStatus) && (
                    <button
                      type="button"
                      onClick={handleQuickCancel}
                      className={styles.cancelOrderBtn}
                      disabled={modalSubmitting}
                    >
                      Batalkan Pesanan (Kembalikan Stok)
                    </button>
                  )}

                  {/* Action 2: Refund Button (Only if CANCELLED and PAID) */}
                  {selectedOrder.orderStatus === 'CANCELLED' && selectedOrder.paymentStatus === 'PAID' && (
                    <button
                      type="button"
                      onClick={handleMarkRefunded}
                      className={styles.refundBtn}
                      disabled={modalSubmitting}
                    >
                      Konfirmasi Selesai Refund (REFUNDED)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={styles.secondaryBtn}
                    disabled={modalSubmitting}
                  >
                    Tutup
                  </button>

                  {selectedOrder.orderStatus !== 'COMPLETED' && (
                    <button
                      type="submit"
                      className={styles.primaryBtn}
                      disabled={modalSubmitting}
                    >
                      {modalSubmitting ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

