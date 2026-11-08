/**
 * Edge Runtime Compatible Authentication Utilities for Tenun Ikat Nura
 * Uses Web Crypto API (crypto.subtle) without Node.js dependencies.
 * Safe for use in Next.js Middleware and Edge environments.
 */

export const ADMIN_COOKIE_NAME = 'nura_admin_session';

/**
 * Decode Base64URL string to Uint8Array using standard Web APIs
 * @param {string} base64Url 
 * @returns {Uint8Array}
 */
function base64UrlToUint8Array(base64Url) {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  if (typeof atob === 'function') {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64Url, 'base64url'));
  }

  throw new Error('No base64 decoding mechanism available in this runtime');
}

/**
 * Decode Base64URL string to JSON object
 * @param {string} base64Url 
 * @returns {any}
 */
function decodeBase64UrlJson(base64Url) {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  if (typeof atob === 'function') {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decoded);
  }

  if (typeof Buffer !== 'undefined') {
    return JSON.parse(Buffer.from(base64Url, 'base64url').toString('utf-8'));
  }

  throw new Error('No base64 decoding mechanism available in this runtime');
}

/**
 * Verify a signed admin session token using Web Crypto API (HMAC-SHA256)
 * Compatible with Edge Runtime and Node.js Runtime.
 * 
 * @param {string} token - The raw session token (`<payloadBase64Url>.<signatureBase64Url>`)
 * @param {string} [secretKey] - Optional secret override (defaults to process.env.ADMIN_SECRET)
 * @returns {Promise<Object|null>} - Returns decoded payload if valid and role === 'ADMIN', otherwise null
 */
export async function verifyAdminTokenEdge(token, secretKey) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const secret = secretKey || process.env.ADMIN_SECRET;
  if (!secret) {
    console.error(
      '[SECURITY ERROR] ADMIN_SECRET environment variable is not configured.'
    );
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signatureBase64Url] = parts;
  if (!payloadBase64 || !signatureBase64Url) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const cryptoSubtle = globalThis.crypto?.subtle;
    if (!cryptoSubtle) {
      console.error('[SECURITY ERROR] Web Crypto API (crypto.subtle) is not available in runtime.');
      return null;
    }

    // 1. Import HMAC-SHA256 Secret Key
    const key = await cryptoSubtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 2. Decode signature and verify against payload
    const signatureBytes = base64UrlToUint8Array(signatureBase64Url);
    const dataBytes = encoder.encode(payloadBase64);

    const isValid = await cryptoSubtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBytes
    );

    if (!isValid) {
      return null;
    }

    // 3. Decode & validate payload claims
    const payload = decodeBase64UrlJson(payloadBase64);
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    // Expiration check
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    // Strict ADMIN role check
    if (payload.role !== 'ADMIN') {
      return null;
    }

    return payload;
  } catch (error) {
    // Fail closed on any parsing, cryptographic, or decoding exception
    return null;
  }
}

