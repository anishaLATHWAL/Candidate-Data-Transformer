const assert = require('assert');
const { normalizePhones } = require('../src/normalizers/phoneNormalizer');

const runTests = () => {
  assert.deepStrictEqual(normalizePhones(['9876543210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones(['+91 9876543210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones(['91-9876543210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones(['(98765)43210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones(['09876543210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones(['12345', 'abcdef', null, undefined, '']), []);
  assert.deepStrictEqual(normalizePhones(['+12025550123', '12025550123']), ['+12025550123']);
  assert.deepStrictEqual(normalizePhones(['+919876543210', '+91-9876543210']), ['+919876543210']);
  assert.deepStrictEqual(normalizePhones([]), []);
  assert.deepStrictEqual(normalizePhones(null), []);
  assert.deepStrictEqual(normalizePhones(undefined), []);

  console.log('phoneNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
