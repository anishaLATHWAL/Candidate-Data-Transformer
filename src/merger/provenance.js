const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const buildProvenance = (csvCandidate, resumeCandidate, canonicalCandidate) => {
  try {
    const csvData = csvCandidate && typeof csvCandidate === 'object' ? csvCandidate : {};
    const resumeData = resumeCandidate && typeof resumeCandidate === 'object' ? resumeCandidate : {};
    const canonical = canonicalCandidate && typeof canonicalCandidate === 'object' ? canonicalCandidate : {};

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

    const provenance = [];

    const hasSource = (sourceValue) => !isEmptyValue(sourceValue);

    for (const field of fields) {
      if (isEmptyValue(canonical[field])) {
        continue;
      }

      const csvHas = hasSource(csvData[field]);
      const resumeHas = hasSource(resumeData[field]);

      if (resumeHas) {
        provenance.push({ field, source: 'resume', method: 'regex' });
      }
      if (csvHas) {
        provenance.push({ field, source: 'csv', method: 'csv column' });
      }
    }

    return provenance;
  } catch (err) {
    return [];
  }
};

module.exports = {
  buildProvenance,
};
