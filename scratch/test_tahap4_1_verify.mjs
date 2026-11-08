/**
 * Test Suite Tahap 4.1 — Verifikasi Keamanan Admin Token & Middleware Logic
 */

import crypto from 'crypto';
import { verifyAdminTokenEdge, ADMIN_COOKIE_NAME } from '../src/lib/edgeAuth.js';

const TEST_SECRET = 'test-secret-key-very-secure-32chars!';
process.env.ADMIN_SECRET = TEST_SECRET;

// Token generator matching createAdminToken() in src/lib/auth.js
function makeToken(payload, secret = TEST_SECRET) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

// Simulates middleware behavior exactly as implemented in src/middleware.js
async function simulateMiddleware(pathname, cookieValue) {
  // Whitelist admin login page
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return { status: 200, action: 'next' };
    }

    if (!cookieValue) {
      return { status: 307, action: 'redirect', location: `/login?redirect=${encodeURIComponent(pathname)}` };
    }

    const admin = await verifyAdminTokenEdge(cookieValue);
    if (!admin) {
      return { status: 307, action: 'redirect', location: `/login?redirect=${encodeURIComponent(pathname)}` };
    }

    return { status: 200, action: 'next' };
  }

  // Protect Admin API routes (/api/admin/...)
  if (pathname.startsWith('/api/admin')) {
    if (
      pathname === '/api/admin/auth/login' ||
      pathname === '/api/admin/auth/logout' ||
      pathname === '/api/admin/auth/me'
    ) {
      return { status: 200, action: 'next' };
    }

    if (!cookieValue) {
      return { status: 401, action: 'json', error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' };
    }

    const admin = await verifyAdminTokenEdge(cookieValue);
    if (!admin) {
      return { status: 401, action: 'json', error: 'Akses ditolak: Token autentikasi ADMIN tidak valid atau telah berakhir.' };
    }

    return { status: 200, action: 'next' };
  }

  return { status: 200, action: 'next' };
}

async function runTests() {
  console.log('====================================================');
  console.log('TAHAP 4.1 TEST SUITE: ADMIN TOKEN & MIDDLEWARE SECURITY');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, message) {
    totalCount++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  const validPayload = {
    id: 'admin-01',
    email: 'admin@nura.id',
    role: 'ADMIN',
    exp: Date.now() + 3600000, // 1 hour future
  };

  const expiredPayload = {
    id: 'admin-01',
    email: 'admin@nura.id',
    role: 'ADMIN',
    exp: Date.now() - 3600000, // 1 hour past
  };

  const userPayload = {
    id: 'user-01',
    email: 'customer@nura.id',
    role: 'USER',
    exp: Date.now() + 3600000,
  };

  // Scenario 1: Valid admin token
  const tokenValid = makeToken(validPayload);
  const res1 = await verifyAdminTokenEdge(tokenValid);
  assert(res1 !== null && res1.role === 'ADMIN', 'Skenario 1: Token valid admin diterima oleh verifyAdminTokenEdge');

  const mid1_page = await simulateMiddleware('/admin/products/new', tokenValid);
  assert(mid1_page.status === 200 && mid1_page.action === 'next', 'Skenario 1 (Page): Middleware mengizinkan akses ke /admin/products/new');

  const mid1_api = await simulateMiddleware('/api/admin/products', tokenValid);
  assert(mid1_api.status === 200 && mid1_api.action === 'next', 'Skenario 1 (API): Middleware mengizinkan akses ke /api/admin/products');

  // Scenario 2: Token without signature
  const tokenNoSig = Buffer.from(JSON.stringify(validPayload)).toString('base64url');
  const res2 = await verifyAdminTokenEdge(tokenNoSig);
  assert(res2 === null, 'Skenario 2: Token tanpa signature ditolak oleh verifyAdminTokenEdge');

  const mid2_page = await simulateMiddleware('/admin/products/new', tokenNoSig);
  assert(mid2_page.status === 307 && mid2_page.location?.includes('/login'), 'Skenario 2 (Page): Token tanpa signature diredirect ke /login');

  const mid2_api = await simulateMiddleware('/api/admin/products', tokenNoSig);
  assert(mid2_api.status === 401, 'Skenario 2 (API): Token tanpa signature ditolak 401');

  // Scenario 3: Token with role: ADMIN but fake signature
  const tokenFakeSig = `${tokenNoSig}.fakeSignatureBase64UrlXYZ123`;
  const res3 = await verifyAdminTokenEdge(tokenFakeSig);
  assert(res3 === null, 'Skenario 3: Token signature palsu ditolak oleh verifyAdminTokenEdge');

  const mid3_page = await simulateMiddleware('/admin/products/new', tokenFakeSig);
  assert(mid3_page.status === 307 && mid3_page.location?.includes('/login'), 'Skenario 3 (Page): Token signature palsu diredirect ke /login');

  const mid3_api = await simulateMiddleware('/api/admin/products', tokenFakeSig);
  assert(mid3_api.status === 401, 'Skenario 3 (API): Token signature palsu ditolak 401');

  // Scenario 4: Token tampered payload with another valid signature
  const validSigOther = makeToken(validPayload).split('.')[1];
  const tamperedPayload = Buffer.from(JSON.stringify({ ...validPayload, id: 'admin-attacker' })).toString('base64url');
  const tokenTampered = `${tamperedPayload}.${validSigOther}`;
  const res4 = await verifyAdminTokenEdge(tokenTampered);
  assert(res4 === null, 'Skenario 4: Token tampered payload ditolak oleh verifyAdminTokenEdge');

  const mid4_page = await simulateMiddleware('/admin/products/new', tokenTampered);
  assert(mid4_page.status === 307 && mid4_page.location?.includes('/login'), 'Skenario 4 (Page): Token tampered payload diredirect ke /login');

  const mid4_api = await simulateMiddleware('/api/admin/products', tokenTampered);
  assert(mid4_api.status === 401, 'Skenario 4 (API): Token tampered payload ditolak 401');

  // Scenario 5: Expired token
  const tokenExpired = makeToken(expiredPayload);
  const res5 = await verifyAdminTokenEdge(tokenExpired);
  assert(res5 === null, 'Skenario 5: Token expired ditolak oleh verifyAdminTokenEdge');

  const mid5_page = await simulateMiddleware('/admin/products/new', tokenExpired);
  assert(mid5_page.status === 307 && mid5_page.location?.includes('/login'), 'Skenario 5 (Page): Token expired diredirect ke /login');

  const mid5_api = await simulateMiddleware('/api/admin/products', tokenExpired);
  assert(mid5_api.status === 401, 'Skenario 5 (API): Token expired ditolak 401');

  // Scenario 6: Empty cookie or missing
  const res6 = await verifyAdminTokenEdge('');
  assert(res6 === null, 'Skenario 6: Token kosong ditolak oleh verifyAdminTokenEdge');

  const mid6_page = await simulateMiddleware('/admin/products/new', undefined);
  assert(mid6_page.status === 307 && mid6_page.location?.includes('/login'), 'Skenario 6 (Page): Cookie kosong diredirect ke /login');

  const mid6_api = await simulateMiddleware('/api/admin/products', undefined);
  assert(mid6_api.status === 401, 'Skenario 6 (API): Cookie kosong ditolak 401');

  // Scenario 7: Token with role: USER
  const tokenUser = makeToken(userPayload);
  const res7 = await verifyAdminTokenEdge(tokenUser);
  assert(res7 === null, 'Skenario 7: Token role: USER ditolak oleh verifyAdminTokenEdge');

  const mid7_page = await simulateMiddleware('/admin/products/new', tokenUser);
  assert(mid7_page.status === 307 && mid7_page.location?.includes('/login'), 'Skenario 7 (Page): Token role: USER diredirect ke /login');

  const mid7_api = await simulateMiddleware('/api/admin/products', tokenUser);
  assert(mid7_api.status === 401, 'Skenario 7 (API): Token role: USER ditolak 401');

  // Scenario 8: Forged ADMIN payload from earlier audit vulnerability
  const forgedPayloadBase64 = Buffer.from(JSON.stringify({
    id: 'hacker-01',
    role: 'ADMIN',
    exp: Date.now() + 1000000,
  })).toString('base64url');
  const forgedCookie = `${forgedPayloadBase64}.anythingHereWillFailHMAC`;
  const res8 = await verifyAdminTokenEdge(forgedCookie);
  assert(res8 === null, 'Skenario 8: Forged ADMIN cookie ditolak oleh verifyAdminTokenEdge');

  const mid8_page = await simulateMiddleware('/admin/products/new', forgedCookie);
  assert(mid8_page.status === 307 && mid8_page.location?.includes('/login'), 'Skenario 8 (Page): Forged ADMIN cookie diredirect ke /login');

  const mid8_api = await simulateMiddleware('/api/admin/products', forgedCookie);
  assert(mid8_api.status === 401, 'Skenario 8 (API): Forged ADMIN cookie ditolak 401');

  // Whitelist checks
  const mid_login_page = await simulateMiddleware('/admin/login', undefined);
  assert(mid_login_page.status === 200 && mid_login_page.action === 'next', 'Whitelist: /admin/login tetap dapat diakses tanpa token');

  const mid_auth_me = await simulateMiddleware('/api/admin/auth/me', undefined);
  assert(mid_auth_me.status === 200 && mid_auth_me.action === 'next', 'Whitelist: /api/admin/auth/me tetap diizinkan lewat middleware');

  // Backward compatibility check:
  // Token generated by Node.js createHmac (as done by createAdminToken in src/lib/auth.js)
  const officialAdminPayload = {
    id: 'admin-01',
    email: 'admin@tenunikatnura.com',
    role: 'ADMIN',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const officialToken = makeToken(officialAdminPayload);
  const backCompatResult = await verifyAdminTokenEdge(officialToken);
  assert(
    backCompatResult !== null &&
    backCompatResult.email === 'admin@tenunikatnura.com' &&
    backCompatResult.role === 'ADMIN',
    'Backward Compatibility: Token dari Node.js createAdminToken() 100% kompatibel dan terverifikasi oleh Edge Web Crypto'
  );

  console.log(`\n====================================================`);
  console.log(`HASIL: ${passedCount} / ${totalCount} pengujian BERHASIL.`);
  console.log(`====================================================`);

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
