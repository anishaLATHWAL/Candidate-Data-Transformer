const assert = require('assert');
const { normalizeLocation } = require('../src/normalizers/locationNormalizer');

const runTests = () => {
  assert.deepStrictEqual(normalizeLocation('Bangalore, Karnataka, India'), {
    city: 'Bangalore',
    region: 'Karnataka',
    country: 'India',
  });

  assert.deepStrictEqual(normalizeLocation('Paris, France'), {
    city: 'Paris',
    region: null,
    country: 'France',
  });

  assert.deepStrictEqual(normalizeLocation('Berlin'), {
    city: 'Berlin',
    region: null,
    country: null,
  });

  assert.deepStrictEqual(normalizeLocation('India'), {
    city: null,
    region: null,
    country: 'India',
  });

  assert.deepStrictEqual(normalizeLocation('  New York  ,  USA  '), {
    city: 'New York',
    region: null,
    country: 'USA',
  });

  assert.deepStrictEqual(normalizeLocation(null), {
    city: null,
    region: null,
    country: null,
  });

  console.log('locationNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
