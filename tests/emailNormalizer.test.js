const assert = require('assert');
const { normalizeEmails } = require('../src/normalizers/emailNormalizer');

const runTests = () => {
  assert.deepStrictEqual(
    normalizeEmails([' JOHN@gmail.com ', 'john@gmail.com', 'abc', '', null]),
    ['john@gmail.com']
  );

  assert.deepStrictEqual(normalizeEmails(['TEST@EXAMPLE.COM', 'test@example.com']), ['test@example.com']);
  assert.deepStrictEqual(normalizeEmails(['  a@b.com  ', 'A@B.COM']), ['a@b.com']);
  assert.deepStrictEqual(normalizeEmails(['invalid', 'no-at-sign', 'john@domain']), []);
  assert.deepStrictEqual(normalizeEmails([]), []);
  assert.deepStrictEqual(normalizeEmails(null), []);
  assert.deepStrictEqual(normalizeEmails(undefined), []);

  console.log('emailNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
