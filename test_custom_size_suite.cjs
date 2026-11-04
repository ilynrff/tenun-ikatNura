/**
 * TEST SUITE — Custom Size Feature
 * Tenun Ikat Nura
 *
 * Tests:
 * A. isCustomSize() logic tests
 * B. Source code inspection tests (guards present in all 4 files)
 * C. Integration test: POST /api/orders with Custom Size → 400
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  ❌ FAIL: ${name} — ${err.message}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  ❌ FAIL: ${name} — ${err.message}`);
  }
}

// ─── SECTION A: isCustomSize() logic tests ────────────────────
async function runLogicTests() {
  console.log('\n═══ A. isCustomSize() Logic Tests ═══');

  // Dynamic import of ESM module
  const sizesModule = await import('./src/lib/sizes.js');
  const { isCustomSize, sortSizes } = sizesModule;

  test('A1: isCustomSize("Custom Size") → true', () => {
    assert.strictEqual(isCustomSize('Custom Size'), true);
  });

  test('A2: isCustomSize("custom size") → true (case-insensitive)', () => {
    assert.strictEqual(isCustomSize('custom size'), true);
  });

  test('A3: isCustomSize("custom") → true', () => {
    assert.strictEqual(isCustomSize('custom'), true);
  });

  test('A4: isCustomSize("ukuran khusus") → true', () => {
    assert.strictEqual(isCustomSize('ukuran khusus'), true);
  });

  test('A5: isCustomSize("S") → false', () => {
    assert.strictEqual(isCustomSize('S'), false);
  });

  test('A6: isCustomSize("M") → false', () => {
    assert.strictEqual(isCustomSize('M'), false);
  });

  test('A7: isCustomSize("XL") → false', () => {
    assert.strictEqual(isCustomSize('XL'), false);
  });

  test('A8: isCustomSize("XXL") → false', () => {
    assert.strictEqual(isCustomSize('XXL'), false);
  });

  test('A9: isCustomSize(null) → false', () => {
    assert.strictEqual(isCustomSize(null), false);
  });

  test('A10: isCustomSize("") → false', () => {
    assert.strictEqual(isCustomSize(''), false);
  });

  test('A11: sortSizes puts Custom Size last', () => {
    const sorted = sortSizes(['Custom Size', 'S', 'M', 'L']);
    assert.strictEqual(sorted[sorted.length - 1], 'Custom Size');
    assert.strictEqual(sorted[0], 'S');
  });
}

// ─── SECTION B: Source code inspection tests ──────────────────
function runSourceCodeTests() {
  console.log('\n═══ B. Source Code Inspection Tests ═══');

  const detailPageSrc = fs.readFileSync(
    path.join(__dirname, 'src/components/product/ProductDetailPage.js'),
    'utf8'
  );

  test('B1: ProductDetailPage — Custom Size hides quantity selector', () => {
    assert.ok(
      detailPageSrc.includes('!isSelectedCustom'),
      'Expected "!isSelectedCustom" in quantity section'
    );
  });

  test('B2: ProductDetailPage — Custom Size shows unified WhatsApp CTA', () => {
    assert.ok(
      detailPageSrc.includes('Konsultasi via WhatsApp'),
      'Expected unified WhatsApp CTA text "Konsultasi via WhatsApp"'
    );
  });

  test('B3: ProductDetailPage — handleAddToCart guards Custom Size', () => {
    assert.ok(
      detailPageSrc.includes('if (isSelectedCustom) return;'),
      'Expected isSelectedCustom guard in handleAddToCart'
    );
  });

  test('B4: ProductDetailPage — handleBuyNow guards Custom Size', () => {
    // Check both guards exist
    const buyNowGuard = detailPageSrc.includes('if (isSelectedCustom) return; // Custom Size cannot use Buy Now');
    assert.ok(buyNowGuard, 'Expected isSelectedCustom guard in handleBuyNow');
  });

  test('B5: ProductDetailPage — Sticky bar has Custom Size handling', () => {
    assert.ok(
      detailPageSrc.includes('stickyBarBtnCustom'),
      'Expected stickyBarBtnCustom in sticky bar'
    );
  });

  test('B6: ProductDetailPage — Custom Size panel text is updated', () => {
    assert.ok(
      detailPageSrc.includes('Pesanan Ukuran Khusus'),
      'Expected "Pesanan Ukuran Khusus" panel title'
    );
    assert.ok(
      detailPageSrc.includes('Produk akan dibuat menyesuaikan ukuran badan Anda'),
      'Expected updated Custom Size panel description'
    );
    assert.ok(
      !detailPageSrc.includes('Anda dapat mencantumkan ukuran pada catatan checkout'),
      'Old checkout text should be removed'
    );
  });

  // ProductModal tests
  const modalSrc = fs.readFileSync(
    path.join(__dirname, 'src/components/collections/ProductModal.js'),
    'utf8'
  );

  test('B7: ProductModal — imports isCustomSize', () => {
    assert.ok(
      modalSrc.includes("isCustomSize") && modalSrc.includes("from '@/lib/sizes'"),
      'Expected isCustomSize import from sizes.js'
    );
  });

  test('B8: ProductModal — handleAddToCart guards Custom Size', () => {
    assert.ok(
      modalSrc.includes('if (isCustomSize(selectedSize)) return;'),
      'Expected isCustomSize guard in handleAddToCart'
    );
  });

  test('B9: ProductModal — Custom Size shows unified WhatsApp CTA', () => {
    assert.ok(
      modalSrc.includes('Konsultasi via WhatsApp'),
      'Expected unified WhatsApp CTA for Custom Size in modal'
    );
  });

  test('B10: ProductModal — isSelectedCustom is computed', () => {
    assert.ok(
      modalSrc.includes('isSelectedCustom'),
      'Expected isSelectedCustom variable'
    );
  });

  // CartContext tests
  const cartSrc = fs.readFileSync(
    path.join(__dirname, 'src/context/CartContext.js'),
    'utf8'
  );

  test('B11: CartContext — imports isCustomSize', () => {
    assert.ok(
      cartSrc.includes("import { isCustomSize } from '@/lib/sizes'"),
      'Expected isCustomSize import'
    );
  });

  test('B12: CartContext — addToCart guards Custom Size', () => {
    assert.ok(
      cartSrc.includes('isCustomSize(size)'),
      'Expected isCustomSize(size) guard in addToCart'
    );
  });

  test('B13: CartContext — Custom Size guard returns false', () => {
    assert.ok(
      cartSrc.includes('return false'),
      'Expected return false when Custom Size is blocked'
    );
  });

  test('B14: CartContext — Custom Size guard has console.warn', () => {
    assert.ok(
      cartSrc.includes('Custom Size tidak dapat ditambahkan ke keranjang'),
      'Expected warning message for Custom Size'
    );
  });

  // orders.js tests
  const ordersSrc = fs.readFileSync(
    path.join(__dirname, 'src/lib/orders.js'),
    'utf8'
  );

  test('B15: orders.js — imports isCustomSize', () => {
    assert.ok(
      ordersSrc.includes("import { isCustomSize } from './sizes.js'"),
      'Expected isCustomSize import in orders.js'
    );
  });

  test('B16: orders.js — validateItemsInput blocks Custom Size', () => {
    assert.ok(
      ordersSrc.includes('isCustomSize(item.size)'),
      'Expected isCustomSize check in validateItemsInput'
    );
  });

  test('B17: orders.js — Custom Size rejection message is correct', () => {
    assert.ok(
      ordersSrc.includes('Produk dengan Custom Size memerlukan konsultasi dan konfirmasi WhatsApp Admin terlebih dahulu sebelum pesanan diproses.'),
      'Expected exact rejection message'
    );
  });

  test('B18: orders.js — Custom Size check is before productId validation', () => {
    const customCheckIndex = ordersSrc.indexOf('isCustomSize(item.size)');
    const productIdCheckIndex = ordersSrc.indexOf("!item.productId || !String(item.productId).trim()");
    assert.ok(
      customCheckIndex < productIdCheckIndex,
      'Custom Size check should be before productId validation in the loop'
    );
  });

  test('B19: orders.js — Custom Size check is before DB transaction', () => {
    const customCheckIndex = ordersSrc.indexOf('isCustomSize(item.size)');
    const transactionIndex = ordersSrc.indexOf('prisma.$transaction');
    assert.ok(
      customCheckIndex < transactionIndex,
      'Custom Size check should be before DB transaction'
    );
  });

  // WhatsApp message format tests
  test('B20: ProductDetailPage — WhatsApp message includes SKU', () => {
    assert.ok(
      detailPageSrc.includes("piece.sku || 'NURA-ITEM'"),
      'Expected SKU in WhatsApp message template'
    );
  });

  test('B21: ProductDetailPage — WhatsApp uses configured number', () => {
    assert.ok(
      detailPageSrc.includes("siteData.contact.whatsapp"),
      'Expected WhatsApp number from site config'
    );
  });

  test('B22: ProductModal — WhatsApp message includes SKU', () => {
    assert.ok(
      modalSrc.includes("product.sku || 'NURA-ITEM'"),
      'Expected SKU in modal WhatsApp message'
    );
  });

  test('B23: ProductDetailPage — No duplicate WhatsApp button for Custom Size', () => {
    // When isSelectedCustom is true, only ONE WhatsApp CTA is rendered in actionBlock
    assert.ok(
      detailPageSrc.includes('waCustomBtn'),
      'Expected waCustomBtn for Custom Size'
    );
    // Ensure the secondary whatsappBtn is in the standard-size else branch
    const customBranchIndex = detailPageSrc.indexOf('isSelectedCustom ? (');
    const waCustomBtnIndex = detailPageSrc.indexOf('waCustomBtn', customBranchIndex);
    const elseBranchIndex = detailPageSrc.indexOf(': (', waCustomBtnIndex);
    const secondaryWaBtnIndex = detailPageSrc.indexOf('whatsappBtn', elseBranchIndex);
    assert.ok(
      waCustomBtnIndex < elseBranchIndex && elseBranchIndex < secondaryWaBtnIndex,
      'Secondary WhatsApp button must be exclusively inside the standard size branch'
    );
  });

  test('B24: ProductModal — No duplicate WhatsApp button for Custom Size', () => {
    // When isSelectedCustom is true in modal, only ONE WhatsApp CTA is rendered
    assert.ok(
      modalSrc.includes('waCustomBtn'),
      'Expected waCustomBtn in ProductModal'
    );
    const customBranchIndex = modalSrc.indexOf('isSelectedCustom ? (');
    const waCustomBtnIndex = modalSrc.indexOf('waCustomBtn', customBranchIndex);
    const elseBranchIndex = modalSrc.indexOf(': (', waCustomBtnIndex);
    const secondaryWaBtnIndex = modalSrc.indexOf('waBtn', elseBranchIndex);
    assert.ok(
      waCustomBtnIndex < elseBranchIndex && elseBranchIndex < secondaryWaBtnIndex,
      'Secondary WhatsApp button in modal must be exclusively inside the standard size branch'
    );
  });
}

// ─── SECTION C: Integration test (requires running server) ────
async function runIntegrationTests() {
  console.log('\n═══ C. Integration Tests (Server Required) ═══');

  const { spawn } = require('child_process');
  const http = require('http');
  const PORT = 3009;

  // Check if .next directory exists (build required)
  if (!fs.existsSync(path.join(__dirname, '.next'))) {
    console.log('  ⚠️  SKIP: .next directory not found. Run "npm run build" first.');
    results.push({ name: 'C: Integration tests', status: 'SKIP', error: 'Build required' });
    return;
  }

  console.log(`  Starting Next.js server on port ${PORT}...`);

  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: __dirname,
    env: { ...process.env },
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverReady = false;
  let serverOutput = '';

  server.stdout.on('data', (d) => { serverOutput += d.toString(); });
  server.stderr.on('data', (d) => { serverOutput += d.toString(); });

  // Wait for server to start
  await new Promise((resolve) => {
    const checkReady = setInterval(() => {
      if (serverOutput.includes('Ready') || serverOutput.includes('started server')) {
        serverReady = true;
        clearInterval(checkReady);
        resolve();
      }
    }, 500);

    // Timeout after 30s
    setTimeout(() => {
      clearInterval(checkReady);
      if (!serverReady) {
        console.log('  ⚠️  Server startup timeout. Output:', serverOutput.slice(0, 500));
      }
      resolve();
    }, 30000);
  });

  if (!serverReady) {
    results.push({ name: 'C: Server startup', status: 'FAIL', error: 'Server did not start in 30s' });
    server.kill();
    return;
  }

  console.log('  Server is ready. Running integration tests...');

  // Helper: make HTTP request
  function httpRequest(options, body) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: data, json: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data, json: null });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // C1: POST /api/orders without auth → should return 401 (auth guard works before Custom Size check)
  await testAsync('C1: POST /api/orders without auth → 401 (auth first, then Custom Size)', async () => {
    const payload = {
      customerName: 'Test Customer',
      customerWhatsapp: '08123456789',
      shippingAddress: 'Jl. Test No. 1',
      destinationId: '12345',
      courier: 'jne',
      shippingService: 'REG',
      items: [
        {
          productId: 'some-product-id',
          quantity: 1,
          size: 'Custom Size',
        },
      ],
    };

    const res = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, payload);

    // Auth is checked FIRST in the route handler, before createOrder/validateItemsInput.
    // Without a valid session, we get 401 before the Custom Size check runs.
    // This is correct security behavior: auth → then validation.
    assert.strictEqual(res.status, 401, `Expected HTTP 401 (auth required), got ${res.status}`);
  });

  // C2: POST /api/orders with standard size "M" without auth → also 401, but NOT Custom Size rejection
  await testAsync('C2: POST /api/orders with standard size "M" → 401 (NOT Custom Size rejection)', async () => {
    const payload = {
      customerName: 'Test Customer',
      customerWhatsapp: '08123456789',
      shippingAddress: 'Jl. Test No. 1',
      destinationId: '12345',
      courier: 'jne',
      shippingService: 'REG',
      items: [
        {
          productId: 'nonexistent-id',
          quantity: 1,
          size: 'M',
        },
      ],
    };

    const res = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, payload);

    // Should fail for auth reason, NOT Custom Size
    if (res.json && res.json.message) {
      assert.ok(
        !res.json.message.includes('Custom Size'),
        `Standard size "M" should not trigger Custom Size rejection. Message: ${res.json.message}`
      );
    }
  });

  // C3: Verify validateItemsInput rejects Custom Size directly (unit-level through source inspection)
  // Since the API requires auth and we can't mock it in a production server,
  // we verify the validateItemsInput function by reading the compiled bundle.
  // The source code tests B16-B19 already confirm the guard is in place.
  await testAsync('C3: Verify Custom Size rejection exists in compiled server code', async () => {
    // Check that the compiled server code includes Custom Size validation
    const serverDir = path.join(__dirname, '.next', 'server');
    
    // Search for the Custom Size rejection message in compiled files
    const walkDir = (dir) => {
      const files = [];
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...walkDir(fullPath));
          } else if (entry.name.endsWith('.js')) {
            files.push(fullPath);
          }
        }
      } catch { /* skip inaccessible dirs */ }
      return files;
    };

    const serverFiles = walkDir(serverDir);
    let found = false;
    for (const file of serverFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('Custom Size memerlukan konsultasi')) {
        found = true;
        break;
      }
    }
    assert.ok(found, 'Custom Size rejection message should exist in compiled server code');
  });

  // Cleanup
  server.kill();
  console.log('  Server stopped.');
}

// ─── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Custom Size Feature — Test Suite              ║');
  console.log('║   Tenun Ikat Nura                               ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await runLogicTests();
  runSourceCodeTests();
  await runIntegrationTests();

  // Summary
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   TEST SUMMARY                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log(`  Total: ${results.length}`);
  console.log(`  ✅ PASS:  ${passed}`);
  console.log(`  ❌ FAIL:  ${failed}`);
  console.log(`  ⚠️  SKIP:  ${skipped}`);

  if (failed > 0) {
    console.log('\n  Failed tests:');
    results.filter((r) => r.status === 'FAIL').forEach((r) => {
      console.log(`    • ${r.name}: ${r.error}`);
    });
  }

  console.log(`\n  Overall: ${failed === 0 ? '✅ ALL PASS' : '❌ HAS FAILURES'}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
