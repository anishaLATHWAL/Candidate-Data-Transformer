const assert = require('assert');
const { mergeCandidate } = require('../src/merger/mergeCandidate');

const dummyCsv = {
  full_name: 'Jane Doe',
  emails: ['JANE@EXAMPLE.COM', 'jane@example.com'],
  phones: ['9876543210', '09876543210'],
  location: 'Bangalore, Karnataka, India',
  headline: 'Recruiter',
  skills: ['js', 'ReactJS'],
  experience: [{ company: 'Acme', title: 'HR' }],
  education: [{ institution: 'University' }],
  current_company: 'Acme',
};

const dummyResume = {
  full_name: 'Jane A. Doe',
  emails: ['jane@example.com', 'jane.a@example.com'],
  phones: ['+91 9876543210'],
  location: 'Bangalore, India',
  headline: 'Senior Recruiter',
  skills: ['JavaScript', 'nodejs'],
  experience: [{ company: 'Beta', title: 'Lead' }],
  education: [{ institution: 'Institute' }],
  current_company: 'Beta',
};

const runTests = () => {
  const merged = mergeCandidate(dummyCsv, dummyResume);
  assert.strictEqual(merged.full_name, 'Jane A. Doe');
  assert.deepStrictEqual(merged.emails, ['jane@example.com', 'jane.a@example.com']);
  assert.deepStrictEqual(merged.phones, ['+919876543210']);
  assert.deepStrictEqual(merged.location, { city: 'Bangalore', region: null, country: 'India' });
  assert.strictEqual(merged.headline, 'Senior Recruiter');
  assert.deepStrictEqual(merged.skills, ['JavaScript', 'Node.js', 'React']);
  assert.strictEqual(merged.current_company, 'Beta');
  assert.ok(merged.candidate_id.length > 0);

  const missingCsv = mergeCandidate(null, dummyResume);
  assert.strictEqual(missingCsv.full_name, 'Jane A. Doe');
  assert.deepStrictEqual(missingCsv.emails, ['jane@example.com', 'jane.a@example.com']);

  const missingResume = mergeCandidate(dummyCsv, null);
  assert.strictEqual(missingResume.full_name, 'Jane Doe');
  assert.deepStrictEqual(missingResume.emails, ['jane@example.com']);
  assert.deepStrictEqual(missingResume.phones, ['+919876543210']);

  const emptyBoth = mergeCandidate({}, {});
  assert.strictEqual(emptyBoth.full_name, null);
  assert.deepStrictEqual(emptyBoth.emails, []);
  assert.deepStrictEqual(emptyBoth.location, { city: null, region: null, country: null });

  console.log('mergeCandidate tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
