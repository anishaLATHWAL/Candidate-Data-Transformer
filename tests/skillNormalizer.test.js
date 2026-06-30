const assert = require('assert');
const { normalizeSkills } = require('../src/normalizers/skillNormalizer');

const runTests = () => {
  assert.deepStrictEqual(normalizeSkills(['cpp', 'js', 'nodejs', 'reactjs', 'py', 'ts', 'mongodb']), [
    'C++',
    'JavaScript',
    'MongoDB',
    'Node.js',
    'Python',
    'React',
    'TypeScript',
  ]);

  assert.deepStrictEqual(normalizeSkills(['C PLUS PLUS', ' javascript ', 'Js', 'reactjs', 'reactjs']), [
    'C++',
    'JavaScript',
    'React',
  ]);

  assert.deepStrictEqual(normalizeSkills(['', null, undefined, '  ']), []);
  assert.deepStrictEqual(normalizeSkills(null), []);
  assert.deepStrictEqual(normalizeSkills(undefined), []);

  console.log('skillNormalizer tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
