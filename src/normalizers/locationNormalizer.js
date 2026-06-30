const { normalizeString } = require('../utils/helpers');

const COUNTRY_HINTS = [
  'india',
  'usa',
  'united states',
  'united states of america',
  'canada',
  'uk',
  'united kingdom',
  'germany',
  'france',
  'australia',
  'brazil',
  'china',
  'japan',
  'netherlands',
  'singapore',
  'united arab emirates',
  'uae',
];

const isCountryCandidate = (value) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return COUNTRY_HINTS.includes(normalized);
};

const cleanLocationText = (value) => {
  if (value === undefined || value === null) return '';
  return normalizeString(value)
    .replace(/^(?:location|current location|address|residence)\s*[:\-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeLocation = (location) => {
  try {
    if (location === undefined || location === null) {
      return { city: null, region: null, country: null };
    }

    // If an object is passed in (e.g., from resume parsing), preserve its fields
    // and ensure we do not stringify the object (which caused "[object Object]").
    if (typeof location === 'object') {
      const city = normalizeString(location.city);
      const region = normalizeString(location.region);
      const country = normalizeString(location.country);
      return {
        city: city || null,
        region: region || null,
        country: country || null,
      };
    }

    const text = cleanLocationText(location);
    if (!text) {
      return { city: null, region: null, country: null };
    }

    const parts = text
      .split(',')
      .map((part) => normalizeString(part))
      .filter(Boolean);

    if (parts.length === 0) {
      return { city: null, region: null, country: null };
    }

    if (parts.length === 1) {
      const candidate = parts[0];
      if (isCountryCandidate(candidate)) {
        return { city: null, region: null, country: candidate };
      }
      return { city: candidate, region: null, country: null };
    }

    if (parts.length === 2) {
      const [first, second] = parts;
      if (isCountryCandidate(second)) {
        return { city: first, region: null, country: second };
      }
      return { city: first, region: second, country: null };
    }

    const [city, region, country] = parts;
    return {
      city: city || null,
      region: region || null,
      country: country || null,
    };
  } catch (err) {
    return { city: null, region: null, country: null };
  }
};

module.exports = {
  normalizeLocation,
};
