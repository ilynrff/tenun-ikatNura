// ============================================================
// CUSTOMER AUTH UTILITIES — TENUN IKAT NURA
// ============================================================
//
// Provides password hashing, secure token generation, and server session verification
// strictly for customer accounts. Keeps customer auth completely separated from admin auth.
// ============================================================

import crypto from 'crypto';
import { cookies } from 'next/headers';

const CUSTOMER_COOKIE_NAME = 'nura_customer_session';

function getCustomerSecret() {
  return (
    process.env.CUSTOMER_AUTH_SECRET ||
    process.env.ADMIN_SECRET ||
    'nura-customer-jwt-secret-heritage-2026'
  );
}

/**
 * Hash password securely using Node.js crypto.scryptSync with random salt
 * Format: salt:hash
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password wajib berupa teks.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify plaintext password against stored salt:hash string
 */
export function verifyPassword(password, storedPasswordHash) {
  if (!password || !storedPasswordHash || typeof storedPasswordHash !== 'string') {
    return false;
  }
  const parts = storedPasswordHash.split(':');
  if (parts.length !== 2) return false;

  const [salt, originalHash] = parts;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const origBuf = Buffer.from(originalHash, 'hex');
    if (hashBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, origBuf);
  } catch {
    return false;
  }
}

/**
 * Create a signed customer session token using HMAC-SHA256
 */
export function createCustomerToken(user) {
  const secret = getCustomerSecret();

  const payload = {
    id: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    phone: user.phone || null,
    role: 'USER',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify a signed customer session token
 */
export function verifyCustomerToken(token) {
  if (!token || typeof token !== 'string') return null;

  const secret = getCustomerSecret();
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return null;

    const isMatch = crypto.timingSafeEqual(sigBuf, expBuf);
    if (!isMatch) return null;

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to check if current request has a valid Customer session
 * Works with Next.js App Router cookies()
 * @returns {Promise<{ authorized: boolean, user: Object|null }>}
 */
export async function verifyServerCustomer() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CUSTOMER_COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) {
      return { authorized: false, user: null };
    }

    const payload = verifyCustomerToken(tokenCookie.value);
    if (!payload) {
      return { authorized: false, user: null };
    }

    return { authorized: true, user: payload };
  } catch {
    return { authorized: false, user: null };
  }
}

export { CUSTOMER_COOKIE_NAME };
