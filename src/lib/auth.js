import crypto from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'nura_admin_session';

/**
 * Get configured environment credentials
 */
function getAuthConfig() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;

  if (!email || !password || !secret) {
    console.error(
      '[SECURITY ERROR] Admin credentials or secret key not configured in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET).'
    );
  }

  return { email, password, secret };
}

/**
 * Validate admin credentials strictly using environment configuration
 * @param {string} inputEmail 
 * @param {string} inputPassword 
 * @returns {Object|null}
 */
export function validateAdminCredentials(inputEmail, inputPassword) {
  if (!inputEmail || !inputPassword) return null;

  const { email: configuredEmail, password: configuredPassword } = getAuthConfig();
  if (!configuredEmail || !configuredPassword) {
    return null; // Fail closed if environment is not configured
  }

  const cleanInputEmail = inputEmail.toLowerCase().trim();
  const cleanConfigEmail = configuredEmail.toLowerCase().trim();

  // Secure comparison
  if (cleanInputEmail === cleanConfigEmail && inputPassword === configuredPassword) {
    return {
      id: 'admin-01',
      name: 'Administrator Nura',
      email: configuredEmail,
      role: 'ADMIN',
    };
  }

  return null;
}

/**
 * Create a signed admin session token using HMAC-SHA256
 * @param {Object} user 
 * @returns {string}
 */
export function createAdminToken(user) {
  const { secret } = getAuthConfig();
  if (!secret) {
    throw new Error('ADMIN_SECRET environment variable is not configured.');
  }

  const payload = {
    id: user.id || 'admin-01',
    email: user.email,
    role: 'ADMIN',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify a signed admin session token
 * @param {string} token 
 * @returns {Object|null}
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const { secret } = getAuthConfig();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isMatch) return null;

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }
    if (payload.role !== 'ADMIN') {
      return null; // Not an admin
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Server-side helper to check if current request has a valid Admin session
 * Works with Next.js App Router cookies()
 * @returns {Promise<{ authorized: boolean, user: Object|null }>}
 */
export async function verifyServerAdmin() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) {
      return { authorized: false, user: null };
    }

    const payload = verifyAdminToken(tokenCookie.value);
    if (!payload) {
      return { authorized: false, user: null };
    }

    return { authorized: true, user: payload };
  } catch (error) {
    return { authorized: false, user: null };
  }
}

export { ADMIN_COOKIE_NAME };
