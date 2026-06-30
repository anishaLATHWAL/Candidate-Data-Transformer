const { normalizeEmails } = require('../normalizers/emailNormalizer');
const { normalizePhones } = require('../normalizers/phoneNormalizer');
const { normalizeName } = require('../normalizers/nameNormalizer');

const extractValuesByKeyHint = (row, hintRegex) => {
  if (!row || typeof row !== 'object') return [];
  const values = [];
  Object.keys(row).forEach((k) => {
    if (hintRegex.test(k.toLowerCase())) {
      const v = row[k];
      if (Array.isArray(v)) values.push(...v);
      else if (v !== undefined && v !== null && String(v).trim()) values.push(String(v).trim());
    }
  });
  return values;
};

const matchByEmail = (row, resume) => {
  const rowEmails = normalizeEmails(extractValuesByKeyHint(row, /email/));
  const resumeEmails = normalizeEmails(resume && resume.emails ? resume.emails : []);
  if (!rowEmails.length || !resumeEmails.length) return false;
  const set = new Set(resumeEmails.map((e) => e.toLowerCase()));
  return rowEmails.some((e) => set.has(e.toLowerCase()));
};

const matchByPhone = (row, resume) => {
  const rowPhones = normalizePhones(extractValuesByKeyHint(row, /phone/));
  const resumePhones = normalizePhones(resume && resume.phones ? resume.phones : []);
  if (!rowPhones.length || !resumePhones.length) return false;
  const set = new Set(resumePhones.map((p) => p));
  return rowPhones.some((p) => set.has(p));
};

const matchByName = (row, resume) => {
  const nameCandidates = extractValuesByKeyHint(row, /name/);
  if (!nameCandidates.length || !resume || !resume.full_name) return false;
  const resumeName = normalizeName(resume.full_name || '');
  if (!resumeName) return false;
  return nameCandidates.map(normalizeName).some((n) => n && n.toLowerCase() === resumeName.toLowerCase());
};

const matchResumeToRow = (row, resume) => {
  try {
    if (!row || !resume) return null;
    if (matchByEmail(row, resume)) return resume;
    if (matchByPhone(row, resume)) return resume;
    if (matchByName(row, resume)) return resume;
    return null;
  } catch (err) {
    return null;
  }
};

module.exports = {
  matchResumeToRow,
  // exposed for testing
  _private: { extractValuesByKeyHint, matchByEmail, matchByPhone, matchByName },
};
