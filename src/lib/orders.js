// ============================================================
// ORDER SERVICE — TENUN IKAT NURA
// Phase 3B-2: Order Service + API
// ============================================================
//
// Responsibility:
//   - Validate customer data and cart items
//   - Fetch product data from database (never trust client prices)
//   - Create Order + OrderItem in a single Prisma transaction
//   - Decrement stock atomically within the same transaction
//
// Guest Checkout: supported (no customer auth required)
// ============================================================

import { calculateShippingCost } from './rajaOngkir.js';
import { isCustomSize } from './sizes.js';

// ──────────────────────────────────────────────────────────────
// PRISMA — lazy getter to match the singleton pattern in prisma.js
// ──────────────────────────────────────────────────────────────

/**
 * Return the Prisma client instance.
 * Reads from global singleton (set by prisma.js) or initializes lazily.
 * This avoids the static-import snapshot issue where prisma.js exports
 * null if evaluated before DATABASE_URL is available.
 */
function getPrisma() {
  // Reuse the same singleton key that lib/prisma.js uses so all service
  // files share one PrismaClient instance (avoids connection pool issues).
  if (global.prisma) return global.prisma;

  if (!process.env.DATABASE_URL) return null;

  try {
    const { PrismaClient } = require('@prisma/client');
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    return global.prisma;
  } catch (err) {
    console.warn('[Orders] Prisma init failed:', err.message);
    return null;
  }
}

/**
 * Check whether the database (Prisma) is available.
 */
function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL && getPrisma());
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

/**
 * Generate a unique, human-readable order number.
 * Format: NURA-YYYYMMDD-XXXX  (XXXX = 4-char random alphanumeric)
 * The database unique constraint is the final safety net against collision.
 */
function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NURA-${yyyy}${mm}${dd}-${suffix}`;
}

/**
 * Simple email format check.
 * Returns true if value looks like an email, false otherwise.
 * Undefined/null/empty → considered valid (field is optional).
 */
function isValidEmail(value) {
  if (!value || !value.trim()) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ──────────────────────────────────────────────────────────────
// VALIDATE CUSTOMER INPUT
// Returns { valid: true } | { valid: false, message, status }
// ──────────────────────────────────────────────────────────────

function validateCustomerInput(data) {
  if (!data.customerName || !String(data.customerName).trim()) {
    return { valid: false, message: 'Nama pelanggan wajib diisi.', status: 400 };
  }

  if (!data.customerWhatsapp || !String(data.customerWhatsapp).trim()) {
    return { valid: false, message: 'Nomor WhatsApp pelanggan wajib diisi.', status: 400 };
  }

  if (!data.shippingAddress || !String(data.shippingAddress).trim()) {
    return { valid: false, message: 'Alamat pengiriman wajib diisi.', status: 400 };
  }

  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    return { valid: false, message: 'Format email tidak valid.', status: 400 };
  }

  return { valid: true };
}

// ──────────────────────────────────────────────────────────────
// VALIDATE ITEMS ARRAY
// Returns { valid: true } | { valid: false, message, status }
// ──────────────────────────────────────────────────────────────

function validateItemsInput(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Daftar produk (items) wajib diisi dan tidak boleh kosong.', status: 400 };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Block Custom Size items from order creation — must consult via WhatsApp first
    if (item.size && isCustomSize(item.size)) {
      return {
        valid: false,
        message: 'Produk dengan Custom Size memerlukan konsultasi dan konfirmasi WhatsApp Admin terlebih dahulu sebelum pesanan diproses.',
        status: 400,
      };
    }

    if (!item.productId || !String(item.productId).trim()) {
      return { valid: false, message: `Item ke-${i + 1}: productId wajib diisi.`, status: 400 };
    }

    const qty = item.quantity;
    if (
      qty === undefined ||
      qty === null ||
      typeof qty !== 'number' ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return {
        valid: false,
        message: `Item ke-${i + 1}: quantity harus berupa bilangan bulat minimal 1.`,
        status: 400,
      };
    }
  }

  return { valid: true };
}

// ──────────────────────────────────────────────────────────────
// NORMALIZE ITEMS
// Merge duplicate (productId + size + variant) entries by summing quantity.
// ──────────────────────────────────────────────────────────────

function normalizeItems(items) {
  const map = new Map();

  for (const item of items) {
    const key = `${item.productId}__${item.size ?? ''}__${item.variant ?? ''}`;
    if (map.has(key)) {
      map.get(key).quantity += item.quantity;
    } else {
      map.set(key, {
        productId: String(item.productId).trim(),
        size: item.size ? String(item.size).trim() : null,
        variant: item.variant ? String(item.variant).trim() : null,
        quantity: item.quantity,
      });
    }
  }

  return Array.from(map.values());
}

// ──────────────────────────────────────────────────────────────
// CREATE ORDER
// ──────────────────────────────────────────────────────────────

/**
 * Create an order from validated customer data + cart items.
 * Shipping cost is calculated and verified server-side via Komerce API.
 *
 * @param {Object} params
 * @param {string}  params.userId              - required
 * @param {string}  params.customerName        - required
 * @param {string}  params.customerWhatsapp    - required
 * @param {string}  [params.customerEmail]     - optional
 * @param {string}  params.shippingAddress     - required
 * @param {string}  [params.shippingCity]      - optional
 * @param {string}  [params.shippingPostalCode]- optional
 * @param {string}  [params.note]              - optional
 * @param {string}  params.destinationId       - required Komerce destination ID
 * @param {string}  params.courier             - required Courier code e.g. 'jne', 'jnt'
 * @param {string}  params.shippingService     - required Service name e.g. 'REG', 'YES'
 * @param {Array}   params.items               - required, non-empty
 *   Each item: { productId, quantity, size?, variant? }
 *
 * @returns {Object} Created order summary { id, orderNumber, subtotal, shippingCost, total, orderStatus, paymentStatus }
 * @throws  {Error}  with .statusCode and .message
 */
export async function createOrder(params) {
  const {
    userId,
    customerName,
    customerWhatsapp,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingPostalCode,
    note,
    // Shipping (Komerce) — verified server-side
    destinationId,
    courier,
    shippingService,
    items,
  } = params;

  // ── 0. Guard: DB must be available ──────────────────────
  const prisma = getPrisma();
  if (!prisma) {
    const err = new Error('Database tidak tersedia. Order tidak dapat diproses.');
    err.statusCode = 503;
    throw err;
  }

  // ── 0b. Guard: User ID must be present (Guest cannot create order) ──
  if (!userId || !String(userId).trim()) {
    const err = new Error('Akses ditolak: Silakan login terlebih dahulu untuk membuat pesanan.');
    err.statusCode = 401;
    throw err;
  }

  // ── 1. Validate customer ──────────────────────────────────
  const customerCheck = validateCustomerInput(params);
  if (!customerCheck.valid) {
    const err = new Error(customerCheck.message);
    err.statusCode = customerCheck.status;
    throw err;
  }

  // ── 2. Validate items array ───────────────────────────────
  const itemsCheck = validateItemsInput(items);
  if (!itemsCheck.valid) {
    const err = new Error(itemsCheck.message);
    err.statusCode = itemsCheck.status;
    throw err;
  }

  // ── 3. Normalize (merge duplicates) ──────────────────────
  const normalizedItems = normalizeItems(items);

  // ── 4. Fetch all required products from DB ────────────────
  const productIds = [...new Set(normalizedItems.map((i) => i.productId))];

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      sizes: true,
      weight: true,
      isActive: true,
      isVisible: true,
    },
  });

  // Build a lookup map for fast access
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // ── 5. Validate each item against DB product ──────────────
  const resolvedItems = []; // will contain enriched items ready for DB write

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);

    // 5a. Product must exist
    if (!product) {
      const err = new Error(`Produk dengan ID "${item.productId}" tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    // 5b. Product must be active and visible
    if (!product.isActive || !product.isVisible) {
      const err = new Error(`Produk "${product.name}" tidak tersedia.`);
      err.statusCode = 400;
      throw err;
    }

    // 5c. Validate size (only when product has sizes defined)
    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0 &&
      item.size &&
      !product.sizes.includes(item.size)
    ) {
      const err = new Error(
        `Ukuran "${item.size}" tidak tersedia untuk produk "${product.name}". ` +
          `Ukuran yang tersedia: ${product.sizes.join(', ')}.`
      );
      err.statusCode = 400;
      throw err;
    }

    // 5d. Stock check
    if (product.stock < item.quantity) {
      const err = new Error(
        `Stok produk "${product.name}" tidak mencukupi. ` +
          `Tersedia: ${product.stock}, diminta: ${item.quantity}.`
      );
      err.statusCode = 409;
      throw err;
    }

    // 5e. Price ALWAYS from DB — never from client
    const unitPrice = product.price; // Int in IDR
    const subtotal = unitPrice * item.quantity;

    resolvedItems.push({
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      size: item.size ?? null,
      variant: item.variant ?? null,
      unitPrice,
      quantity: item.quantity,
      subtotal,
      currentStock: product.stock,
    });
  }

  // ── 6. Server-Side Shipping Calculation & Verification ────
  // Client shippingCost is NEVER trusted. Server recalculates and verifies
  // the exact rate via Komerce API using DB product weights.

  // 6a. Validate destination ID
  const destIdStr = destinationId ? String(destinationId).trim() : '';
  if (!destIdStr) {
    const err = new Error('Tujuan pengiriman (destinationId) wajib dipilih.');
    err.statusCode = 400;
    throw err;
  }

  // 6b. Validate courier
  const supportedCouriers = ['jne', 'pos', 'tiki', 'sicepat', 'jnt', 'anteraja', 'ninja', 'idexpress', 'lion', 'wahana'];
  const cleanCourier = (courier || '').toLowerCase().trim();
  if (!cleanCourier || !supportedCouriers.includes(cleanCourier)) {
    const err = new Error(
      `Kurir pengiriman "${courier || ''}" tidak valid atau tidak didukung. Pilihan: ${supportedCouriers.join(', ')}.`
    );
    err.statusCode = 400;
    throw err;
  }

  // 6c. Validate shipping service
  const serviceStr = shippingService ? String(shippingService).trim() : '';
  if (!serviceStr) {
    const err = new Error('Layanan pengiriman (shippingService) wajib dipilih.');
    err.statusCode = 400;
    throw err;
  }

  // 6d. Calculate total weight from database products (minimum 1 gram)
  const totalWeightGrams = resolvedItems.reduce((sum, item) => {
    const prod = productMap.get(item.productId);
    const itemWeight = (prod && typeof prod.weight === 'number' && prod.weight > 0)
      ? prod.weight
      : 1000;
    return sum + (itemWeight * item.quantity);
  }, 0);
  const totalWeight = Math.max(1, totalWeightGrams);

  // 6e. Call Komerce shipping calculation API
  let availableServices = [];
  try {
    availableServices = await calculateShippingCost({
      destinationId: destIdStr,
      weight: totalWeight,
      courier: cleanCourier,
    });
  } catch (shippingErr) {
    console.error('[Orders] calculateShippingCost error:', shippingErr.message);
    const err = new Error(shippingErr.message || 'Gagal menghitung ongkos kirim melalui layanan ekspedisi.');
    err.statusCode = shippingErr.statusCode || 502;
    throw err;
  }

  if (!Array.isArray(availableServices) || availableServices.length === 0) {
    const err = new Error(
      `Tidak ada layanan pengiriman yang tersedia untuk kurir ${cleanCourier.toUpperCase()} ke tujuan ini.`
    );
    err.statusCode = 400;
    throw err;
  }

  // 6f. Validate that the selected service is available in current rates
  const targetService = serviceStr.toLowerCase();
  const matchedService = availableServices.find(
    (s) => s.service && s.service.trim().toLowerCase() === targetService
  );

  if (!matchedService) {
    const availableNames = availableServices.map((s) => s.service).filter(Boolean).join(', ');
    const err = new Error(
      `Layanan pengiriman "${serviceStr}" tidak valid untuk kurir ${cleanCourier.toUpperCase()}. Pilihan tersedia: ${availableNames || '-'}.`
    );
    err.statusCode = 400;
    throw err;
  }

  // 6g. Extract verified shipping cost from server result (IGNORING client value)
  const rawCost = matchedService.cost;
  const verifiedCost = typeof rawCost === 'string' && rawCost.trim() === ''
    ? NaN
    : Number(rawCost);

  if (rawCost === null || rawCost === undefined || !Number.isFinite(verifiedCost) || verifiedCost < 0) {
    const err = new Error('Tarif pengiriman dari layanan ekspedisi tidak valid.');
    err.statusCode = 502;
    throw err;
  }
  const shippingCost = verifiedCost;

  // ── 7. Calculate totals ───────────────────────────────────
  const orderSubtotal  = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const orderTotal     = orderSubtotal + shippingCost;

  // ── 8. Generate order number ──────────────────────────────
  const orderNumber = generateOrderNumber();

  // ── 8. Create Order + OrderItems + decrement stock in an atomic database transaction ──
  // Transaction is strictly mandatory. Never proceed without an atomic database transaction.
  if (typeof prisma.$transaction !== 'function') {
    const err = new Error('Layanan transaksi database tidak tersedia. Pembuatan pesanan dibatalkan.');
    err.statusCode = 500;
    throw err;
  }

  let createdOrder = null;

  try {
    createdOrder = await prisma.$transaction(async (tx) => {
      // 8a. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: String(userId).trim(),
          customerName: customerName.trim(),
          customerWhatsapp: customerWhatsapp.trim(),
          customerEmail: customerEmail ? customerEmail.trim() : null,
          shippingAddress: shippingAddress.trim(),
          shippingCity: shippingCity ? shippingCity.trim() : null,
          shippingPostalCode: shippingPostalCode ? shippingPostalCode.trim() : null,
          note: note ? note.trim() : null,
          subtotal: orderSubtotal,
          shippingCost,
          total: orderTotal,
          orderStatus: 'PENDING',
          paymentStatus: 'UNPAID',
        },
      });

      // 8b. Create OrderItems
      await tx.orderItem.createMany({
        data: resolvedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          size: item.size,
          variant: item.variant,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      });

      // 8c. Decrement stock atomically within the same transaction.
      //     Use updateMany with WHERE stock >= quantity to prevent negative stock.
      //     If stock ran out concurrently, count will be 0 and we throw an error with 409 status,
      //     triggering an immediate database ROLLBACK of the order, items, and any prior item stock updates.
      for (const item of resolvedItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // atomic guard against negative stock
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          const err = new Error(
            `Stok produk "${item.productName}" habis saat proses order. ` +
              `Diminta: ${item.quantity}.`
          );
          err.statusCode = 409;
          throw err;
        }
      }

      return order;
    });
  } catch (txErr) {
    // Re-throw with appropriate status code
    if (!txErr.statusCode) txErr.statusCode = 500;
    throw txErr;
  }

  // ── 9. Return order summary ───────────────────────────────
  return {
    id: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    userId: createdOrder.userId,
    subtotal: createdOrder.subtotal,
    shippingCost: createdOrder.shippingCost,
    total: createdOrder.total,
    orderStatus: createdOrder.orderStatus,
    paymentStatus: createdOrder.paymentStatus,
  };
}

// ──────────────────────────────────────────────────────────────
// CUSTOMER ORDER RETRIEVAL
// ──────────────────────────────────────────────────────────────

/**
 * Mengambil seluruh riwayat pesanan milik pelanggan tertentu.
 * Mengisolasi query berdasarkan userId dari sesi pelanggan yang valid.
 *
 * @param {string} userId - ID pelanggan terverifikasi
 * @returns {Promise<Array>} Daftar pesanan terformat
 */
export async function getCustomerOrders(userId) {
  if (!userId || typeof userId !== 'string') {
    const err = new Error('User ID wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  const db = getPrisma();
  if (!db) {
    const err = new Error('Layanan database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  const cleanUserId = String(userId).trim();

  // Query orders milik customer dengan select spesifik (tanpa adminNotes)
  const orders = await db.order.findMany({
    where: { userId: cleanUserId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      subtotal: true,
      shippingCost: true,
      total: true,
      courier: true,
      shippingService: true,
      trackingNumber: true,
      createdAt: true,
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
          product: {
            select: {
              id: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return orders.map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      courier: order.courier,
      shippingService: order.shippingService,
      trackingNumber: order.trackingNumber,
      totalItemsCount,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      items: items.map((item) => ({
        id: item.id,
        sku: item.sku,
        productName: item.productName,
        size: item.size,
        variant: item.variant,
        color: item.color,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : null,
        productSlug: item.product?.slug || null,
      })),
    };
  });
}

/**
 * Mengambil detail satu pesanan milik pelanggan tertentu.
 * Memverifikasi kepemilikan userId langsung pada query database.
 * Mengecualikan adminNotes agar tidak bocor ke pelanggan.
 *
 * @param {string} userId - ID pelanggan terverifikasi
 * @param {string} orderIdOrNumber - ID pesanan (cuid) atau nomor pesanan (NURA-...)
 * @returns {Promise<Object>} Detail pesanan terformat
 */
export async function getCustomerOrderDetail(userId, orderIdOrNumber) {
  if (!userId || typeof userId !== 'string') {
    const err = new Error('User ID wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  if (!orderIdOrNumber || typeof orderIdOrNumber !== 'string') {
    const err = new Error('ID atau nomor pesanan wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  const db = getPrisma();
  if (!db) {
    const err = new Error('Layanan database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  const cleanUserId = String(userId).trim();
  const cleanId = String(orderIdOrNumber).trim();

  // Query database dengan verifikasi kepemilikan userId langsung di klausa WHERE
  const order = await db.order.findFirst({
    where: {
      userId: cleanUserId,
      OR: [
        { id: cleanId },
        { orderNumber: cleanId },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      customerName: true,
      customerWhatsapp: true,
      customerEmail: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPostalCode: true,
      courier: true,
      shippingService: true,
      trackingNumber: true,
      note: true,
      subtotal: true,
      shippingCost: true,
      total: true,
      orderStatus: true,
      paymentStatus: true,
      receivedAt: true,
      completionSource: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          sku: true,
          productName: true,
          size: true,
          variant: true,
          color: true,
          unitPrice: true,
          quantity: true,
          subtotal: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    const err = new Error('Pesanan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        size: item.size,
        variant: item.variant,
        color: item.color,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : null,
        productSlug: item.product?.slug || null,
      }))
    : [];

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerWhatsapp: order.customerWhatsapp,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingPostalCode: order.shippingPostalCode,
    courier: order.courier,
    shippingService: order.shippingService,
    trackingNumber: order.trackingNumber,
    note: order.note,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    receivedAt: order.receivedAt ? new Date(order.receivedAt).toISOString() : null,
    completionSource: order.completionSource ?? null,
    items,
    totalItemsCount,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
  };
}

// ──────────────────────────────────────────────────────────────
// CUSTOMER ORDER RECEIPT CONFIRMATION (Tahap Customer Account 3C)
// ──────────────────────────────────────────────────────────────

/**
 * Konfirmasi penerimaan pesanan oleh pelanggan.
 * Mengubah orderStatus dari SHIPPED menjadi COMPLETED secara atomik.
 * Mencatat receivedAt dan completionSource = CUSTOMER_CONFIRMED.
 *
 * @param {string} userId - ID pelanggan terverifikasi
 * @param {string} orderIdOrNumber - ID pesanan (cuid) atau nomor pesanan (NURA-...)
 * @returns {Promise<Object>} Data pesanan yang diperbarui
 */
export async function confirmCustomerOrderReceipt(userId, orderIdOrNumber) {
  if (!userId || typeof userId !== 'string') {
    const err = new Error('User ID wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  if (!orderIdOrNumber || typeof orderIdOrNumber !== 'string') {
    const err = new Error('ID atau nomor pesanan wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  const db = getPrisma();
  if (!db) {
    const err = new Error('Layanan database tidak tersedia saat ini.');
    err.statusCode = 503;
    throw err;
  }

  const cleanUserId = String(userId).trim();
  const cleanId = String(orderIdOrNumber).trim();

  // 1. Cari pesanan milik customer yang bersangkutan (ownership check via query)
  const order = await db.order.findFirst({
    where: {
      userId: cleanUserId,
      OR: [
        { id: cleanId },
        { orderNumber: cleanId },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      receivedAt: true,
      completionSource: true,
    },
  });

  if (!order) {
    const err = new Error('Pesanan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Validasi status saat ini — konfirmasi hanya diizinkan jika statusnya SHIPPED
  if (order.orderStatus === 'COMPLETED') {
    const err = new Error('Pesanan sudah berstatus COMPLETED (telah dikonfirmasi selesai sebelumnya).');
    err.statusCode = 409;
    throw err;
  }

  if (order.orderStatus === 'CANCELLED') {
    const err = new Error('Pesanan telah dibatalkan dan tidak dapat dikonfirmasi penerimaannya.');
    err.statusCode = 409;
    throw err;
  }

  if (order.orderStatus !== 'SHIPPED') {
    const err = new Error(
      `Konfirmasi penerimaan hanya dapat dilakukan setelah pesanan dikirim (SHIPPED). Status pesanan saat ini: ${order.orderStatus}.`
    );
    err.statusCode = 409;
    throw err;
  }

  // 3. Conditional Atomic Update — hanya berhasil jika status di database masih SHIPPED
  const confirmationTime = new Date();
  const updateResult = await db.order.updateMany({
    where: {
      id: order.id,
      userId: cleanUserId,
      orderStatus: 'SHIPPED',
    },
    data: {
      orderStatus: 'COMPLETED',
      receivedAt: confirmationTime,
      completionSource: 'CUSTOMER_CONFIRMED',
    },
  });

  // 4. Strict Concurrency Guard: jika count === 0, status telah berubah secara bersamaan
  if (updateResult.count === 0) {
    const fresh = await db.order.findUnique({
      where: { id: order.id },
      select: { orderStatus: true, completionSource: true, receivedAt: true },
    });

    if (fresh?.orderStatus === 'COMPLETED') {
      const err = new Error('Pesanan sudah dikonfirmasi selesai sebelumnya.');
      err.statusCode = 409;
      throw err;
    }

    const err = new Error('Gagal mengonfirmasi penerimaan: Status pesanan telah berubah.');
    err.statusCode = 409;
    throw err;
  }

  // 5. Ambil data pesanan lengkap terbaru yang telah diperbarui
  const updatedOrder = await db.order.findUnique({
    where: { id: order.id },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      customerName: true,
      customerWhatsapp: true,
      customerEmail: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPostalCode: true,
      courier: true,
      shippingService: true,
      trackingNumber: true,
      note: true,
      subtotal: true,
      shippingCost: true,
      total: true,
      orderStatus: true,
      paymentStatus: true,
      receivedAt: true,
      completionSource: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          sku: true,
          productName: true,
          size: true,
          variant: true,
          color: true,
          unitPrice: true,
          quantity: true,
          subtotal: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  const items = Array.isArray(updatedOrder.items)
    ? updatedOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        size: item.size,
        variant: item.variant,
        color: item.color,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : null,
        productSlug: item.product?.slug || null,
      }))
    : [];

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return {
    id: updatedOrder.id,
    orderNumber: updatedOrder.orderNumber,
    customerName: updatedOrder.customerName,
    customerWhatsapp: updatedOrder.customerWhatsapp,
    customerEmail: updatedOrder.customerEmail,
    shippingAddress: updatedOrder.shippingAddress,
    shippingCity: updatedOrder.shippingCity,
    shippingPostalCode: updatedOrder.shippingPostalCode,
    courier: updatedOrder.courier,
    shippingService: updatedOrder.shippingService,
    trackingNumber: updatedOrder.trackingNumber,
    note: updatedOrder.note,
    subtotal: updatedOrder.subtotal,
    shippingCost: updatedOrder.shippingCost,
    total: updatedOrder.total,
    orderStatus: updatedOrder.orderStatus,
    paymentStatus: updatedOrder.paymentStatus,
    receivedAt: updatedOrder.receivedAt ? new Date(updatedOrder.receivedAt).toISOString() : null,
    completionSource: updatedOrder.completionSource,
    items,
    totalItemsCount,
    createdAt: updatedOrder.createdAt ? new Date(updatedOrder.createdAt).toISOString() : null,
    updatedAt: updatedOrder.updatedAt ? new Date(updatedOrder.updatedAt).toISOString() : null,
  };
}


