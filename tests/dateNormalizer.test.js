const assert = require('assert');
const { normalizeDate } = require('../src/normalizers/dateNormalizer');

const runTests = () => {
  assert.strictEqual(normalizeDate('Jan 2024'), '2024-01');
  assert.strictEqual(normalizeDate('January 2024'), '2024-01');
  assert.strictEqual(normalizeDate('2024-01'), '2024-01');
  assert.strictEqual(normalizeDate('2024'), '2024-01');
  assert.strictEqual(normalizeDate('Present'), 'Present');
  assert.strictEqual(normalizeDate('Current'), 'Present');
  assert.strictEqual(normalizeDate('Unknown'), null);
  assert.strictEqual(normalizeDate(''), null);
  assert.strictEqual(normalizeDate(null), null);
  assert.strictEqual(normalizeDate(undefined), null);

  console.log('dateNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
