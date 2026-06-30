const assert = require('assert');
const { buildProvenance } = require('../src/merger/provenance');

const runTests = () => {
  const csvCandidate = {
    full_name: 'Jane Doe',
    emails: ['jane@example.com'],
    phones: ['9876543210'],
    location: 'Bangalore, India',
    headline: 'Recruiter',
    skills: ['js'],
    experience: [{ company: 'Acme' }],
    education: [{ institution: 'University' }],
    current_company: 'Acme',
  };

  const resumeCandidate = {
    full_name: 'Jane A. Doe',
    emails: ['jane@example.com', 'jane.a@example.com'],
    phones: ['+91 9876543210'],
    location: 'Bangalore, India',
    headline: 'Senior Recruiter',
    skills: ['JavaScript'],
    experience: [{ company: 'Beta' }],
    education: [{ institution: 'Institute' }],
    current_company: 'Beta',
  };

  const canonical = {
    full_name: 'Jane A. Doe',
    emails: ['jane@example.com', 'jane.a@example.com'],
    phones: ['+919876543210'],
    location: { city: 'Bangalore', region: null, country: 'India' },
    headline: 'Senior Recruiter',
    skills: ['JavaScript', 'Node.js'],
    experience: [{ company: 'Beta' }],
    education: [{ institution: 'Institute' }],
    current_company: 'Beta',
  };

  const result = buildProvenance(csvCandidate, resumeCandidate, canonical);

  assert.deepStrictEqual(result, [
    { field: 'full_name', source: 'resume', method: 'regex' },
    { field: 'full_name', source: 'csv', method: 'csv column' },
    { field: 'emails', source: 'resume', method: 'regex' },
    { field: 'emails', source: 'csv', method: 'csv column' },
    { field: 'phones', source: 'resume', method: 'regex' },
    { field: 'phones', source: 'csv', method: 'csv column' },
    { field: 'location', source: 'resume', method: 'regex' },
    { field: 'location', source: 'csv', method: 'csv column' },
    { field: 'headline', source: 'resume', method: 'regex' },
    { field: 'headline', source: 'csv', method: 'csv column' },
    { field: 'skills', source: 'resume', method: 'regex' },
    { field: 'skills', source: 'csv', method: 'csv column' },
    { field: 'experience', source: 'resume', method: 'regex' },
    { field: 'experience', source: 'csv', method: 'csv column' },
    { field: 'education', source: 'resume', method: 'regex' },
    { field: 'education', source: 'csv', method: 'csv column' },
    { field: 'current_company', source: 'resume', method: 'regex' },
    { field: 'current_company', source: 'csv', method: 'csv column' },
  ]);

  assert.deepStrictEqual(buildProvenance(null, null, {}), []);

  console.log('provenance tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
