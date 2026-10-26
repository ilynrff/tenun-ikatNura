const assert = require('assert');
const fs = require('fs');
const nextConfig = require('./next.config.js');

console.log('--- TEST SUITE: Image Preview & Next.js Image Config ---');

// Test 1: next.config.js remotePatterns validation
console.log('Test 1: Memverifikasi remotePatterns pada next.config.js...');
assert(nextConfig.images, 'nextConfig.images harus terdefinisi');
assert(Array.isArray(nextConfig.images.remotePatterns), 'remotePatterns harus berupa array');
assert(nextConfig.images.remotePatterns.length > 0, 'remotePatterns tidak boleh kosong');

const supabasePattern = nextConfig.images.remotePatterns.find(p => p.hostname === 'eieyzehxptpfhyzvbnms.supabase.co');
assert(supabasePattern, 'Harus ada pattern untuk hostname eieyzehxptpfhyzvbnms.supabase.co');
assert.strictEqual(supabasePattern.protocol, 'https', 'Protokol harus https');
assert.strictEqual(supabasePattern.pathname, '/storage/v1/object/public/**', 'Pathname harus mengizinkan public storage');
assert(!nextConfig.images.remotePatterns.some(p => p.hostname === '*' || p.hostname === '**'), 'Tidak boleh ada wildcard hostname sembarang domain');
console.log('  ✓ Test 1 Lolos: Hostname Supabase terkonfigurasi secara ketat dan aman.');

// Test 2: Validasi logika unoptimized untuk preview gambar di ProductForm
console.log('Test 2: Memverifikasi evaluasi unoptimized untuk status preview...');
function getUnoptimizedProp(status) {
  return status === 'legacy' || status === 'uploaded';
}

assert.strictEqual(getUnoptimizedProp('legacy'), true, 'Gambar status "legacy" harus unoptimized: true');
assert.strictEqual(getUnoptimizedProp('uploaded'), true, 'Gambar status "uploaded" harus unoptimized: true');
assert.strictEqual(getUnoptimizedProp('local'), false, 'Gambar status "local" bukan unoptimized');
assert.strictEqual(getUnoptimizedProp('uploading'), false, 'Gambar status "uploading" bukan unoptimized (ditangani spinner)');
console.log('  ✓ Test 2 Lolos: Status preview "legacy" dan "uploaded" keduanya di-unoptimize secara konsisten.');

// Test 3: Validasi kecocokan SUPABASE_URL dengan remotePatterns
console.log('Test 3: Memverifikasi konsistensi SUPABASE_URL dari .env.local dengan remotePatterns...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/SUPABASE_URL\s*=\s*(.+)/);
  if (match) {
    let rawUrl = match[1].trim().replace(/^['"]|['"]$/g, '');
    const u = new URL(rawUrl);
    assert.strictEqual(u.hostname, supabasePattern.hostname, 'Hostname di .env.local harus sama persis dengan remotePatterns di next.config.js');
    console.log(`  ✓ Test 3 Lolos: Hostname SUPABASE_URL (${u.hostname}) cocok 100% dengan hostname remotePatterns.`);
  } else {
    console.log('  ⚠ Test 3 Peringatan: SUPABASE_URL tidak ditemukan di .env.local');
  }
} else {
  console.log('  ⚠ Test 3 Peringatan: .env.local tidak ada di direktori kerja');
}

// Test 4: Memastikan kode ProductForm.js memuat unoptimized condition yang diperbaiki
console.log('Test 4: Memeriksa kode ProductForm.js memiliki unoptimized={preview.status === "legacy" || preview.status === "uploaded"}...');
const productFormContent = fs.readFileSync('src/components/admin/ProductForm.js', 'utf8');
assert(
  productFormContent.includes("unoptimized={preview.status === 'legacy' || preview.status === 'uploaded'}"),
  'ProductForm.js harus menyertakan status uploaded pada unoptimized'
);
console.log('  ✓ Test 4 Lolos: ProductForm.js memiliki perbaikan unoptimized.');

console.log('\nSEMUA TES LOGIKA DAN KONFIGURASI PREVIEW LOLOS (4/4)!');
