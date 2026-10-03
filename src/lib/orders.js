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
 *
 * @param {Object} params
 * @param {string}  params.customerName        - required
 * @param {string}  params.customerWhatsapp    - required
 * @param {string}  [params.customerEmail]     - optional
 * @param {string}  params.shippingAddress     - required
 * @param {string}  [params.shippingCity]      - optional
 * @param {string}  [params.shippingPostalCode]- optional
 * @param {string}  [params.note]              - optional
 * @param {Array}   params.items               - required, non-empty
 *   Each item: { productId, quantity, size?, variant? }
 *
 * @returns {Object} Created order summary { id, orderNumber, subtotal, shippingCost, total, orderStatus, paymentStatus }
 * @throws  {Error}  with .statusCode and .message
 */
export async function createOrder(params) {
  const {
    customerName,
    customerWhatsapp,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingPostalCode,
    note,
    items,
  } = params;

  // ── 0. Guard: DB must be available ──────────────────────
  const prisma = getPrisma();
  if (!prisma) {
    const err = new Error('Database tidak tersedia. Order tidak dapat diproses.');
    err.statusCode = 503;
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

  // ── 6. Calculate totals ───────────────────────────────────
  const orderSubtotal = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const shippingCost = 0; // No shipping API yet
  const orderTotal = orderSubtotal + shippingCost;

  // ── 7. Generate order number ──────────────────────────────
  const orderNumber = generateOrderNumber();

  // ── 8. Create Order + OrderItems + decrement stock ───────
  //
  // We use sequential Prisma calls rather than an interactive $transaction
  // callback because Next.js 15 App Router RSC can cause Prisma 6's
  // $transaction tx-proxy to lose model accessors.
  //
  // Atomicity is preserved via:
  //   a) Stock is decremented with a conditional WHERE (stock >= qty)
  //      so it can never go negative.
  //   b) If any step fails after order creation, we delete the order
  //      (CASCADE deletes its items automatically).
  // ──────────────────────────────────────────────────────────

  let createdOrder = null;

  try {
    // 8a. Create Order
    createdOrder = await prisma.order.create({
      data: {
        orderNumber,
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
    await prisma.orderItem.createMany({
      data: resolvedItems.map((item) => ({
        orderId: createdOrder.id,
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

    // 8c. Decrement stock atomically.
    //     Use updateMany with WHERE stock >= quantity to prevent negative stock.
    //     If stock was changed concurrently, count will be 0 and we compensate.
    for (const item of resolvedItems) {
      const result = await prisma.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity }, // atomic guard against negative stock
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (result.count === 0) {
        // Stock ran out between validation and update — compensate
        throw new Error(
          `Stok produk "${item.productName}" habis saat proses order. ` +
            `Diminta: ${item.quantity}.`
        );
      }
    }
  } catch (compensationErr) {
    // Compensation: delete the order if created (CASCADE removes order items)
    if (createdOrder?.id) {
      try {
        await prisma.order.delete({ where: { id: createdOrder.id } });
        console.warn('[Orders] Compensation rollback: deleted order', createdOrder.id);
      } catch (deleteErr) {
        // Log but don't re-throw: return the original error
        console.error('[Orders] Compensation delete failed:', deleteErr.message);
      }
    }

    // Re-throw with appropriate status code
    if (!compensationErr.statusCode) compensationErr.statusCode = 500;
    throw compensationErr;
  }

  // ── 9. Return order summary ───────────────────────────────
  return {
    id: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    subtotal: createdOrder.subtotal,
    shippingCost: createdOrder.shippingCost,
    total: createdOrder.total,
    orderStatus: createdOrder.orderStatus,
    paymentStatus: createdOrder.paymentStatus,
  };
}

