/**
 * Redirect Sanitizer Utility — TENUN IKAT NURA
 * Prevents open redirect vulnerabilities, validates internal paths defensively,
 * separates pathname from query/hash, and prevents unauthorized routing to admin area.
 */

/**
 * Checks if a candidate URL is a safe, relative internal path.
 * Disallows external domains, protocol-relative URLs (//), backslash tricks (/\),
 * and dangerous schemes in pathname. Preserves valid query strings with colons.
 * 
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidInternalUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Reject newlines or carriage returns (header/redirect injection)
  if (/[\r\n]/.test(trimmed)) return false;

  // Must begin with a single '/'
  if (!trimmed.startsWith('/')) return false;

  // Reject protocol-relative URLs (e.g. //evil.com or ///evil.com)
  if (trimmed.startsWith('//')) return false;

  // Reject backslash tricks (e.g. /\evil.com, /\\evil.com)
  if (trimmed.includes('\\')) return false;

  // Defensive URL parsing
  try {
    const dummyOrigin = 'http://localhost';
    const parsed = new URL(trimmed, dummyOrigin);

    // Ensure origin was not manipulated
    if (parsed.origin !== dummyOrigin) return false;

    // Pathname must begin with single '/'
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) {
      return false;
    }

    // Reject dangerous schemes in pathname (e.g. /javascript:..., /data:...)
    // Note: search/query string colons (e.g. /checkout?ref=order:123) are permitted
    if (/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(parsed.pathname)) {
      return false;
    }

    return true;
  } catch {
    // Malformed input handled without throwing
    return false;
  }
}

/**
 * Sanitizes a redirect path based on target user role.
 * 
 * @param {string|null|undefined} targetUrl - The requested redirect/callback URL
 * @param {Object} options
 * @param {string} [options.fallback='/'] - Default fallback if invalid
 * @param {'USER'|'ADMIN'} [options.role='USER'] - User role context
 * @returns {string} Sanitized safe internal path
 */
export function sanitizeRedirect(targetUrl, { fallback = '/', role = 'USER' } = {}) {
  const safeFallback = isValidInternalUrl(fallback) ? fallback.trim() : '/';

  if (!isValidInternalUrl(targetUrl)) {
    return safeFallback;
  }

  const cleanUrl = targetUrl.trim();

  try {
    const parsed = new URL(cleanUrl, 'http://localhost');
    const normalizedPath = parsed.pathname.toLowerCase();

    // If role is USER (Customer), strictly prohibit any /admin routes
    if (role !== 'ADMIN') {
      if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
        return safeFallback === '/admin' || safeFallback.toLowerCase().startsWith('/admin') ? '/' : safeFallback;
      }
    } else {
      // If role is ADMIN, prevent loop to /login or /admin/login
      if (
        normalizedPath === '/login' ||
        normalizedPath.startsWith('/login/') ||
        normalizedPath === '/admin/login' ||
        normalizedPath.startsWith('/admin/login/')
      ) {
        return safeFallback === '/' ? '/admin' : safeFallback;
      }

      // If target is root '/', default admin destination is fallback or '/admin'
      if (normalizedPath === '/') {
        return safeFallback === '/' ? '/admin' : safeFallback;
      }
    }

    return cleanUrl;
  } catch {
    return safeFallback;
  }
}
