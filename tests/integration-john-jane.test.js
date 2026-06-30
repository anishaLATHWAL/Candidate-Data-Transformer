const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('../src/index');

const run = async () => {
  const csvPath = path.resolve(__dirname, 'john_jane.csv');
  const resumePath = path.resolve(__dirname, 'john_resume.txt');

  // Create CSV with two candidates: John and Jane
  fs.writeFileSync(csvPath, 'full_name,email,phone\nJohn,john@gmail.com,9876500000\nJane,jane@gmail.com,9876500001\n', 'utf8');

  // Create resume that belongs only to John
  fs.writeFileSync(resumePath, 'John\nSenior Engineer\nEmail: john@gmail.com\nPhone: 9876500000\nSkills: Node.js\n', 'utf8');

  const results = await runPipeline({ csvPath, resumePath, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.ok(Array.isArray(results));
  assert.strictEqual(results.length, 2);

  const john = results.find((r) => r.emails && r.emails.includes('john@gmail.com'));
  const jane = results.find((r) => r.emails && r.emails.includes('jane@gmail.com'));
  assert.ok(john, 'John should be present');
  assert.ok(jane, 'Jane should be present');

  const johnProvFields = john.provenance.map((p) => `${p.field}:${p.source}`);
  assert.ok(johnProvFields.some((s) => s.startsWith('full_name:resume') || s.startsWith('emails:resume')), 'John should have resume provenance');

  const janeHasResume = jane.provenance.some((p) => p.source === 'resume');
  assert.strictEqual(janeHasResume, false, 'Jane should not be merged with resume');

  const validate = require('../src/validator/validator').validateOutput;
  validate(john, require(path.resolve('config', 'default-config.json')));
  validate(jane, require(path.resolve('config', 'default-config.json')));

  fs.unlinkSync(csvPath);
  fs.unlinkSync(resumePath);

  console.log('integration john-jane test passed');
};

if (require.main === module) {
  run().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = run;
