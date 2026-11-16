// ============================================================
// ADMIN ORDERS SERVICE — TENUN IKAT NURA
// Tahap 4.5.2 — Tahap 3A: Admin Order Management (READ-ONLY)
// ============================================================
//
// Tanggung Jawab:
//   - Mengambil daftar pesanan pelanggan untuk admin (dengan pagination, search, dan filter)
//   - Mengambil detail lengkap 1 pesanan berdasarkan ID atau Nomor Pesanan
//   - Format data konsisten dan aman
//   - Operasi pada tahap ini STRICTLY READ-ONLY (Tanpa mutasi data)
// ============================================================

import prisma from './prisma.js';

const VALID_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const VALID_PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const ALLOWED_UPDATE_FIELDS = [
  'orderStatus',
  'paymentStatus',
  'courier',
  'shippingService',
  'trackingNumber',
  'adminNotes',
];

/**
 * Lazy Prisma client getter to avoid static-import snapshot issues
 * and ensure reuse of global.prisma instance.
 */
function getPrisma() {
  if (global.prisma) return global.prisma;
  if (prisma) return prisma;
  if (!process.env.DATABASE_URL) return null;

  try {
    const { PrismaClient } = require('@prisma/client');
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    return global.prisma;
  } catch (err) {
    console.warn('[AdminOrders] Prisma init deferred:', err.message);
    return null;
  }
}

/**
 * Parse dan validasi string tanggal untuk batas filter (start/end)
 * Menggunakan zona waktu Indonesia Barat (WIB / UTC+7).
 *
 * @param {string} dateStr
 * @param {'start'|'end'} boundary
 * @returns {Date|null}
 */
function parseDateBoundary(dateStr, boundary = 'start') {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Format YYYY-MM-DD
  const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (ymdRegex.test(trimmed)) {
    const isoString =
      boundary === 'start'
        ? `${trimmed}T00:00:00.000+07:00`
        : `${trimmed}T23:59:59.999+07:00`;
    const parsed = new Date(isoString);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  }

  // Jika input dalam format ISO atau datetime lain
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;

  if (boundary === 'end' && !trimmed.includes('T')) {
    parsed.setHours(23, 59, 59, 999);
  }
  return parsed;
}

/**
 * Normalisasi item pesanan untuk tampilan admin
 */
function normalizeOrderItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    size: item.size || null,
    variant: item.variant || null,
    color: item.color || null,
    unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    subtotal: typeof item.subtotal === 'number' ? item.subtotal : 0,
    product: item.product
      ? {
          id: item.product.id,
          sku: item.product.sku,
          name: item.product.name,
          slug: item.product.slug,
          images: Array.isArray(item.product.images) ? item.product.images : [],
          stock: typeof item.product.stock === 'number' ? item.product.stock : 0,
          price: typeof item.product.price === 'number' ? item.product.price : 0,
        }
      : null,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
  };
}

/**
 * Normalisasi objek Order untuk respon admin
 */
function normalizeOrder(order) {
  if (!order) return null;

  const items = Array.isArray(order.items)
    ? order.items.map(normalizeOrderItem).filter(Boolean)
    : [];

  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerName: order.customerName,
    customerWhatsapp: order.customerWhatsapp,
    customerEmail: order.customerEmail || null,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity || null,
    shippingPostalCode: order.shippingPostalCode || null,
    courier: order.courier || null,
    shippingService: order.shippingService || null,
    trackingNumber: order.trackingNumber || null,
    note: order.note || null,
    adminNotes: order.adminNotes || null,
    subtotal: typeof order.subtotal === 'number' ? order.subtotal : 0,
    shippingCost: typeof order.shippingCost === 'number' ? order.shippingCost : 0,
    total: typeof order.total === 'number' ? order.total : 0,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    items,
    totalItemsCount,
    user: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone || null,
          role: order.user.role || 'USER',
        }
      : null,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
  };
}

/**
 * Mengambil daftar pesanan pelanggan untuk admin
 * Mendukung pagination, filter orderStatus, paymentStatus, dan pencarian.
 *
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=15]
 * @param {string} [options.search]
 * @param {string} [options.orderStatus]
 * @param {string} [options.paymentStatus]
 * @param {string} [options.startDate]
 * @param {string} [options.endDate]
 * @returns {Promise<{ orders: Array, pagination: Object }>}
 */
export async function getAdminOrders({
  page = 1,
  limit = 15,
  search = '',
  orderStatus = '',
  paymentStatus = '',
  startDate = '',
  endDate = '',
} = {}) {
  const db = getPrisma();
  if (!db) {
    const err = new Error('Database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  // 1. Sanitasi Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
  const skip = (pageNum - 1) * limitNum;

  // 2. Bangun Filter Query
  const where = {};

  // Filter Order Status jika valid
  if (orderStatus && typeof orderStatus === 'string') {
    const cleanOrderStatus = orderStatus.trim().toUpperCase();
    if (VALID_ORDER_STATUSES.includes(cleanOrderStatus)) {
      where.orderStatus = cleanOrderStatus;
    }
  }

  // Filter Payment Status jika valid
  if (paymentStatus && typeof paymentStatus === 'string') {
    const cleanPaymentStatus = paymentStatus.trim().toUpperCase();
    if (VALID_PAYMENT_STATUSES.includes(cleanPaymentStatus)) {
      where.paymentStatus = cleanPaymentStatus;
    }
  }

  // Filter Rentang Tanggal (createdAt)
  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate && typeof startDate === 'string' && startDate.trim()) {
    parsedStartDate = parseDateBoundary(startDate, 'start');
    if (!parsedStartDate) {
      const err = new Error('Format tanggal mulai (startDate) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  if (endDate && typeof endDate === 'string' && endDate.trim()) {
    parsedEndDate = parseDateBoundary(endDate, 'end');
    if (!parsedEndDate) {
      const err = new Error('Format tanggal akhir (endDate) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    const err = new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
    err.statusCode = 400;
    throw err;
  }

  if (parsedStartDate || parsedEndDate) {
    where.createdAt = {};
    if (parsedStartDate) {
      where.createdAt.gte = parsedStartDate;
    }
    if (parsedEndDate) {
      where.createdAt.lte = parsedEndDate;
    }
  }

  // Filter Pencarian
  if (search && typeof search === 'string') {
    const cleanSearch = search.trim();
    if (cleanSearch.length > 0) {
      where.OR = [
        { orderNumber: { contains: cleanSearch, mode: 'insensitive' } },
        { customerName: { contains: cleanSearch, mode: 'insensitive' } },
        { customerWhatsapp: { contains: cleanSearch, mode: 'insensitive' } },
        { customerEmail: { contains: cleanSearch, mode: 'insensitive' } },
        { trackingNumber: { contains: cleanSearch, mode: 'insensitive' } },
        { courier: { contains: cleanSearch, mode: 'insensitive' } },
      ];
    }
  }

  // 3. Eksekusi Query Count & FindMany secara paralel
  const [total, rawOrders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            sku: true,
            productName: true,
            size: true,
            variant: true,
            color: true,
            unitPrice: true,
            quantity: true,
            subtotal: true,
            productId: true,
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
  ]);

  const orders = rawOrders.map(normalizeOrder);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    },
  };
}

/**
 * Mengambil detail satu pesanan berdasarkan ID atau OrderNumber
 *
 * @param {string} idOrOrderNumber
 * @returns {Promise<Object|null>}
 */
export async function getAdminOrderById(idOrOrderNumber) {
  if (!idOrOrderNumber || typeof idOrOrderNumber !== 'string') {
    return null;
  }

  const db = getPrisma();
  if (!db) {
    const err = new Error('Database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  const cleanIdentifier = idOrOrderNumber.trim();

  const rawOrder = await db.order.findFirst({
    where: {
      OR: [
        { id: cleanIdentifier },
        { orderNumber: cleanIdentifier },
      ],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              slug: true,
              images: true,
              stock: true,
              price: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!rawOrder) {
    return null;
  }

  return normalizeOrder(rawOrder);
}

/**
 * Memperbarui data pesanan untuk admin (Status, Pembayaran, Pengiriman, Catatan).
 * Mematuhi strict state transition matrix dan pengembalian stok atomik saat pembatalan.
 *
 * @param {string} idOrOrderNumber
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateAdminOrder(idOrOrderNumber, updateData) {
  if (!idOrOrderNumber || typeof idOrOrderNumber !== 'string') {
    const err = new Error('Identifikasi pesanan (ID atau Nomor Pesanan) tidak valid.');
    err.statusCode = 400;
    throw err;
  }

  if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
    const err = new Error('Payload perubahan harus berupa objek JSON.');
    err.statusCode = 400;
    throw err;
  }

  // 1. Whitelist field check
  const submittedKeys = Object.keys(updateData);
  if (submittedKeys.length === 0) {
    const err = new Error('Data perubahan tidak boleh kosong.');
    err.statusCode = 400;
    throw err;
  }

  for (const key of submittedKeys) {
    if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
      const err = new Error(`Field "${key}" tidak diizinkan untuk diubah melalui endpoint ini.`);
      err.statusCode = 400;
      throw err;
    }
  }

  const db = getPrisma();
  if (!db) {
    const err = new Error('Database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  // 2. Ambil data pesanan saat ini
  const cleanIdentifier = idOrOrderNumber.trim();
  const currentOrder = await db.order.findFirst({
    where: {
      OR: [
        { id: cleanIdentifier },
        { orderNumber: cleanIdentifier },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      courier: true,
      shippingService: true,
      trackingNumber: true,
      adminNotes: true,
    },
  });

  if (!currentOrder) {
    const err = new Error(`Pesanan dengan identifikasi "${idOrOrderNumber}" tidak ditemukan.`);
    err.statusCode = 404;
    throw err;
  }

  // ── PERBAIKAN 2: COMPLETED benar-benar final ──────────────
  // Tolak seluruh perubahan tanpa pengecualian pada pesanan COMPLETED.
  if (currentOrder.orderStatus === 'COMPLETED') {
    const err = new Error(
      'Pesanan dengan status COMPLETED bersifat final. Tidak ada perubahan yang diizinkan melalui endpoint ini.'
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Ekstrak, sanitasi & validasi tipe tiap field
  let targetOrderStatus = undefined;
  if (updateData.orderStatus !== undefined) {
    if (typeof updateData.orderStatus !== 'string') {
      const err = new Error('Status pesanan (orderStatus) harus berupa teks.');
      err.statusCode = 400;
      throw err;
    }
    targetOrderStatus = updateData.orderStatus.trim().toUpperCase();
    if (!VALID_ORDER_STATUSES.includes(targetOrderStatus)) {
      const err = new Error(
        `Status pesanan "${updateData.orderStatus}" tidak valid. Pilihan: ${VALID_ORDER_STATUSES.join(', ')}.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  let targetPaymentStatus = undefined;
  if (updateData.paymentStatus !== undefined) {
    if (typeof updateData.paymentStatus !== 'string') {
      const err = new Error('Status pembayaran (paymentStatus) harus berupa teks.');
      err.statusCode = 400;
      throw err;
    }
    targetPaymentStatus = updateData.paymentStatus.trim().toUpperCase();
    if (!VALID_PAYMENT_STATUSES.includes(targetPaymentStatus)) {
      const err = new Error(
        `Status pembayaran "${updateData.paymentStatus}" tidak valid. Pilihan: ${VALID_PAYMENT_STATUSES.join(', ')}.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  let targetCourier = undefined;
  if (updateData.courier !== undefined) {
    if (updateData.courier === null) {
      targetCourier = null;
    } else if (typeof updateData.courier === 'string') {
      targetCourier = updateData.courier.trim();
      if (targetCourier.length > 100) {
        const err = new Error('Nama kurir maksimal 100 karakter.');
        err.statusCode = 400;
        throw err;
      }
      if (targetCourier.length === 0) targetCourier = null;
    } else {
      const err = new Error('Format kurir (courier) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  let targetShippingService = undefined;
  if (updateData.shippingService !== undefined) {
    if (updateData.shippingService === null) {
      targetShippingService = null;
    } else if (typeof updateData.shippingService === 'string') {
      targetShippingService = updateData.shippingService.trim();
      if (targetShippingService.length > 100) {
        const err = new Error('Layanan pengiriman (shippingService) maksimal 100 karakter.');
        err.statusCode = 400;
        throw err;
      }
      if (targetShippingService.length === 0) targetShippingService = null;
    } else {
      const err = new Error('Format layanan pengiriman (shippingService) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  let targetTrackingNumber = undefined;
  if (updateData.trackingNumber !== undefined) {
    if (updateData.trackingNumber === null) {
      targetTrackingNumber = null;
    } else if (typeof updateData.trackingNumber === 'string') {
      targetTrackingNumber = updateData.trackingNumber.trim();
      if (targetTrackingNumber.length > 100) {
        const err = new Error('Nomor resi (trackingNumber) maksimal 100 karakter.');
        err.statusCode = 400;
        throw err;
      }
      if (targetTrackingNumber.length === 0) targetTrackingNumber = null;
    } else {
      const err = new Error('Format nomor resi (trackingNumber) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  let targetAdminNotes = undefined;
  if (updateData.adminNotes !== undefined) {
    if (updateData.adminNotes === null) {
      targetAdminNotes = null;
    } else if (typeof updateData.adminNotes === 'string') {
      targetAdminNotes = updateData.adminNotes.trim();
      if (targetAdminNotes.length > 2000) {
        const err = new Error('Catatan admin (adminNotes) maksimal 2000 karakter.');
        err.statusCode = 400;
        throw err;
      }
    } else {
      const err = new Error('Format catatan admin (adminNotes) tidak valid.');
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Hitung status efektif setelah perubahan
  const effectiveOrderStatus = targetOrderStatus || currentOrder.orderStatus;
  const effectivePaymentStatus = targetPaymentStatus || currentOrder.paymentStatus;

  // ── PERBAIKAN 1: Refund harus melalui dua request terpisah ──
  // Pembatalan dan pengembalian dana tidak boleh dilakukan sekaligus.
  // Admin wajib membatalkan pesanan terlebih dahulu, lalu mengirim
  // PATCH terpisah untuk mengubah paymentStatus ke REFUNDED setelah
  // dana benar-benar dikembalikan ke pelanggan.
  if (targetOrderStatus === 'CANCELLED' && targetPaymentStatus === 'REFUNDED') {
    const err = new Error(
      'Pembatalan pesanan dan pengembalian dana (REFUNDED) tidak dapat dilakukan dalam satu request. ' +
      'Batalkan pesanan terlebih dahulu, kemudian perbarui status pembayaran ke REFUNDED setelah dana benar-benar dikembalikan.'
    );
    err.statusCode = 400;
    throw err;
  }

  // 5. Validasi Aturan Transisi orderStatus
  if (targetOrderStatus && targetOrderStatus !== currentOrder.orderStatus) {
    const from = currentOrder.orderStatus;
    const to = targetOrderStatus;

    // Status final tidak boleh diubah
    if (from === 'CANCELLED') {
      const err = new Error('Pesanan dengan status CANCELLED bersifat final dan tidak dapat diubah kembali.');
      err.statusCode = 400;
      throw err;
    }
    if (from === 'COMPLETED') {
      const err = new Error('Pesanan dengan status COMPLETED bersifat final dan tidak dapat diubah kembali.');
      err.statusCode = 400;
      throw err;
    }

    if (from === 'PENDING') {
      if (to === 'PROCESSING') {
        if (effectivePaymentStatus !== 'PAID') {
          const err = new Error(
            'Perubahan status ke PROCESSING hanya diizinkan jika status pembayaran adalah PAID.'
          );
          err.statusCode = 400;
          throw err;
        }
      } else if (to === 'CANCELLED') {
        // Diizinkan (akan mengembalikan stok)
      } else {
        const err = new Error(`Transisi status pesanan dari ${from} ke ${to} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else if (from === 'PROCESSING') {
      if (to === 'SHIPPED') {
        const effCourier = targetCourier !== undefined ? targetCourier : currentOrder.courier;
        const effTracking = targetTrackingNumber !== undefined ? targetTrackingNumber : currentOrder.trackingNumber;

        if (!effCourier || !effCourier.trim()) {
          const err = new Error('Perubahan status ke SHIPPED mewajibkan Kurir (courier) yang valid.');
          err.statusCode = 400;
          throw err;
        }
        if (!effTracking || !effTracking.trim()) {
          const err = new Error('Perubahan status ke SHIPPED mewajibkan Nomor Resi (trackingNumber) yang valid.');
          err.statusCode = 400;
          throw err;
        }
      } else if (to === 'CANCELLED') {
        // Diizinkan (akan mengembalikan stok)
      } else {
        const err = new Error(`Transisi status pesanan dari ${from} ke ${to} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else if (from === 'SHIPPED') {
      if (to === 'COMPLETED') {
        // Diizinkan
      } else {
        const err = new Error(`Transisi status pesanan dari ${from} ke ${to} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else {
      const err = new Error(`Transisi status pesanan dari ${from} ke ${to} tidak diizinkan.`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 6. Validasi Aturan Transisi paymentStatus
  if (targetPaymentStatus && targetPaymentStatus !== currentOrder.paymentStatus) {
    const fromPay = currentOrder.paymentStatus;
    const toPay = targetPaymentStatus;

    if (fromPay === 'REFUNDED') {
      const err = new Error('Status pembayaran REFUNDED bersifat final dan tidak dapat diubah kembali.');
      err.statusCode = 400;
      throw err;
    }

    if (fromPay === 'UNPAID') {
      if (toPay === 'PAID' || toPay === 'FAILED') {
        // Diizinkan
      } else {
        const err = new Error(`Transisi status pembayaran dari ${fromPay} ke ${toPay} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else if (fromPay === 'FAILED') {
      if (toPay === 'PAID') {
        // Diizinkan (transfer susulan diverifikasi)
      } else {
        const err = new Error(`Transisi status pembayaran dari ${fromPay} ke ${toPay} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else if (fromPay === 'PAID') {
      if (toPay === 'REFUNDED') {
        if (effectiveOrderStatus !== 'CANCELLED') {
          const err = new Error(
            'Status pembayaran REFUNDED hanya diizinkan jika pesanan berstatus CANCELLED dan refund telah dilakukan.'
          );
          err.statusCode = 400;
          throw err;
        }
      } else {
        const err = new Error(`Transisi status pembayaran dari ${fromPay} ke ${toPay} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else if (fromPay === 'PENDING') {
      if (toPay === 'PAID' || toPay === 'FAILED') {
        // Diizinkan
      } else {
        const err = new Error(`Transisi status pembayaran dari ${fromPay} ke ${toPay} tidak diizinkan.`);
        err.statusCode = 400;
        throw err;
      }
    } else {
      const err = new Error(`Transisi status pembayaran dari ${fromPay} ke ${toPay} tidak diizinkan.`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 7. Validasi update data umum pada status final
  if (!targetOrderStatus) {
    if (currentOrder.orderStatus === 'CANCELLED') {
      if (targetCourier !== undefined || targetShippingService !== undefined || targetTrackingNumber !== undefined) {
        const err = new Error('Tidak dapat mengubah informasi pengiriman untuk pesanan yang sudah dibatalkan.');
        err.statusCode = 400;
        throw err;
      }
    } else if (currentOrder.orderStatus === 'COMPLETED') {
      if (targetCourier !== undefined || targetShippingService !== undefined || targetTrackingNumber !== undefined) {
        const err = new Error('Tidak dapat mengubah informasi pengiriman untuk pesanan yang sudah selesai.');
        err.statusCode = 400;
        throw err;
      }
    } else if (currentOrder.orderStatus === 'SHIPPED') {
      // Pada SHIPPED, kurir atau nomor resi tidak boleh dikosongkan jika sedang diubah
      const effCourier = targetCourier !== undefined ? targetCourier : currentOrder.courier;
      const effTracking = targetTrackingNumber !== undefined ? targetTrackingNumber : currentOrder.trackingNumber;
      if (!effCourier || !effCourier.trim() || !effTracking || !effTracking.trim()) {
        const err = new Error('Pesanan berstatus SHIPPED tidak boleh mengosongkan Kurir atau Nomor Resi.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  // 8. Eksekusi Mutasi Database
  // Skenario A: Pembatalan Pesanan (Wajib Conditional Atomic Update + Stock Increment)
  if (targetOrderStatus === 'CANCELLED' && currentOrder.orderStatus !== 'CANCELLED') {
    if (typeof db.$transaction !== 'function') {
      const err = new Error('Layanan transaksi database tidak tersedia. Pembatalan dibatalkan.');
      err.statusCode = 500;
      throw err;
    }

    await db.$transaction(async (tx) => {
      // 8a. Conditional Atomic Update: Hanya ubah jika status saat ini PENDING atau PROCESSING
      const updateResult = await tx.order.updateMany({
        where: {
          id: currentOrder.id,
          orderStatus: { in: ['PENDING', 'PROCESSING'] },
        },
        data: {
          orderStatus: 'CANCELLED',
          ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {}),
          ...(targetCourier !== undefined ? { courier: targetCourier } : {}),
          ...(targetShippingService !== undefined ? { shippingService: targetShippingService } : {}),
          ...(targetTrackingNumber !== undefined ? { trackingNumber: targetTrackingNumber } : {}),
          ...(targetAdminNotes !== undefined ? { adminNotes: targetAdminNotes } : {}),
        },
      });

      // 8b. Strict Concurrency Guard: Hanya count === 1 yang diizinkan melanjutkan
      if (updateResult.count === 0) {
        const err = new Error(
          'Gagal membatalkan pesanan: Pesanan tidak ditemukan, sudah dibatalkan sebelumnya, atau telah memasuki status yang tidak dapat dibatalkan.'
        );
        err.statusCode = 409;
        throw err;
      }

      // 8c. Ambil seluruh item pesanan di dalam transaksi yang sama
      const items = await tx.orderItem.findMany({
        where: { orderId: currentOrder.id },
        select: {
          id: true,
          productId: true,
          quantity: true,
          productName: true,
        },
      });

      // 8d. Kembalikan stok untuk setiap item produk
      for (const item of items) {
        if (item.productId) {
          const stockResult = await tx.product.updateMany({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });

          if (stockResult.count === 0) {
            console.warn(
              `[Stock Return] Produk "${item.productName}" (ID: ${item.productId}) tidak ditemukan di database. Pengembalian stok item ini dilewati.`
            );
          }
        } else {
          console.warn(
            `[Stock Return] Item "${item.productName}" tidak memiliki productId (produk master terhapus). Pengembalian stok dilewati.`
          );
        }
      }
    });
  } else {
    // Skenario B: Update Non-Pembatalan (Normal Update)
    await db.order.update({
      where: { id: currentOrder.id },
      data: {
        ...(targetOrderStatus ? { orderStatus: targetOrderStatus } : {}),
        ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {}),
        ...(targetCourier !== undefined ? { courier: targetCourier } : {}),
        ...(targetShippingService !== undefined ? { shippingService: targetShippingService } : {}),
        ...(targetTrackingNumber !== undefined ? { trackingNumber: targetTrackingNumber } : {}),
        ...(targetAdminNotes !== undefined ? { adminNotes: targetAdminNotes } : {}),
      },
    });
  }

  // 9. Ambil dan kembalikan data pesanan terbaru yang dinormalisasi
  const updatedOrder = await getAdminOrderById(currentOrder.id);
  return updatedOrder;
}

