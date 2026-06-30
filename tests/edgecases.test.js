const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseCSV } = require('../src/parsers/csvParser');
const { parseResume } = require('../src/parsers/resumeParser');
const { normalizeEmails } = require('../src/normalizers/emailNormalizer');
const { normalizePhones } = require('../src/normalizers/phoneNormalizer');
const { normalizeSkills } = require('../src/normalizers/skillNormalizer');
const { runPipeline } = require('../src/index');

const tmp = (p) => path.resolve(__dirname, p);

const runTests = async () => {
  // Empty CSV
  const emptyCsv = tmp('empty.csv');
  fs.writeFileSync(emptyCsv, '', 'utf8');
  const rowsEmpty = await parseCSV(emptyCsv);
  assert.deepStrictEqual(rowsEmpty, []);
  fs.unlinkSync(emptyCsv);

  // Empty resume
  const emptyRes = tmp('empty_resume.txt');
  fs.writeFileSync(emptyRes, '', 'utf8');
  const parsedEmptyResume = await parseResume(emptyRes);
  assert.strictEqual(parsedEmptyResume.full_name, null);
  fs.unlinkSync(emptyRes);

  // Malformed CSV (unclosed quote)
  const badCsv = tmp('bad.csv');
  fs.writeFileSync(badCsv, 'name,email\n"Bad User,bad@example.com\n', 'utf8');
  const badRows = await parseCSV(badCsv);
  // malformed CSV should not crash parser; accept array result (may be empty or contain recovered rows)
  assert.ok(Array.isArray(badRows));
  fs.unlinkSync(badCsv);

  // Duplicate emails
  assert.deepStrictEqual(normalizeEmails(['A@X.com', 'a@x.com', 'invalid', '']), ['a@x.com']);

  // Duplicate phones
  const phones = normalizePhones(['9876543210', '09876543210', '+919876543210']);
  assert.deepStrictEqual(phones, ['+919876543210']);

  // Duplicate skills
  assert.deepStrictEqual(normalizeSkills(['js', 'JavaScript', 'JS', 'reactjs']), ['JavaScript', 'React']);

  // Invalid email ignored
  assert.deepStrictEqual(normalizeEmails(['not-an-email']), []);

  // Invalid phone ignored
  assert.deepStrictEqual(normalizePhones(['abc', '12345']), []);

  // Missing config for pipeline -> should throw
  let threw = false;
  try {
    await runPipeline({ csvPath: null, resumePath: null, configPath: null, outputPath: null });
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, true);

  // Missing output folder -> should not throw, file not created
  const csvPath = tmp('one.csv');
  fs.writeFileSync(csvPath, 'name,email,phone\nJohn,john@example.com,9876543210\n', 'utf8');
  const outPath = path.resolve('nonexistent_dir', 'out.json');
  let res = null;
  try {
    res = await runPipeline({ csvPath, resumePath: null, configPath: path.resolve('config', 'default-config.json'), outputPath: outPath });
  } catch (err) {
    // should not throw
    assert.fail('Pipeline threw when output folder missing');
  }
  assert.ok(Array.isArray(res));
  // file should not exist
  assert.strictEqual(fs.existsSync(outPath), false);
  fs.unlinkSync(csvPath);

  // Large CSV (200 rows)
  const large = tmp('large.csv');
  const lines = ['name,email,phone,skills'];
  for (let i = 0; i < 200; i++) {
    lines.push(`User${i},user${i}@example.com,987650000${i % 1000},JS,Node`);
  }
  fs.writeFileSync(large, lines.join('\n'), 'utf8');
  const many = await parseCSV(large);
  assert.strictEqual(many.length, 200);
  fs.unlinkSync(large);

  // Only resume
  const resumeFile = tmp('only_resume.txt');
  fs.writeFileSync(resumeFile, 'Solo User\nEngineer\nEmail: solo@example.com\n', 'utf8');
  const out1 = await runPipeline({ csvPath: null, resumePath: resumeFile, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.ok(Array.isArray(out1));
  assert.strictEqual(out1.length, 1);
  fs.unlinkSync(resumeFile);

  // Only CSV
  const csvOnly = tmp('only.csv');
  fs.writeFileSync(csvOnly, 'name,email,phone\nOne,one@example.com,9876543210\nTwo,two@example.com,9876543211\n', 'utf8');
  const out2 = await runPipeline({ csvPath: csvOnly, resumePath: null, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
  assert.ok(Array.isArray(out2));
  assert.strictEqual(out2.length, 2);
  fs.unlinkSync(csvOnly);

  // Blank lines and extra columns
  const extras = tmp('extras.csv');
  fs.writeFileSync(extras, 'name,email,phone,extra\n\nA,a@a.com,9876,foo\n', 'utf8');
  const e = await parseCSV(extras);
  assert.strictEqual(e.length, 1);
  fs.unlinkSync(extras);

  // Unicode names
  const uni = tmp('uni.csv');
  fs.writeFileSync(uni, 'name,email\nJosé,jose@example.com\n', 'utf8');
  const u = await parseCSV(uni);
  assert.strictEqual(u[0].name, 'José');
  fs.unlinkSync(uni);

  // Whitespace-only values
  const ws = tmp('ws.csv');
  fs.writeFileSync(ws, 'name,email\n"   ","   "\n', 'utf8');
  const w = await parseCSV(ws);
  assert.strictEqual(w.length, 0);
  fs.unlinkSync(ws);

  console.log('edgecase tests passed');
};

if (require.main === module) {
  runTests().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = runTests;
