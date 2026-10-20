const assert = require('assert');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 SUITE: PENYATUAN LOGIN CUSTOMER & ADMIN TEST v2');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(id, name, success, details = '') {
    if (success) {
      console.log(`✅ [${id}] PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ [${id}] FAIL: ${name} -> ${details}`);
      failed++;
    }
  }

  // Dynamic test customer
  const testCustomerEmail = `suite_test_${Date.now()}@example.com`;
  const testCustomerPass = 'TestingPass123!';
  let customerCookie = '';
  let adminCookie = '';

  // 1. Registrasi awal customer
  try {
    const regCust = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Customer Test',
        email: testCustomerEmail,
        password: testCustomerPass,
      }),
    });
    assert(regCust.status === 201, 'Gagal mendaftar customer');
  } catch (e) {
    console.error('Setup failed:', e.message);
  }

  // ── REQ 1: Login admin menghapus cookie customer lama ──
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nura_customer_session=old_customer_token_value',
      },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const setCookies = res.headers.get('set-cookie') || '';
    const hasAdminToken = setCookies.includes('nura_admin_session=') && !setCookies.includes('nura_admin_session=;');
    const clearedCustomer = setCookies.includes('nura_customer_session=;') || setCookies.includes('nura_customer_session=;');
    const ok = res.status === 200 && hasAdminToken && clearedCustomer;
    adminCookie = setCookies;
    report('REQ 1', 'Login admin menerbitkan nura_admin_session DAN menghapus cookie customer lama', ok, `Set-Cookie: ${setCookies}`);
  } catch (e) {
    report('REQ 1', 'Login admin menghapus cookie customer lama', false, e.message);
  }

  // ── REQ 2: Login customer menghapus cookie admin lama ──
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nura_admin_session=old_admin_token_value',
      },
      body: JSON.stringify({ email: testCustomerEmail, password: testCustomerPass }),
    });
    const setCookies = res.headers.get('set-cookie') || '';
    const hasCustomerToken = setCookies.includes('nura_customer_session=') && !setCookies.includes('nura_customer_session=;');
    const clearedAdmin = setCookies.includes('nura_admin_session=;') || setCookies.includes('nura_admin_session=;');
    const ok = res.status === 200 && hasCustomerToken && clearedAdmin;
    customerCookie = setCookies;
    report('REQ 2', 'Login customer menerbitkan nura_customer_session DAN menghapus cookie admin lama', ok, `Set-Cookie: ${setCookies}`);
  } catch (e) {
    report('REQ 2', 'Login customer menghapus cookie admin lama', false, e.message);
  }

  // ── REQ 3: Login gagal tidak menghapus sesi lain secara tidak sengaja ──
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nura_customer_session=keep_this_session',
      },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'WrongPassword999!' }),
    });
    const setCookies = res.headers.get('set-cookie') || '';
    const ok = res.status === 401 && !setCookies.includes('nura_customer_session=;') && !setCookies.includes('nura_admin_session=;');
    report('REQ 3', 'Login gagal tidak menghapus cookie sesi lain', ok, `Status: ${res.status}, Set-Cookie: ${setCookies}`);
  } catch (e) {
    report('REQ 3', 'Login gagal tidak menghapus sesi lain', false, e.message);
  }

  // ── REQ 4: Login melalui endpoint admin lama juga konsisten menghapus cookie customer ──
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nura_customer_session=existing_cust_cookie',
      },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const setCookies = res.headers.get('set-cookie') || '';
    const ok = res.status === 200 && setCookies.includes('nura_admin_session=') && setCookies.includes('nura_customer_session=;');
    report('REQ 4', 'Endpoint admin lama (/api/admin/auth/login) konsisten menghapus cookie customer', ok, `Set-Cookie: ${setCookies}`);
  } catch (e) {
    report('REQ 4', 'Endpoint admin lama konsisten', false, e.message);
  }

  // ── REQ 5: Logout masing-masing role tetap hanya menghapus cookie role tersebut ──
  try {
    const adminLogoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: adminCookie.split(';')[0] },
    });
    const adminLogoutCookies = adminLogoutRes.headers.get('set-cookie') || '';
    const adminOk = adminLogoutCookies.includes('nura_admin_session=;') && !adminLogoutCookies.includes('nura_customer_session=');

    const custLogoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });
    const custLogoutCookies = custLogoutRes.headers.get('set-cookie') || '';
    const custOk = custLogoutCookies.includes('nura_customer_session=;') && !custLogoutCookies.includes('nura_admin_session=');

    report('REQ 5', 'Logout masing-masing role hanya menghapus cookie miliknya', adminOk && custOk, `Admin: ${adminLogoutCookies}, Cust: ${custLogoutCookies}`);
  } catch (e) {
    report('REQ 5', 'Logout masing-masing role', false, e.message);
  }

  // ── REQ 6: Customer tidak mendapat akses admin setelah sesi admin dibersihkan ──
  try {
    // Attempt to access protected admin endpoint with only customer cookie
    const custCookieVal = customerCookie.split(';')[0];
    const adminAccessRes = await fetch(`${BASE_URL}/api/admin/categories`, {
      headers: { Cookie: custCookieVal },
    });
    const ok = adminAccessRes.status === 401;
    report('REQ 6', 'Customer tidak dapat mengakses API admin setelah sesi admin dibersihkan (HTTP 401)', ok, `Status: ${adminAccessRes.status}`);
  } catch (e) {
    report('REQ 6', 'Customer tidak mendapat akses admin', false, e.message);
  }

  // ── REQ 7: /admin/login melakukan redirect server-side dan mempertahankan tujuan valid ──
  try {
    const res = await fetch(`${BASE_URL}/admin/login?redirect=%2Fadmin%2Fproducts`, {
      redirect: 'manual',
    });
    const location = res.headers.get('location') || '';
    const isServerRedirect = res.status === 307 || res.status === 308;
    const targetsLoginWithDest = location.includes('/login?redirect=%2Fadmin%2Fproducts');
    report('REQ 7', '/admin/login melakukan redirect server-side (HTTP 307) dan mempertahankan tujuan admin', isServerRedirect && targetsLoginWithDest, `Status: ${res.status}, Location: ${location}`);
  } catch (e) {
    report('REQ 7', '/admin/login redirect server-side', false, e.message);
  }

  // ── REQ 8: /checkout?ref=order:123 tidak salah dinetralkan menjadi / ──
  try {
    const { sanitizeRedirect } = await import('./src/lib/redirect.js');
    const targetWithColon = '/checkout?ref=order:123';
    const sanitized = sanitizeRedirect(targetWithColon, { fallback: '/', role: 'USER' });
    const ok = sanitized === '/checkout?ref=order:123';
    report('REQ 8', 'Query parameter internal dengan tanda titik dua (/checkout?ref=order:123) tetap dipertahankan', ok, `Result: ${sanitized}`);
  } catch (e) {
    report('REQ 8', 'Query parameter dengan titik dua', false, e.message);
  }

  // ── REQ 9: URL eksternal dan variasi target admin tetap ditolak untuk customer ──
  try {
    const { sanitizeRedirect } = await import('./src/lib/redirect.js');
    const ext1 = sanitizeRedirect('https://evil.com', { fallback: '/', role: 'USER' });
    const ext2 = sanitizeRedirect('//evil.com', { fallback: '/', role: 'USER' });
    const ext3 = sanitizeRedirect('/\\evil.com', { fallback: '/', role: 'USER' });
    const adm1 = sanitizeRedirect('/admin', { fallback: '/', role: 'USER' });
    const adm2 = sanitizeRedirect('/admin/products', { fallback: '/', role: 'USER' });
    const adm3 = sanitizeRedirect('/ADMIN/products', { fallback: '/', role: 'USER' });
    const adm4 = sanitizeRedirect('/admin?foo=bar', { fallback: '/', role: 'USER' });
    const adm5 = sanitizeRedirect('/admin#section', { fallback: '/', role: 'USER' });

    const ok = ext1 === '/' && ext2 === '/' && ext3 === '/' &&
               adm1 === '/' && adm2 === '/' && adm3 === '/' && adm4 === '/' && adm5 === '/';
    report('REQ 9', 'URL eksternal, protocol-relative, dan seluruh variasi /admin ditolak untuk customer', ok, `adm3: ${adm3}, adm4: ${adm4}, adm5: ${adm5}`);
  } catch (e) {
    report('REQ 9', 'URL eksternal dan variasi admin ditolak', false, e.message);
  }

  // ── REQ 10: Alur registrasi, auth/me, dan checkout tidak mengalami regresi ──
  try {
    // Reject admin email on register
    const regAdminRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fake Admin', email: ADMIN_EMAIL, password: 'Pass12345!' }),
    });
    const regAdminData = await regAdminRes.json();
    const regAdminBlocked = regAdminRes.status === 400 && regAdminData.success === false;

    // Verify session
    const custVal = customerCookie.split(';')[0];
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: custVal },
    });
    const meData = await meRes.json();
    const meOk = meRes.status === 200 && meData.user?.email === testCustomerEmail;

    report('REQ 10', 'Proteksi registrasi ADMIN_EMAIL dan /api/auth/me customer tetap bekerja normal', regAdminBlocked && meOk, `Me ok: ${meOk}`);
  } catch (e) {
    report('REQ 10', 'Regresi alur customer', false, e.message);
  }

  // ── REQ 11: Sanitasi redirect registrasi customer ──
  try {
    const { sanitizeRedirect } = await import('./src/lib/redirect.js');
    const tRoot = sanitizeRedirect('/', { fallback: '/', role: 'USER' });
    const tCheckout = sanitizeRedirect('/checkout', { fallback: '/', role: 'USER' });
    const tExt = sanitizeRedirect('https://evil.com', { fallback: '/', role: 'USER' });
    const tProto = sanitizeRedirect('//example.com', { fallback: '/', role: 'USER' });
    const tAdmin = sanitizeRedirect('/admin/products', { fallback: '/', role: 'USER' });

    const ok = tRoot === '/' &&
               tCheckout === '/checkout' &&
               tExt === '/' &&
               tProto === '/' &&
               tAdmin === '/';

    report('REQ 11', 'Sanitasi target redirect registrasi (/ -> /, /checkout -> /checkout, eksternal/admin -> /)', ok, `Results: ${tRoot}, ${tCheckout}, ${tExt}, ${tProto}, ${tAdmin}`);
  } catch (e) {
    report('REQ 11', 'Sanitasi redirect registrasi', false, e.message);
  }

  // ── REQ 12: Defense-in-depth endpoint produk admin (/api/admin/products) ──
  try {
    // 1. Tanpa cookie
    const noAuthRes = await fetch(`${BASE_URL}/api/admin/products`);
    const noAuthOk = noAuthRes.status === 401;

    // 2. Dengan cookie customer
    const custVal = customerCookie.split(';')[0];
    const custRes = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Cookie: custVal },
    });
    const custOk = custRes.status === 401;

    // 3. Dengan cookie admin valid
    const admVal = adminCookie.split(';')[0];
    const admRes = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Cookie: admVal },
    });
    const admOk = admRes.status === 200;

    const allOk = noAuthOk && custOk && admOk;
    report('REQ 12', 'Defense-in-depth produk admin: tanpa auth (401), customer (401), admin valid (200)', allOk, `noAuth: ${noAuthRes.status}, cust: ${custRes.status}, adm: ${admRes.status}`);
  } catch (e) {
    report('REQ 12', 'Defense-in-depth produk admin', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 HASIL TEST: ${passed} PASS, ${failed} FAIL (Total: ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
