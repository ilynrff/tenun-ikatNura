/**
 * Helper utilitas penanganan dan pengurutan ukuran produk Tenun Ikat Nura
 */

export const STANDARD_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  'All Size',
  'Custom Size',
];

const CANONICAL_LETTER_ORDER = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '2XL',
  'XXXL',
  '3XL',
  '4XL',
  'ALL SIZE',
  'FREE SIZE',
];

const STANDARD_LETTER_CODES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '2XL',
  'XXXL',
  '3XL',
  '4XL',
  '5XL',
];

/**
 * Cek apakah ukuran merupakan Custom Size
 * @param {string} size
 * @returns {boolean}
 */
export function isCustomSize(size) {
  if (!size || typeof size !== 'string') return false;
  const s = size.trim().toLowerCase();
  return s === 'custom size' || s === 'custom' || s === 'ukuran khusus';
}

/**
 * Normalisasi label ukuran standar agar seragam (misal: 'xxl' -> 'XXL', 'all size' -> 'All Size').
 * Ukuran non-standar (misal 'Batik Jumbo', 'Waist 80cm', '30') tetap mempertahankan penulisan aslinya.
 *
 * @param {string} size
 * @returns {string}
 */
export function normalizeSizeLabel(size) {
  if (!size || typeof size !== 'string') return '';
  const trimmed = size.trim();
  if (!trimmed) return '';

  if (isCustomSize(trimmed)) {
    return 'Custom Size';
  }

  const upper = trimmed.toUpperCase();
  if (upper === 'ALL SIZE') {
    return 'All Size';
  }
  if (upper === 'FREE SIZE') {
    return 'Free Size';
  }

  if (STANDARD_LETTER_CODES.includes(upper)) {
    return upper;
  }

  return trimmed;
}

/**
 * Mengurutkan array ukuran secara konsisten:
 * 1. Ukuran huruf standar (XS, S, M, L, XL, XXL, 3XL, All Size, Free Size)
 * 2. Ukuran numerik naik (misal: 27, 28, 29, 30...)
 * 3. Ukuran custom teks lainnya (alfabetis)
 * 4. Custom Size selalu di posisi paling akhir
 *
 * @param {string[]} sizes
 * @returns {string[]} Array ukuran yang terurut rapi dan bebas duplikat
 */
export function sortSizes(sizes) {
  if (!Array.isArray(sizes)) return [];

  // Deduplikasi dengan mempertahankan penulisan asli/ternormalisasi
  const unique = [];
  const seen = new Set();

  for (const item of sizes) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    const normalized = normalizeSizeLabel(trimmed);
    const key = normalized.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(normalized);
    }
  }

  return unique.sort((a, b) => {
    const aIsCustom = isCustomSize(a);
    const bIsCustom = isCustomSize(b);

    // Custom Size selalu paling belakang
    if (aIsCustom && !bIsCustom) return 1;
    if (!aIsCustom && bIsCustom) return -1;
    if (aIsCustom && bIsCustom) return 0;

    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();

    const aStdIdx = CANONICAL_LETTER_ORDER.indexOf(aUpper);
    const bStdIdx = CANONICAL_LETTER_ORDER.indexOf(bUpper);

    // Keduanya ada dalam skala huruf standar
    if (aStdIdx !== -1 && bStdIdx !== -1) {
      return aStdIdx - bStdIdx;
    }
    // a huruf standar, b bukan -> a lebih dulu
    if (aStdIdx !== -1 && bStdIdx === -1) {
      return -1;
    }
    // b huruf standar, a bukan -> b lebih dulu
    if (aStdIdx === -1 && bStdIdx !== -1) {
      return 1;
    }

    // Pengecekan ukuran numerik (misal bawahan: 27, 28, 29, 30)
    const aIsNum = /^\d+(\.\d+)?$/.test(a.trim());
    const bIsNum = /^\d+(\.\d+)?$/.test(b.trim());

    if (aIsNum && bIsNum) {
      return parseFloat(a) - parseFloat(b);
    }
    if (aIsNum && !bIsNum) {
      return -1;
    }
    if (!aIsNum && bIsNum) {
      return 1;
    }

    // Fallback: perbandingan alfabetis
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
}
