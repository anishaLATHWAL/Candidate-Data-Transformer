const assert = require('assert');
const { runPipeline } = require('../src/index');
const path = require('path');

const run = async () => {
  const results = await runPipeline({
    csvPath: path.resolve('input', 'recruiter.csv'),
    resumePath: path.resolve('input', 'resume.txt'),
    configPath: path.resolve('config', 'default-config.json'),
    outputPath: null,
  });

  assert.ok(Array.isArray(results));
  assert.ok(results.length >= 1);
  const first = results[0];
  assert.deepStrictEqual(first.location, {
    city: 'Bangalore',
    region: 'Karnataka',
    country: 'India',
  });
  assert.deepStrictEqual(first.education, [
    {
      institution: 'ABC University',
      degree: 'Bachelor of Technology',
      field: 'Computer Science and Engineering',
      end_year: '2022',
    },
  ]);
  assert.strictEqual(typeof first.years_experience, 'number');
  assert.ok(first.years_experience >= 0);
  results.forEach((r) => {
    assert.ok(r.location && typeof r.location === 'object');
    assert.notStrictEqual(r.location.city, '[object Object]');
  });
  console.log('location-regression test passed');
};

if (require.main === module) {
  run().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = run;
