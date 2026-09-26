/**
 * Utility functions for formatting currency, numbers, and strings
 * Tenun Ikat Nura
 */

/**
 * Format numeric amount into Indonesian Rupiah (e.g., 1450000 -> "Rp 1.450.000")
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatRupiah(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rp 0';
  }

  // If already a string formatted as Rp, clean it first to ensure standard format
  let num;
  if (typeof amount === 'number') {
    num = amount;
  } else if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^0-9]/g, '');
    num = parseInt(cleaned, 10);
    if (isNaN(num)) return amount; // return original if not parsable
  } else {
    return 'Rp 0';
  }

  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Parse a price string or number into a pure integer
 * @param {string|number} priceInput 
 * @returns {number}
 */
export function parsePriceToNumber(priceInput) {
  if (typeof priceInput === 'number') {
    return Math.max(0, Math.floor(priceInput));
  }
  if (typeof priceInput === 'string') {
    const cleaned = priceInput.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  return 0;
}

/**
 * Generate a URL-friendly slug from text
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}
