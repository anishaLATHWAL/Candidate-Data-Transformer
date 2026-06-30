const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const calculateFieldConfidence = (source) => {
  switch (source) {
    case 'resume':
      return 0.9;
    case 'csv':
      return 0.8;
    case 'both':
      return 1.0;
    case 'conflict':
      return 0.7;
    default:
      return 0;
  }
};

const calculateConfidence = (canonicalCandidate) => {
  try {
    if (!canonicalCandidate || typeof canonicalCandidate !== 'object') {
      return { fieldConfidence: {}, overallConfidence: 0 };
    }

    const fields = [
      'full_name',
      'emails',
      'phones',
      'location',
      'headline',
      'skills',
      'experience',
      'education',
      'current_company',
    ];

    const fieldConfidence = {};
    let total = 0;
    let count = 0;

    const sources = canonicalCandidate._fieldSources || {};

    for (const field of fields) {
      const value = canonicalCandidate[field];
      const source = sources[field] || null;
      const confidence = calculateFieldConfidence(source);
      if (!isEmptyValue(value)) {
        total += confidence;
        count += 1;
      }
      fieldConfidence[field] = confidence;
    }

    const overallConfidence = count > 0 ? Number((total / count).toFixed(2)) : 0;
    return { fieldConfidence, overallConfidence };
  } catch (err) {
    return { fieldConfidence: {}, overallConfidence: 0 };
  }
};

module.exports = {
  calculateConfidence,
};
