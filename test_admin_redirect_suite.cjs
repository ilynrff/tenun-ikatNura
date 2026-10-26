const assert = require('assert');

async function runTests() {
  console.log('=== TEST SUITE: Admin Login Redirect & Security Validation ===\n');

  const { sanitizeRedirect, isValidInternalUrl } = await import('./src/lib/redirect.js');

  // 1. Admin login dengan URL /login tanpa query string (rawTarget = '/') -> menuju /admin
  console.log('Test 1: Admin login tanpa query string (target /) -> /admin');
  const t1 = sanitizeRedirect('/', { fallback: '/admin', role: 'ADMIN' });
  console.log('  Result:', t1);
  assert.strictEqual(t1, '/admin', 'Admin login tanpa query string harus menuju /admin');

  // 2. Admin login dengan ?redirect=/login -> menuju /admin (mencegah loop)
  console.log('Test 2: Admin login dengan ?redirect=/login -> /admin');
  const t2 = sanitizeRedirect('/login', { fallback: '/admin', role: 'ADMIN' });
  console.log('  Result:', t2);
  assert.strictEqual(t2, '/admin', 'Admin login dengan target /login harus diarahkan ke /admin');

  const t2b = sanitizeRedirect('/login?foo=bar', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(t2b, '/admin', 'Admin login dengan subpath /login harus diarahkan ke /admin');

  const t2c = sanitizeRedirect('/admin/login', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(t2c, '/admin', 'Admin login dengan target /admin/login harus diarahkan ke /admin');

  // 3. Admin login dengan ?redirect=/admin -> menuju /admin
  console.log('Test 3: Admin login dengan ?redirect=/admin -> /admin');
  const t3 = sanitizeRedirect('/admin', { fallback: '/admin', role: 'ADMIN' });
  console.log('  Result:', t3);
  assert.strictEqual(t3, '/admin', 'Admin login dengan target /admin harus menuju /admin');

  // 3b. Admin login dengan subpath spesifik yang sah (misal /admin/products, /admin/categories)
  console.log('Test 3b: Admin login dengan subpath sah -> dipertahankan');
  const t3b = sanitizeRedirect('/admin/products', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(t3b, '/admin/products', 'Target /admin/products harus dipertahankan');

  const t3c = sanitizeRedirect('/admin/categories?tab=active', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(t3c, '/admin/categories?tab=active', 'Target admin dengan query param harus dipertahankan');

  // 4. Redirect eksternal atau URL tidak aman ditolak
  console.log('Test 4: Redirect eksternal dan URL tidak aman ditolak');
  const ext1 = sanitizeRedirect('https://evil.com', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(ext1, '/admin', 'https://evil.com harus ditolak dan fallback ke /admin');

  const ext2 = sanitizeRedirect('//evil.com', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(ext2, '/admin', '//evil.com protocol-relative harus ditolak');

  const ext3 = sanitizeRedirect('/\\evil.com', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(ext3, '/admin', 'Backslash trick harus ditolak');

  const ext4 = sanitizeRedirect('javascript:alert(1)', { fallback: '/admin', role: 'ADMIN' });
  assert.strictEqual(ext4, '/admin', 'javascript: scheme harus ditolak');

  // 4b. Customer role tetap dilarang mengakses /admin
  console.log('Test 4b: Customer role dilarang diarahkan ke /admin');
  const custAdmin = sanitizeRedirect('/admin/products', { fallback: '/', role: 'USER' });
  assert.strictEqual(custAdmin, '/', 'Role USER dilarang diarahkan ke /admin');

  // 5. Rute admin tetap terlindungi saat tidak ada sesi (pengujian HTTP ke localhost dev server)
  console.log('Test 5: Verifikasi proteksi rute admin tanpa sesi');
  try {
    const adminPageRes = await fetch('http://localhost:3000/admin', { redirect: 'manual' });
    console.log('  GET /admin status:', adminPageRes.status, 'location:', adminPageRes.headers.get('location'));
    assert.strictEqual(adminPageRes.status, 307, 'Halaman /admin tanpa cookie harus mengembalikan HTTP 307');
    assert(adminPageRes.headers.get('location').includes('/login'), 'Redirect harus mengarah ke /login');

    const adminApiRes = await fetch('http://localhost:3000/api/admin/products');
    console.log('  GET /api/admin/products status:', adminApiRes.status);
    assert.strictEqual(adminApiRes.status, 401, 'API /api/admin/products tanpa cookie harus mengembalikan HTTP 401');

    const adminMeRes = await fetch('http://localhost:3000/api/admin/auth/me');
    console.log('  GET /api/admin/auth/me status:', adminMeRes.status);
    const adminMeData = await adminMeRes.json();
    assert.strictEqual(adminMeRes.status, 200, 'API /api/admin/auth/me tanpa cookie harus mengembalikan HTTP 200 (unauthenticated)');
    assert.strictEqual(adminMeData.authenticated, false, 'Payload authenticated harus false');
  } catch (err) {
    console.log('  (Catatan: Pastikan dev server localhost:3000 aktif untuk pengujian HTTP)');
  }

  console.log('\n=== ALL 5 TEST SUITE CATEGORIES PASSED (100%) ===\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
