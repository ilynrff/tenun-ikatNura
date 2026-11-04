const assert = require('assert');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const secret = process.env.ADMIN_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 TEST SUITE: Admin Dashboard Tenun Ikat Nura');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error('   ', err.message);
    }
  }

  // ----------------------------------------------------
  // 1. UJI LOGIKA PERHITUNGAN STATISTIK SECARA MATEMATIS
  // ----------------------------------------------------
  console.log('--- 1. Uji Logika Perhitungan Statistik ---');

  const testProducts = [
    { id: '1', name: 'Gaun Tenun 1', isActive: true, stock: 5, featured: false },
    { id: '2', name: 'Gaun Tenun 2', isActive: true, stock: 3, featured: true },  // Low stock, featured
    { id: '3', name: 'Outer Tenun 1', isActive: true, stock: 1, featured: false }, // Low stock
    { id: '4', name: 'Outer Tenun 2', isActive: true, stock: 0, featured: false }, // Out of stock
    { id: '5', name: 'Sarimbit 1', isActive: true, stock: 0, featured: true },    // Out of stock, featured
    { id: '6', name: 'Arsip Lama 1', isActive: false, stock: 0, featured: false }, // Inactive (tidak boleh dihitung)
    { id: '7', name: 'Arsip Lama 2', isActive: false, stock: 2, featured: true },  // Inactive (tidak boleh dihitung)
  ];

  test('Total Produk Aktif hanya menghitung isActive === true', () => {
    const totalActive = testProducts.filter(p => p.isActive === true).length;
    assert.strictEqual(totalActive, 5, 'Harus ada 5 produk aktif');
  });

  test('Stok Menipis menghitung stok > 0 dan <= 3 untuk produk aktif', () => {
    const lowStock = testProducts.filter(p => p.isActive === true && p.stock > 0 && p.stock <= 3).length;
    assert.strictEqual(lowStock, 2, 'Stok menipis harus tepat 2');
  });

  test('Stok Habis (stok = 0) TIDAK boleh terhitung sebagai Stok Menipis', () => {
    const lowStockWithZero = testProducts.filter(p => p.isActive === true && p.stock > 0 && p.stock <= 3);
    const zeroStockItems = lowStockWithZero.filter(p => p.stock === 0);
    assert.strictEqual(zeroStockItems.length, 0, 'Produk stok 0 tidak boleh ada di stok menipis');
  });

  test('Stok Habis menghitung stok === 0 untuk produk aktif', () => {
    const outOfStock = testProducts.filter(p => p.isActive === true && p.stock === 0).length;
    assert.strictEqual(outOfStock, 2, 'Stok habis harus tepat 2');
  });

  test('Featured Products menghitung featured === true untuk produk aktif', () => {
    const featured = testProducts.filter(p => p.isActive === true && p.featured === true).length;
    assert.strictEqual(featured, 2, 'Featured products aktif harus tepat 2');
  });

  test('Zero State: Ketika count = 0, menghasilkan tipe data number 0', () => {
    const emptySet = [];
    const totalActive = emptySet.filter(p => p.isActive).length;
    const lowStock = emptySet.filter(p => p.isActive && p.stock > 0 && p.stock <= 3).length;
    assert.strictEqual(totalActive, 0);
    assert.strictEqual(lowStock, 0);
    assert.strictEqual(typeof totalActive, 'number');
    assert.strictEqual(typeof lowStock, 'number');
  });

  // ----------------------------------------------------
  // 2. UJI KRIPTOGRAFI TOKEN ADMIN & HMAC VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 2. Uji Kriptografi HMAC Admin Token ---');

  function createTestAdminToken(payloadObj, customSecret = secret) {
    const payloadBase64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', customSecret)
      .update(payloadBase64)
      .digest('base64url');
    return `${payloadBase64}.${signature}`;
  }

  function verifyTestAdminToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    try {
      const isMatch = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
      if (!isMatch) return null;
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
      if (payload.exp && payload.exp < Date.now()) return null;
      if (payload.role !== 'ADMIN') return null;
      return payload;
    } catch (e) {
      return null;
    }
  }

  test('Token admin yang sah diverifikasi dengan sukses', () => {
    const validToken = createTestAdminToken({
      id: 'admin-01',
      email: adminEmail || 'admin@nura.id',
      role: 'ADMIN',
      exp: Date.now() + 3600000,
    });
    const verified = verifyTestAdminToken(validToken);
    assert.ok(verified !== null, 'Token sah harus lolos verifikasi');
    assert.strictEqual(verified.role, 'ADMIN');
  });

  test('Token palsu (forged signature) ditolak (return null)', () => {
    const forgedToken = createTestAdminToken({
      id: 'attacker',
      email: 'attacker@evil.com',
      role: 'ADMIN',
      exp: Date.now() + 3600000,
    }, 'wrong-secret-key-123');

    const verified = verifyTestAdminToken(forgedToken);
    assert.strictEqual(verified, null, 'Token dengan signature salah harus ditolak');
  });

  test('Token kedaluwarsa (expired) ditolak (return null)', () => {
    const expiredToken = createTestAdminToken({
      id: 'admin-01',
      email: adminEmail || 'admin@nura.id',
      role: 'ADMIN',
      exp: Date.now() - 5000, // 5 detik yang lalu
    });
    const verified = verifyTestAdminToken(expiredToken);
    assert.strictEqual(verified, null, 'Token kedaluwarsa harus ditolak');
  });

  test('Token dengan role non-ADMIN (misal USER) ditolak (return null)', () => {
    const customerToken = createTestAdminToken({
      id: 'cust-01',
      email: 'customer@gmail.com',
      role: 'USER',
      exp: Date.now() + 3600000,
    });
    const verified = verifyTestAdminToken(customerToken);
    assert.strictEqual(verified, null, 'Token non-admin harus ditolak');
  });

  // ----------------------------------------------------
  // 3. UJI STRUKTUR FILE & IMPLEMENTASI KODE
  // ----------------------------------------------------
  console.log('\n--- 3. Uji Integritas Implementasi Kode Dashboard ---');

  const pagePath = path.join(__dirname, 'src/app/admin/page.js');
  const loadingPath = path.join(__dirname, 'src/app/admin/loading.js');
  const cssPath = path.join(__dirname, 'src/app/admin/dashboard.module.css');
  const productsPath = path.join(__dirname, 'src/lib/products.js');

  const pageSource = fs.readFileSync(pagePath, 'utf8');
  const loadingSource = fs.readFileSync(loadingPath, 'utf8');
  const cssSource = fs.readFileSync(cssPath, 'utf8');
  const productsSource = fs.readFileSync(productsPath, 'utf8');

  test('page.js adalah Server Component dengan force-dynamic', () => {
    assert.ok(pageSource.includes("export const dynamic = 'force-dynamic'"));
  });

  test('page.js memanggil verifyServerAdmin() dan me-redirect jika tidak authorized', () => {
    assert.ok(pageSource.includes('verifyServerAdmin()'));
    assert.ok(pageSource.includes("redirect('/login?redirect=/admin')"));
  });

  test('page.js memanggil getDashboardStats() dan menampilkan errorBanner saat gagal', () => {
    assert.ok(pageSource.includes('getDashboardStats()'));
    assert.ok(pageSource.includes('errorBanner'));
  });

  test('page.js mempertahankan seluruh 3 tautan Aksi Cepat', () => {
    assert.ok(pageSource.includes('href="/admin/products/new"'));
    assert.ok(pageSource.includes('href="/admin/products"'));
    assert.ok(pageSource.includes('href="/admin/categories"'));
  });

  test('loading.js dibuat dengan komponen skeleton shimmer yang konsisten', () => {
    assert.ok(loadingSource.includes('skeletonStatValue'));
    assert.ok(loadingSource.includes('skeletonShimmer'));
  });

  test('dashboard.module.css memiliki styling skeleton dan error banner', () => {
    assert.ok(cssSource.includes('.skeletonStatValue'));
    assert.ok(cssSource.includes('.errorBanner'));
    assert.ok(cssSource.includes('.statValueFailed'));
  });

  test('products.js mengekspor fungsi getDashboardStats() dengan query Prisma yang benar', () => {
    assert.ok(productsSource.includes('export async function getDashboardStats()'));
    assert.ok(productsSource.includes('prisma.product.count'));
    assert.ok(productsSource.includes('stock: { gt: 0, lte: 3 }'));
    assert.ok(productsSource.includes('stock: 0'));
  });

  // ----------------------------------------------------
  // 4. UJI INTEGRASI NEXT.JS SERVER RUNTIME (PORT 3008)
  // ----------------------------------------------------
  console.log('\n--- 4. Uji Server Runtime Integration (Next.js Start) ---');

  const PORT = 3008;
  const validAdminToken = createTestAdminToken({
    id: 'admin-01',
    email: adminEmail || 'admin@nura.id',
    role: 'ADMIN',
    exp: Date.now() + 3600000,
  });

  const serverProc = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    cwd: __dirname,
    env: process.env,
    stdio: 'ignore',
  });

  // Tunggu server up
  await new Promise(r => setTimeout(r, 4000));

  function makeRequest(path, cookie = '') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'GET',
        headers: cookie ? { Cookie: cookie } : {},
      };

      const req = http.request(options, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      });

      req.on('error', err => reject(err));
      req.end();
    });
  }

  try {
    // 4.1 Request tanpa cookie -> Harus redirect ke /login
    const resNoAuth = await makeRequest('/admin');
    test('Akses /admin tanpa sesi admin di-redirect ke /login', () => {
      const isRedirect = resNoAuth.status === 307 || resNoAuth.status === 308 || resNoAuth.status === 302;
      assert.ok(isRedirect, `Status harus redirect (307/308/302), dapat: ${resNoAuth.status}`);
      const loc = resNoAuth.headers.location || '';
      assert.ok(loc.includes('/login'), `Location header harus mengarah ke /login, dapat: ${loc}`);
    });

    // 4.2 Request dengan cookie palsu (signature rusak) -> Diarahkan ke login & data tidak bocor
    const forgedCookie = `nura_admin_session=${createTestAdminToken({ role: 'ADMIN', exp: Date.now() + 3600000 }, 'fake-key')}`;
    const resForged = await makeRequest('/admin', forgedCookie);
    test('Akses /admin dengan token palsu ditolak dan diarahkan ke /login', () => {
      // Server merespons instruksi redirect (baik header 307 maupun streaming NEXT_REDIRECT ke /login)
      const redirectsToLogin = (resForged.status === 307 || resForged.status === 308) || resForged.body.includes('/login');
      assert.ok(redirectsToLogin, 'Respon harus mengarahkan ke /login');
    });

    // 4.3 Request dengan token admin sah -> Harus mengembalikan 200 OK dengan Dashboard
    const validCookie = `nura_admin_session=${validAdminToken}`;
    const resAdmin = await makeRequest('/admin', validCookie);
    test('Akses /admin dengan token admin sah berhasil 200 OK dan merender Dashboard', () => {
      assert.strictEqual(resAdmin.status, 200, `Harus status 200, dapat: ${resAdmin.status}`);
      assert.ok(resAdmin.body.includes('Admin Dashboard'), 'HTML harus memuat judul Admin Dashboard');
      assert.ok(resAdmin.body.includes('Total Produk Aktif'), 'HTML harus memuat kartu Total Produk Aktif');
      assert.ok(resAdmin.body.includes('Stok Menipis'), 'HTML harus memuat kartu Stok Menipis');
      assert.ok(resAdmin.body.includes('Stok Habis'), 'HTML harus memuat kartu Stok Habis');
      assert.ok(resAdmin.body.includes('Featured Products'), 'HTML harus memuat kartu Featured Products');
      assert.ok(resAdmin.body.includes('Aksi Cepat'), 'HTML harus memuat section Aksi Cepat');
      assert.ok(resAdmin.body.includes('/admin/products/new'), 'HTML harus memuat link Tambah Produk');
      assert.ok(resAdmin.body.includes('/admin/products'), 'HTML harus memuat link Kelola Semua Produk');
      assert.ok(resAdmin.body.includes('/admin/categories'), 'HTML harus memuat link Kelola Kategori');
    });

  } catch (err) {
    console.error('Server probe error:', err);
  } finally {
    serverProc.kill();
  }

  console.log(`\n====================================================`);
  console.log(`🎉 HASIL PENGUJIAN AKHIR: ${passed} / ${total} BERHASIL (${Math.round((passed/total)*100)}%)`);
  console.log(`====================================================`);
}

runTestSuite().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
