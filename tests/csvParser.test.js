const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { parseCSV } = require('../src/parsers/csvParser');

const runTests = async () => {
  const csvPath = path.resolve(__dirname, 'tmp.csv');
  const csv = 'name,emails,phones,skills\nJohn,"john@gmail.com;john.work@gmail.com","9876543210; +91 9988776655","Node.js,React,C++"\n';
  fs.writeFileSync(csvPath, csv, 'utf8');

  const rows = await parseCSV(csvPath);
  fs.unlinkSync(csvPath);

  assert.ok(Array.isArray(rows));
  assert.strictEqual(rows.length, 1);
  const r = rows[0];
  assert.deepStrictEqual(r.emails, ['john@gmail.com', 'john.work@gmail.com']);
  assert.deepStrictEqual(r.skills, ['Node.js', 'React', 'C++']);
  assert.deepStrictEqual(r.phones, ['9876543210', '+91 9988776655']);

  console.log('csvParser tests passed');
};

if (require.main === module) {
  runTests().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = runTests;
