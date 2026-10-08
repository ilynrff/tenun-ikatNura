import prisma from './prisma';

/**
 * RajaOngkir Server-Side Client & Shipping Service Foundation
 * Phase 3B-5A — Tenun Ikat Nura
 * Migrated to RajaOngkir / Komerce API v1
 * 
 * IMPORTANT: This module is strictly server-side.
 * Never expose RAJAONGKIR_API_KEY to client components or responses.
 */

const DEFAULT_BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

/**
 * Check if RajaOngkir is configured with a valid API key
 * @returns {boolean}
 */
export function isRajaOngkirConfigured() {
  const key = process.env.RAJAONGKIR_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'your_rajaongkir_api_key_here');
}

/**
 * Get RajaOngkir API headers
 * @returns {Object}
 */
function getHeaders() {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_rajaongkir_api_key_here') {
    const error = new Error('Shipping service is not configured.');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }
  return {
    'key': apiKey.trim(),
  };
}

/**
 * Search destination locations (city, district, subdistrict, postal code)
 * Uses Komerce API v1 Direct Search: GET /destination/domestic-destination
 * 
 * @param {string} query - Keyword to search (e.g., "Semarang", "Jepara", "Kebayoran")
 * @returns {Promise<Array<{ id: string, label: string, province: string, city: string, district: string, subdistrict: string, postalCode: string }>>}
 */
export async function searchDestinations(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    const error = new Error('Parameter pencarian tujuan minimal 2 karakter.');
    error.statusCode = 400;
    throw error;
  }

  if (!isRajaOngkirConfigured()) {
    const error = new Error('Shipping service is not configured.');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  const cleanQuery = query.trim();
  const baseUrl = (process.env.RAJAONGKIR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

  try {
    const url = `${baseUrl}/destination/domestic-destination?search=${encodeURIComponent(cleanQuery)}&limit=25`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      // Cache response for 1 hour to reduce API quota consumption
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`[RajaOngkir Komerce API Error] HTTP ${response.status} fetching /destination/domestic-destination`);
      if (response.status === 401 || response.status === 403) {
        const error = new Error('Autentikasi layanan ekspedisi gagal. Periksa konfigurasi API key.');
        error.statusCode = 401;
        throw error;
      }
      const error = new Error('Gagal menghubungi layanan ekspedisi RajaOngkir.');
      error.statusCode = response.status >= 500 ? 502 : 400;
      throw error;
    }

    const json = await response.json();
    const meta = json?.meta;

    if (meta && meta.code && Number(meta.code) !== 200 && meta.status === 'failed') {
      console.error('[RajaOngkir Response Error]', meta);
      const error = new Error(meta.message || 'Gagal mencari lokasi tujuan.');
      error.statusCode = 400;
      throw error;
    }

    // Extract items from data property (supports array or nested data)
    let rawItems = [];
    if (Array.isArray(json?.data)) {
      rawItems = json.data;
    } else if (Array.isArray(json?.data?.data)) {
      rawItems = json.data.data;
    } else if (Array.isArray(json?.results)) {
      rawItems = json.results;
    }

    // Format into standardized, clean structure
    return rawItems.map((item) => {
      const id = String(item.id || item.subdistrict_id || item.district_id || item.city_id || '');
      const province = item.province_name || item.province || '';
      const city = item.city_name || item.city || '';
      const district = item.district_name || item.district || '';
      const subdistrict = item.subdistrict_name || item.subdistrict || '';
      const postalCode = item.zip_code || item.postal_code || '';

      // Construct a clear, elegant label if not provided by API
      let label = item.label;
      if (!label) {
        const parts = [subdistrict, district, city, province, postalCode].filter(Boolean);
        label = parts.join(', ');
      }

      return {
        id,
        label,
        province,
        city,
        district,
        subdistrict,
        type: item.type || '',
        postalCode,
      };
    });
  } catch (err) {
    if (err.statusCode) throw err;
    console.error('[RajaOngkir searchDestinations Exception]', err.message);
    const error = new Error('Terjadi kesalahan saat mencari tujuan pengiriman.');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Calculate domestic shipping cost from origin (Jepara) to destination
 * Uses Komerce API v1: POST /calculate/domestic-cost
 * 
 * @param {Object} params
 * @param {string|number} params.destinationId - Destination location ID from Komerce destination search
 * @param {number} params.weight - Total weight in grams (minimum 1g)
 * @param {string} [params.courier='jne'] - Courier code ('jne', 'pos', 'tiki', 'sicepat', 'jnt', 'anteraja')
 * @returns {Promise<Array<{ courier: string, courierName: string, service: string, description: string, cost: number, etd: string }>>}
 */
export async function calculateShippingCost({ destinationId, weight, courier = 'jne' }) {
  if (!destinationId) {
    const error = new Error('ID tujuan pengiriman (destinationId) wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  const numWeight = parseInt(weight, 10);
  if (isNaN(numWeight) || numWeight <= 0) {
    const error = new Error('Berat pengiriman harus berupa angka positif minimal 1 gram.');
    error.statusCode = 400;
    throw error;
  }

  const supportedCouriers = ['jne', 'pos', 'tiki', 'sicepat', 'jnt', 'anteraja', 'ninja', 'idexpress', 'lion', 'wahana'];
  const cleanCourier = (courier || 'jne').toLowerCase().trim();
  if (!supportedCouriers.includes(cleanCourier)) {
    const error = new Error(`Kurir "${courier}" tidak didukung. Pilihan: ${supportedCouriers.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!isRajaOngkirConfigured()) {
    const error = new Error('Shipping service is not configured.');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  const originId = process.env.RAJAONGKIR_ORIGIN_ID;
  if (!originId || originId.trim() === '' || originId === '160') {
    const error = new Error('Origin ID pengiriman belum dikonfigurasi (RAJAONGKIR_ORIGIN_ID).');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  const baseUrl = (process.env.RAJAONGKIR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

  try {
    const body = new URLSearchParams({
      origin: String(originId).trim(),
      destination: String(destinationId).trim(),
      weight: String(numWeight),
      courier: cleanCourier,
    });

    const response = await fetch(`${baseUrl}/calculate/domestic-cost`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[RajaOngkir Komerce Cost Error] HTTP ${response.status} on /calculate/domestic-cost`);
      if (response.status === 401 || response.status === 403) {
        const error = new Error('Autentikasi layanan ekspedisi gagal. Periksa konfigurasi API key.');
        error.statusCode = 401;
        throw error;
      }
      const error = new Error('Gagal menghubungi layanan ongkos kirim.');
      error.statusCode = response.status >= 500 ? 502 : 400;
      throw error;
    }

    const json = await response.json();
    const meta = json?.meta;

    if (meta && meta.code && Number(meta.code) !== 200 && meta.status === 'failed') {
      console.error('[RajaOngkir Cost Response Meta Error]', meta);
      const error = new Error(meta.message || 'Gagal menghitung ongkos kirim.');
      error.statusCode = 400;
      throw error;
    }

    const formattedServices = [];

    // Komerce returns items in json.data (array of services, or array of couriers with costs)
    let rawList = [];
    if (Array.isArray(json?.data)) {
      rawList = json.data;
    } else if (Array.isArray(json?.rajaongkir?.results)) {
      rawList = json.rajaongkir.results;
    } else if (json?.data && typeof json.data === 'object') {
      // In case data has courier categories or nested groups
      Object.values(json.data).forEach((group) => {
        if (Array.isArray(group)) rawList.push(...group);
      });
    }

    for (const item of rawList) {
      // Structure A: Item is a courier grouping with costs array (like results[i].costs)
      if (Array.isArray(item.costs)) {
        const courierCode = (item.code || cleanCourier).toUpperCase();
        const courierName = item.name || courierCode;
        for (const costItem of item.costs) {
          const costVal = Array.isArray(costItem.cost)
            ? (costItem.cost[0]?.value || 0)
            : (typeof costItem.cost === 'number' ? costItem.cost : parseInt(costItem.cost || costItem.price || 0, 10));
          const etdVal = Array.isArray(costItem.cost)
            ? (costItem.cost[0]?.etd || '')
            : (costItem.etd || costItem.estimated || '');

          formattedServices.push({
            courier: courierCode,
            courierName: courierName,
            service: costItem.service || costItem.service_code || 'Standard',
            description: costItem.description || costItem.service || 'Reguler',
            cost: Number(costVal) || 0,
            etd: formatEtd(etdVal),
          });
        }
      }
      // Structure B: Item is a direct service rate (Komerce flat data array)
      else if (item.service || item.cost !== undefined || item.price !== undefined) {
        const courierCode = (item.code || item.courier || cleanCourier).toUpperCase();
        const courierName = item.name || item.courier_name || courierCode;
        const costVal = typeof item.cost === 'number' ? item.cost : (item.price || 0);

        formattedServices.push({
          courier: courierCode,
          courierName: courierName,
          service: item.service || item.service_name || 'Standard',
          description: item.description || item.service || 'Reguler',
          cost: Number(costVal) || 0,
          etd: formatEtd(item.etd),
        });
      }
    }

    return formattedServices;
  } catch (err) {
    if (err.statusCode) throw err;
    console.error('[RajaOngkir calculateShippingCost Exception]', err.message);
    const error = new Error('Terjadi kesalahan saat menghitung ongkos kirim.');
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Format ETD string nicely (e.g., '1-2' -> '1-2 hari')
 */
function formatEtd(etd) {
  if (!etd || String(etd).trim() === '') return '1-3 hari';
  const str = String(etd).trim();
  if (str.toLowerCase().includes('hari')) return str;
  return `${str} hari`;
}

/**
 * Helper to calculate total weight (in grams) for a list of items based on database product weights.
 * Trusted server-side calculation: does NOT trust client-submitted weights.
 * 
 * @param {Array<{ productId?: string, id?: string, quantity: number }>} items
 * @returns {Promise<number>} Total weight in grams (minimum 1g)
 */
export async function calculateItemsTotalWeight(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  const productIds = items
    .map((item) => item.productId || item.id)
    .filter(Boolean);

  if (productIds.length === 0) {
    return 1000;
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        weight: true,
      },
    });

    const weightMap = new Map();
    products.forEach((p) => {
      weightMap.set(p.id, typeof p.weight === 'number' && p.weight > 0 ? p.weight : 1000);
    });

    let totalWeight = 0;
    for (const item of items) {
      const pId = item.productId || item.id;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitWeight = weightMap.get(pId) || 1000; // fallback 1000g per product
      totalWeight += unitWeight * qty;
    }

    return Math.max(1, totalWeight);
  } catch (err) {
    console.error('[calculateItemsTotalWeight Error]', err.message);
    // Fallback: estimate 1000g per item
    const totalQty = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
    return Math.max(1000, totalQty * 1000);
  }
}
