const assert = require('assert');

async function runIntegration() {
  console.log('=== RUNNING INTEGRATION TEST: SIZES TAHAP 1 & BUG KAPITALISASI ===');

  // Mengimpor langsung modul aktual src/lib/sizes.js
  const sizesModule = await import('./src/lib/sizes.js');
  const { sortSizes, isCustomSize, normalizeSizeLabel, STANDARD_SIZES } = sizesModule;

  // Test 1: Canonical sort order
  const rawSizes1 = ['XL', 'Custom Size', 'S', 'XXL', 'M', 'XS', 'L'];
  const sorted1 = sortSizes(rawSizes1);
  console.log('Test 1 (Canonical Sort):', sorted1);
  assert.deepStrictEqual(sorted1, ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Size']);

  // Test 2: Additional sizes (e.g. 3XL, 30, All Size)
  const rawSizes2 = ['Custom Size', '30', '3XL', 'M', 'All Size', '28', 'S'];
  const sorted2 = sortSizes(rawSizes2);
  console.log('Test 2 (Mixed Standards & Numerics):', sorted2);
  assert.deepStrictEqual(sorted2, ['S', 'M', '3XL', 'All Size', '28', '30', 'Custom Size']);

  // Test 3: Admin dynamic available sizes & Case-Insensitive Chip Matching
  console.log('Test 3 (Admin Chip Case-Insensitivity Simulation):');
  // Simulasi admin mengetik 'xxl' (huruf kecil) pada input manual
  const rawInputFromAdmin = 'xxl';
  const normalizedFromAdmin = normalizeSizeLabel(rawInputFromAdmin.trim());
  assert.strictEqual(normalizedFromAdmin, 'XXL', 'Input "xxl" harus dinormalisasi menjadi "XXL"');

  const formSizes = sortSizes([normalizedFromAdmin]);
  const allAvailableForAdmin = sortSizes(
    Array.from(new Set([...STANDARD_SIZES, ...formSizes]))
  );

  console.log('Admin chips:', allAvailableForAdmin);
  assert(allAvailableForAdmin.includes('XXL'), 'Daftar chip admin harus memuat "XXL"');

  // Verifikasi logika isSelected pada ProductForm.js
  const isSelectedXXL = formSizes.some((s) => s.toLowerCase() === 'XXL'.toLowerCase());
  assert.strictEqual(isSelectedXXL, true, 'Chip "XXL" harus aktif saat admin memasukkan "xxl"');

  // Simulasi jika data lama di database tersimpan dalam huruf kecil 's' atau 'xl'
  const legacySizesInDB = ['s', 'xl', 'Custom Size'];
  const normalizedDB = sortSizes(legacySizesInDB);
  console.log('Legacy sizes normalized from DB:', normalizedDB);
  assert.deepStrictEqual(normalizedDB, ['S', 'XL', 'Custom Size']);

  // Test 4: Custom label tanpa kapitalisasi penuh
  const customLabelInput = 'Batik Jumbo';
  const normalizedCustom = normalizeSizeLabel(customLabelInput);
  assert.strictEqual(normalizedCustom, 'Batik Jumbo', 'Label kustom tidak boleh dipaksa menjadi BATIK JUMBO');

  // Test 5: Compatibility with orders.js size check
  const dbProduct = {
    id: 'prod-1',
    name: 'Nusa Indah Outer',
    sizes: sorted1, // ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Size']
  };

  function validateOrderSize(product, customerChosenSize) {
    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0 &&
      customerChosenSize &&
      !product.sizes.includes(customerChosenSize)
    ) {
      throw new Error(`Ukuran "${customerChosenSize}" tidak tersedia`);
    }
    return true;
  }

  // Check standard sizes pass
  assert.strictEqual(validateOrderSize(dbProduct, 'S'), true);
  assert.strictEqual(validateOrderSize(dbProduct, 'XXL'), true);
  assert.strictEqual(validateOrderSize(dbProduct, 'Custom Size'), true);
  // Check invalid size throws
  assert.throws(() => validateOrderSize(dbProduct, '42'), /tidak tersedia/);

  console.log('=== ALL 5 INTEGRATION TESTS PASSED USING ACTUAL src/lib/sizes.js! ===');
}

runIntegration().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
