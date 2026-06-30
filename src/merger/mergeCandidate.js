const { v4: uuidv4 } = require('uuid');
const { normalizeName } = require('../normalizers/nameNormalizer');
const { normalizeEmails } = require('../normalizers/emailNormalizer');
const { normalizePhones } = require('../normalizers/phoneNormalizer');
const { normalizeLocation } = require('../normalizers/locationNormalizer');
const { normalizeSkills } = require('../normalizers/skillNormalizer');

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const mergeArrays = (a, b) => {
  const values = [];
  const seen = new Set();
  for (const item of (a || [])) {
    if (item === undefined || item === null) continue;
    const normalized = typeof item === 'string' ? item.trim() : item;
    if (normalized === '' || seen.has(normalized)) continue;
    seen.add(normalized);
    values.push(normalized);
  }
  for (const item of (b || [])) {
    if (item === undefined || item === null) continue;
    const normalized = typeof item === 'string' ? item.trim() : item;
    if (normalized === '' || seen.has(normalized)) continue;
    seen.add(normalized);
    values.push(normalized);
  }
  return values;
};

const deepEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (err) {
    return false;
  }
};

const parseExperienceDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase();
  if (/^(present|current|ongoing)$/.test(cleaned)) {
    return new Date();
  }
  const monthYearMatch = cleaned.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/i);
  if (monthYearMatch) {
    const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(monthYearMatch[1].toLowerCase());
    return new Date(Number(monthYearMatch[2]), month, 1);
  }
  const yearMatch = cleaned.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(Number(yearMatch[1]), 0, 1);
  }
  return null;
};

const calculateYearsExperience = (experience) => {
  if (!Array.isArray(experience) || experience.length === 0) return null;
  const starts = experience
    .map((item) => item && item.start)
    .filter(Boolean)
    .map(parseExperienceDate)
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
  if (!starts.length) return null;
  const ends = experience
    .map((item) => item && item.end)
    .filter(Boolean)
    .map(parseExperienceDate)
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
  const earliestStart = new Date(Math.min(...starts.map((d) => d.getTime())));
  const latestEnd = ends.length > 0 ? new Date(Math.max(...ends.map((d) => d.getTime()))) : new Date();
  const endDate = latestEnd > new Date() ? new Date() : latestEnd;
  const years = endDate.getFullYear() - earliestStart.getFullYear();
  const monthDiff = endDate.getMonth() - earliestStart.getMonth();
  return monthDiff < 0 ? years - 1 : years;
};

const mergeLinks = (csvLinks, resumeLinks) => {
  const normalizeLinks = (links) => {
    if (!links || typeof links !== 'object' || Array.isArray(links)) return {};
    return links;
  };

  const csv = normalizeLinks(csvLinks);
  const resume = normalizeLinks(resumeLinks);

  return {
    linkedin: pickField(resume.linkedin, csv.linkedin) || null,
    github: pickField(resume.github, csv.github) || null,
    portfolio: pickField(resume.portfolio, csv.portfolio) || null,
    other: mergeArrays(csv.other || [], resume.other || []),
  };
};

const fieldSource = (resumeValue, csvValue, options = {}) => {
  const resumeEmpty = isEmptyValue(resumeValue);
  const csvEmpty = isEmptyValue(csvValue);

  if (!resumeEmpty && !csvEmpty) {
    if (options.compare && deepEqual(resumeValue, csvValue)) {
      return 'both';
    }
    if (options.treatArrayAsBoth && Array.isArray(resumeValue) && Array.isArray(csvValue)) {
      return 'both';
    }
    return 'conflict';
  }

  if (!resumeEmpty) return 'resume';
  if (!csvEmpty) return 'csv';
  return null;
};

const pickField = (resumeValue, csvValue) => {
  const resumeEmpty = isEmptyValue(resumeValue);
  const csvEmpty = isEmptyValue(csvValue);

  if (!resumeEmpty) return resumeValue;
  if (!csvEmpty) return csvValue;
  return null;
};

const mergeCandidate = (csvCandidate, resumeCandidate) => {
  try {
    const csvDataRaw = csvCandidate && typeof csvCandidate === 'object' ? csvCandidate : {};
    // normalize common singular/plural CSV column names to expected canonical keys
    const csvData = Object.assign({}, csvDataRaw);
    if (csvData.email && !csvData.emails) {
      csvData.emails = Array.isArray(csvData.email) ? csvData.email : [csvData.email];
    }
    if (csvData.phone && !csvData.phones) {
      csvData.phones = Array.isArray(csvData.phone) ? csvData.phone : [csvData.phone];
    }
    if (csvData.name && !csvData.full_name) {
      csvData.full_name = csvData.name;
    }
    if (csvData.skill && !csvData.skills) {
      csvData.skills = Array.isArray(csvData.skill) ? csvData.skill : [csvData.skill];
    }
    const resumeData = resumeCandidate && typeof resumeCandidate === 'object' ? resumeCandidate : {};

    const fullNameRaw = pickField(resumeData.full_name, csvData.full_name);
    const normalizedName = normalizeName(fullNameRaw);
    const fullNameSource = fieldSource(resumeData.full_name, csvData.full_name, { compare: true });

    const emails = normalizeEmails(mergeArrays(csvData.emails, resumeData.emails));
    const emailsSource = fieldSource(resumeData.emails, csvData.emails, { treatArrayAsBoth: true });

    const phones = normalizePhones(mergeArrays(csvData.phones, resumeData.phones));
    const phonesSource = fieldSource(resumeData.phones, csvData.phones, { treatArrayAsBoth: true });

    const locationRaw = pickField(resumeData.location, csvData.location);
    const location = normalizeLocation(locationRaw);
    const locationSource = fieldSource(resumeData.location, csvData.location, { compare: true });

    const headline = pickField(resumeData.headline, csvData.headline) || null;
    const headlineSource = fieldSource(resumeData.headline, csvData.headline, { compare: true });

    const skills = normalizeSkills(mergeArrays(csvData.skills, resumeData.skills));
    const skillsSource = fieldSource(resumeData.skills, csvData.skills, { treatArrayAsBoth: true });

    const links = mergeLinks(csvData.links, resumeData.links);
    const linksSource = fieldSource(resumeData.links, csvData.links, { compare: true });

    const experience = mergeArrays(csvData.experience, resumeData.experience).map((item) => item || {}).filter(Boolean);
    const experienceSource = fieldSource(resumeData.experience, csvData.experience, { treatArrayAsBoth: true });
    const years_experience = calculateYearsExperience(experience);

    const education = mergeArrays(csvData.education, resumeData.education).map((item) => item || {}).filter(Boolean);
    const educationSource = fieldSource(resumeData.education, csvData.education, { treatArrayAsBoth: true });

    const currentCompany = pickField(resumeData.current_company, csvData.current_company) || null;
    const currentCompanySource = fieldSource(resumeData.current_company, csvData.current_company, { compare: true });

    return {
      candidate_id: uuidv4(),
      full_name: normalizedName,
      emails,
      phones,
      location,
      headline,
      skills,
      links,
      years_experience,
      experience,
      education,
      current_company: currentCompany,
      _fieldSources: {
        full_name: fullNameSource,
        emails: emailsSource,
        phones: phonesSource,
        location: locationSource,
        headline: headlineSource,
        skills: skillsSource,
        links: linksSource,
        experience: experienceSource,
        education: educationSource,
        current_company: currentCompanySource,
      },
    };
  } catch (err) {
    return {
      candidate_id: uuidv4(),
      full_name: null,
      emails: [],
      phones: [],
      location: { city: null, region: null, country: null },
      headline: null,
      skills: [],
      experience: [],
      education: [],
      current_company: null,
      _fieldSources: {},
    };
  }
};

module.exports = {
  mergeCandidate,
};
