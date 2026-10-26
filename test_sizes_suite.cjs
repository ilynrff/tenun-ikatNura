const assert = require('assert');

async function runSuite() {
  console.log('--- Running Size Suite Tests (Actual src/lib/sizes.js) ---');

  // Mengimpor langsung modul aktual src/lib/sizes.js
  const sizesModule = await import('./src/lib/sizes.js');
  const { sortSizes, isCustomSize, normalizeSizeLabel, STANDARD_SIZES } = sizesModule;

  // 1. Basic sorting with XXL & Custom Size
  const t1 = sortSizes(['XL', 'Custom Size', 'S', 'XXL', 'M', 'XS', 'L']);
  console.log('Test 1 result:', t1);
  assert.deepStrictEqual(t1, ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Size']);

  // 2. Custom size added
  const t2 = sortSizes(['M', 'XXL', 'S']);
  console.log('Test 2 result:', t2);
  assert.deepStrictEqual(t2, ['S', 'M', 'XXL']);

  // 3. Numeric sizes (pants/skirts)
  const t3 = sortSizes(['32', 'Custom Size', '28', '30', 'L', 'S']);
  console.log('Test 3 result:', t3);
  assert.deepStrictEqual(t3, ['S', 'L', '28', '30', '32', 'Custom Size']);

  // 4. Duplicate and whitespace handling with case normalization
  const t4 = sortSizes([' S ', 's', 'XL', 'M', 'custom size', 'Custom Size']);
  console.log('Test 4 result:', t4);
  assert.deepStrictEqual(t4, ['S', 'M', 'XL', 'Custom Size']);

  // 5. isCustomSize test
  assert.strictEqual(isCustomSize('Custom Size'), true);
  assert.strictEqual(isCustomSize('custom size'), true);
  assert.strictEqual(isCustomSize('custom'), true);
  assert.strictEqual(isCustomSize('XXL'), false);
  assert.strictEqual(isCustomSize('S'), false);

  // 6. Test normalizeSizeLabel: standard letter vs custom labels
  console.log('Test 6: normalizeSizeLabel validation');
  assert.strictEqual(normalizeSizeLabel('xxl'), 'XXL');
  assert.strictEqual(normalizeSizeLabel('Xxl'), 'XXL');
  assert.strictEqual(normalizeSizeLabel('XXL'), 'XXL');
  assert.strictEqual(normalizeSizeLabel('xs'), 'XS');
  assert.strictEqual(normalizeSizeLabel('all size'), 'All Size');
  assert.strictEqual(normalizeSizeLabel('ALL SIZE'), 'All Size');
  assert.strictEqual(normalizeSizeLabel('Free Size'), 'Free Size');
  assert.strictEqual(normalizeSizeLabel('free size'), 'Free Size');
  assert.strictEqual(normalizeSizeLabel('FREE SIZE'), 'Free Size');
  assert.strictEqual(normalizeSizeLabel('custom size'), 'Custom Size');
  // Pastikan label kustom tidak diubah menjadi all-caps
  assert.strictEqual(normalizeSizeLabel('Batik Jumbo'), 'Batik Jumbo');
  assert.strictEqual(normalizeSizeLabel('batik jumbo'), 'batik jumbo');
  assert.strictEqual(normalizeSizeLabel('30'), '30');

  // 7. Test deduplication across case variations
  console.log('Test 7: Deduplication with mixed case variations');
  const t7a = sortSizes(['xxl', 'XXL', 'Xxl', 's', 'S']);
  console.log('Test 7a result (xxl, XXL, Xxl, s, S):', t7a);
  assert.deepStrictEqual(t7a, ['S', 'XXL']);

  const t7b = sortSizes(['Batik Jumbo', 'batik jumbo']);
  console.log('Test 7b result (Batik Jumbo deduplication):', t7b);
  assert.deepStrictEqual(t7b, ['Batik Jumbo']);

  console.log('All 7 size unit tests PASSED successfully using actual src/lib/sizes.js!');
}

runSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
