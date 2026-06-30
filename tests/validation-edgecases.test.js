const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('../src/index');
const { validateOutput } = require('../src/validator/validator');

const tmp = (p) => path.resolve(__dirname, p);

const run = async () => {
  // Candidate without email (has phone)
  const csvNoEmail = tmp('no_email.csv');
  fs.writeFileSync(csvNoEmail, 'full_name,phone\nNoEmail,9876543210\n', 'utf8');
  const res1 = await runPipeline({ csvPath: csvNoEmail, resumePath: null, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.strictEqual(res1.length, 1);
  // validateOutput should throw for missing required email
  let threw = false;
  try {
    validateOutput(res1[0], require(path.resolve('config', 'default-config.json')));
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, true);
  fs.unlinkSync(csvNoEmail);

  // Candidate without phone (phone optional)
  const csvNoPhone = tmp('no_phone.csv');
  fs.writeFileSync(csvNoPhone, 'full_name,email\nNoPhone,no.phone@example.com\n', 'utf8');
  const res2 = await runPipeline({ csvPath: csvNoPhone, resumePath: null, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.strictEqual(res2.length, 1);
  // validateOutput should NOT throw (phone optional)
  validateOutput(res2[0], require(path.resolve('config', 'default-config.json')));
  fs.unlinkSync(csvNoPhone);

  // Candidate with only name (no email, no phone)
  const csvOnlyName = tmp('only_name.csv');
  fs.writeFileSync(csvOnlyName, 'full_name\nOnlyName\n', 'utf8');
  const res3 = await runPipeline({ csvPath: csvOnlyName, resumePath: null, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.strictEqual(res3.length, 1);
  let threw2 = false;
  try {
    validateOutput(res3[0], require(path.resolve('config', 'default-config.json')));
  } catch (err) {
    threw2 = true;
  }
  assert.strictEqual(threw2, true);
  fs.unlinkSync(csvOnlyName);

  console.log('validation-edgecases tests passed');
};

if (require.main === module) {
  run().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = run;
