const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { runPipeline } = require('../src/index');

const runTests = async () => {
  const outPath = path.resolve(__dirname, '..', 'output', 'result.json');
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

  const projected = await runPipeline({
    csvPath: null,
    resumePath: path.resolve(__dirname, '..', 'input', 'resume.txt'),
    configPath: path.resolve(__dirname, '..', 'config', 'default-config.json'),
    outputPath: outPath,
  });

  assert.ok(projected);
  assert.ok(projected.full_name || projected.name || projected.candidate_id);
  assert.ok(fs.existsSync(outPath));

  console.log('pipeline test passed');
};

if (require.main === module) {
  runTests().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = runTests;
