const assert = require('assert');
const { calculateConfidence } = require('../src/merger/confidence');

const runTests = () => {
  const candidate = {
    full_name: 'Jane Doe',
    emails: ['jane@example.com'],
    phones: ['+919876543210'],
    location: { city: 'Bangalore', region: null, country: 'India' },
    headline: 'Senior Recruiter',
    skills: ['JavaScript'],
    experience: [{ company: 'Beta', title: 'Lead' }],
    education: [{ institution: 'Institute' }],
    current_company: 'Beta',
    _fieldSources: {
      full_name: 'resume',
      emails: 'both',
      phones: 'csv',
      location: 'conflict',
      headline: 'resume',
      skills: 'both',
      experience: 'resume',
      education: 'csv',
      current_company: 'resume',
    },
  };

  const result = calculateConfidence(candidate);
  assert.deepStrictEqual(result.fieldConfidence, {
    full_name: 0.9,
    emails: 1.0,
    phones: 0.8,
    location: 0.7,
    headline: 0.9,
    skills: 1.0,
    experience: 0.9,
    education: 0.8,
    current_company: 0.9,
  });
  assert.strictEqual(result.overallConfidence, 0.88);

  assert.deepStrictEqual(calculateConfidence(null), { fieldConfidence: {}, overallConfidence: 0 });
  assert.deepStrictEqual(calculateConfidence({}), {
    fieldConfidence: {
      full_name: 0,
      emails: 0,
      phones: 0,
      location: 0,
      headline: 0,
      skills: 0,
      experience: 0,
      education: 0,
      current_company: 0,
    },
    overallConfidence: 0,
  });

  console.log('confidence tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
