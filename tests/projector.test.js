const assert = require('assert');
const { projectCandidate } = require('../src/projector/projector');

const runTests = () => {
  const canonical = {
    candidate_id: '123',
    full_name: 'Jane Doe',
    emails: ['jane@example.com'],
    phones: ['+919876543210'],
    location: { city: 'Bangalore', region: null, country: 'India' },
    headline: 'Senior Recruiter',
    skills: ['JavaScript'],
    experience: [{ company: 'Beta' }],
    education: [{ institution: 'Institute' }],
    current_company: 'Beta',
    _confidence: { fieldConfidence: { full_name: 0.9 }, overallConfidence: 0.9 },
    _provenance: [{ field: 'full_name', source: 'resume', method: 'regex' }],
  };

  const config = {
    fields: [
      { path: 'name', from: 'full_name' },
      { path: 'emails' },
      { path: 'country', from: 'location.country' },
      { path: 'headline' },
      { path: 'missing_field' },
    ],
    include_confidence: true,
    include_provenance: true,
    on_missing: 'null',
  };

  const projected = projectCandidate(canonical, config);
  assert.deepStrictEqual(projected, {
    name: 'Jane Doe',
    emails: ['jane@example.com'],
    country: 'India',
    headline: 'Senior Recruiter',
    missing_field: null,
    confidence: { fieldConfidence: { full_name: 0.9 }, overallConfidence: 0.9 },
    provenance: [{ field: 'full_name', source: 'resume', method: 'regex' }],
  });

  const nullConfig = projectCandidate(canonical, null);
  assert.deepStrictEqual(nullConfig, {});

  const omitConfig = {
    fields: [
      { path: 'name', from: 'full_name' },
      { path: 'missing_field' },
    ],
    include_confidence: false,
    include_provenance: false,
    on_missing: 'omit',
  };
  const omitted = projectCandidate(canonical, omitConfig);
  assert.deepStrictEqual(omitted, { name: 'Jane Doe' });

  const errorConfig = {
    fields: [
      { path: 'name', from: 'full_name' },
      { path: 'missing_field' },
    ],
    include_confidence: false,
    include_provenance: false,
    on_missing: 'error',
  };
  const errored = projectCandidate(canonical, errorConfig);
  assert.deepStrictEqual(errored, { name: 'Jane Doe', missing_field: null, errors: ['Missing value for field missing_field'] });

  console.log('projector tests passed');
};

if (require.main === module) {
  runTests();
}

module.exports = runTests;
