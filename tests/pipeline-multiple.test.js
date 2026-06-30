const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { runPipeline } = require('../src/index');

const runTests = async () => {
  const csvPath = path.resolve(__dirname, '..', 'input', 'multi.csv');
  const outPath = path.resolve(__dirname, '..', 'output', 'multi-result.json');

  const csvContent = `name,email,phone\nJohn,john@gmail.com,9876543210\nJane,jane@gmail.com,9988776655\n`;
  fs.writeFileSync(csvPath, csvContent, 'utf8');

  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

  const results = await runPipeline({
    csvPath,
    resumePath: null,
    configPath: path.resolve(__dirname, '..', 'config', 'default-config.json'),
    outputPath: outPath,
  });

  assert.ok(Array.isArray(results));
  assert.strictEqual(results.length, 2);
  assert.ok(results[0].candidate_id);
  assert.ok(results[1].candidate_id);
  assert.ok(fs.existsSync(outPath));

  fs.unlinkSync(csvPath);
  fs.unlinkSync(outPath);

  console.log('pipeline multiple candidates test passed');
};

if (require.main === module) {
  runTests().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = runTests;
