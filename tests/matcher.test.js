const assert = require('assert');
const { matchResumeToRow, _private } = require('../src/utils/matcher');

const sampleResume = {
  full_name: 'Alice Johnson',
  emails: ['alice@example.com'],
  phones: ['+919876543210'],
};

const csvRowEmail = { email: 'alice@example.com' };
const csvRowPhone = { phone: '+91-9876543210' };
const csvRowName = { full_name: 'Alice Johnson' };
const csvRowNone = { name: 'Someone Else', email: 'other@example.com' };

assert.strictEqual(_private.matchByEmail(csvRowEmail, sampleResume), true);
assert.strictEqual(_private.matchByPhone(csvRowPhone, sampleResume), true);
assert.strictEqual(_private.matchByName(csvRowName, sampleResume), true);
assert.strictEqual(matchResumeToRow(csvRowEmail, sampleResume), sampleResume);
assert.strictEqual(matchResumeToRow(csvRowPhone, sampleResume), sampleResume);
assert.strictEqual(matchResumeToRow(csvRowName, sampleResume), sampleResume);
assert.strictEqual(matchResumeToRow(csvRowNone, sampleResume), null);

console.log('matcher tests passed');
