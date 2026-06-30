const assert = require('assert');
const { normalizeName } = require('../src/normalizers/nameNormalizer');

const runTests = () => {
  assert.strictEqual(normalizeName(' john   DOE '), 'John Doe');
  assert.strictEqual(normalizeName('ANISHA LATHWAL'), 'Anisha Lathwal');
  assert.strictEqual(normalizeName("  mary-jane  o'connor "), "Mary-jane O'connor");
  assert.strictEqual(normalizeName('   '), null);
  assert.strictEqual(normalizeName(null), null);
  assert.strictEqual(normalizeName(undefined), null);

  console.log('nameNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
