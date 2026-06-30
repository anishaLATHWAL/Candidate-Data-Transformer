const { readTextFile } = require('../utils/helpers');
const { warn } = require('../utils/logger');
const { normalizeLocation } = require('../normalizers/locationNormalizer');

const normalizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\r/g, '').replace(/\t/g, ' ').replace(/ +/g, ' ').trim();
};

const isHeading = (line) => {
  if (!line) return false;
  const normalized = line.toLowerCase().replace(/[:\s]+$/g, '');
  return /^(skills?|skillset|technical skills|experience|work experience|professional experience|education|academic background|education and training)$/i.test(normalized);
};

const findSectionRanges = (lines) => {
  const sections = {};
  let current = null;

  lines.forEach((line, index) => {
    const normalized = line.toLowerCase().replace(/[:\s]+$/g, '');
    if (/^(skills?|skillset|technical skills)$/i.test(normalized)) {
      current = 'skills';
      sections.skills = sections.skills || [];
      return;
    }
    if (/^(experience|work experience|professional experience)$/i.test(normalized)) {
      current = 'experience';
      sections.experience = sections.experience || [];
      return;
    }
    if (/^(education|academic background|education and training)$/i.test(normalized)) {
      current = 'education';
      sections.education = sections.education || [];
      return;
    }

    if (current) {
      if (line.trim().length === 0) {
        sections[current].push('');
        return;
      }
      sections[current].push(line);
    }
  });

  return sections;
};

const extractEmails = (text) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const matches = text.match(emailRegex) || [];
  return Array.from(new Set(matches.map((email) => email.trim())));
};

const extractPhones = (text) => {
  const phoneRegex = /(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]?){1,3}\d{3,4}/g;
  const matches = text.match(phoneRegex) || [];
  return Array.from(
    new Set(
      matches
        .map((raw) => raw.replace(/[()\s.-]/g, '').trim())
        .filter((candidate) => candidate.length >= 7 && candidate.length <= 15)
    )
  );
};

const extractLinks = (lines, text) => {
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const normalizeUrl = (url) => {
    if (!url) return '';
    return url.trim().replace(/[.,;]+$/, '');
  };

  const links = {
    linkedin: null,
    github: null,
    portfolio: null,
    other: [],
  };

  const extractedUrls = Array.from(new Set((text.match(urlRegex) || []).map(normalizeUrl).filter(Boolean)));
  const assigned = new Set();

  const tryAssign = (key, url) => {
    if (!url || links[key]) return false;
    links[key] = normalizeUrl(url);
    assigned.add(links[key]);
    return true;
  };

  lines.forEach((line, index) => {
    const trimmed = normalizeText(line);
    if (!trimmed) return;

    const labelMatch = trimmed.match(/^(linkedin|github|portfolio)\s*[:\-]?\s*(.*)$/i);
    if (labelMatch) {
      const key = labelMatch[1].toLowerCase();
      const candidateUrl = normalizeUrl(labelMatch[2]);
      if (candidateUrl && urlRegex.test(candidateUrl)) {
        tryAssign(key, candidateUrl);
        return;
      }

      const nextLine = lines[index + 1] ? normalizeText(lines[index + 1]) : '';
      if (nextLine && urlRegex.test(nextLine)) {
        tryAssign(key, nextLine.match(urlRegex)[0]);
      }
    }
  });

  for (const url of extractedUrls) {
    if (assigned.has(url)) continue;
    const lower = url.toLowerCase();
    if (lower.includes('linkedin.com') || lower.includes('linkedin.cn')) {
      tryAssign('linkedin', url);
      continue;
    }
    if (lower.includes('github.com')) {
      tryAssign('github', url);
      continue;
    }
    if (lower.includes('portfolio') || lower.includes('behance.net') || lower.includes('dribbble.com') || lower.includes('medium.com')) {
      tryAssign('portfolio', url);
      continue;
    }
    links.other.push(url);
  }

  links.other = Array.from(new Set(links.other));
  return links;
};

const extractLocation = (lines) => {
  const countryHints = ['usa', 'united states', 'united states of america', 'canada', 'uk', 'united kingdom', 'india', 'germany', 'france', 'australia'];
  const locationLabelPattern = /^(?:location|current location|address|residence)\s*[:\-]\s*/i;

  for (const line of lines) {
    const cleaned = line.trim();
    if (!cleaned || cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || cleaned.match(/\d{7,}/)) {
      continue;
    }

    const candidate = cleaned.replace(locationLabelPattern, '');
    const lower = candidate.toLowerCase();
    const parts = candidate.split(/,|\|/).map((p) => p.trim()).filter(Boolean);
    const hasCountry = countryHints.some((hint) => lower.includes(hint));

    if (parts.length >= 2 && parts.length <= 3 && (hasCountry || parts.length === 3)) {
      return normalizeLocation(candidate);
    }

    if (cleaned.match(locationLabelPattern) && parts.length === 1) {
      return normalizeLocation(candidate);
    }
  }

  return { city: null, region: null, country: null };
};

const parseSkills = (sectionLines) => {
  if (!Array.isArray(sectionLines)) return [];
  const skills = [];

  sectionLines.forEach((line) => {
    const trimmed = normalizeText(line);
    if (!trimmed || isSeparatorLine(trimmed)) return;

    const parts = trimmed.split(/[,;\/\|·•]/).map((item) => item.trim()).filter(Boolean);
    if (parts.length > 1) {
      skills.push(...parts);
      return;
    }

    skills.push(trimmed);
  });

  return Array.from(new Set(skills));
};

const isSeparatorLine = (line) => {
  return /^[-*_\s]{3,}$/.test(line.trim());
};

const isDateLine = (line) => {
  return /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b\d{4}\b|present|current|ongoing/i.test(line);
};

const parseDateRange = (line) => {
  const normalized = line.trim();
  const parts = normalized.split(/[-–—]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [null, null];
  }

  const start = parts[0] || null;
  const end = parts.length > 1 ? parts[1] : null;
  return [start, end];
};

const parseExperience = (sectionLines) => {
  if (!Array.isArray(sectionLines)) return [];

  const entries = [];
  let current = [];

  sectionLines.forEach((line) => {
    const trimmed = normalizeText(line);
    if (!trimmed) return;

    if (isSeparatorLine(trimmed)) {
      if (current.length) {
        entries.push(current);
        current = [];
      }
      return;
    }

    current.push(trimmed);
  });

  if (current.length) {
    entries.push(current);
  }

  return entries
    .map((block) => {
      const filtered = block.filter((line) => line && !isSeparatorLine(line));
      if (!filtered.length) return null;

      const dateIndex = filtered.findIndex((line) => isDateLine(line));
      let company = null;
      let title = null;
      let start = null;
      let end = null;
      let summary = null;

      if (dateIndex >= 0) {
        const beforeDate = filtered.slice(0, dateIndex);
        const afterDate = filtered.slice(dateIndex + 1);
        [start, end] = parseDateRange(filtered[dateIndex]);

        if (beforeDate.length >= 1) {
          company = beforeDate[0] || null;
        }
        if (beforeDate.length >= 2) {
          title = beforeDate.slice(1).join(' ').trim() || null;
        }
        summary = afterDate.join(' ').trim() || null;
      } else {
        if (filtered.length >= 3) {
          company = filtered[0] || null;
          title = filtered[1] || null;
          summary = filtered.slice(2).join(' ').trim() || null;
        } else if (filtered.length === 2) {
          company = filtered[0] || null;
          title = filtered[1] || null;
        } else {
          company = filtered[0] || null;
        }
      }

      return {
        company: company || null,
        title: title || null,
        start,
        end,
        summary: summary || null,
      };
    })
    .filter((entry) => entry && (entry.company || entry.title || entry.start || entry.end || entry.summary));
};

const parseEducation = (sectionLines) => {
  if (!Array.isArray(sectionLines)) return [];
  const entries = [];
  let current = [];

  sectionLines.forEach((line) => {
    const trimmed = normalizeText(line);
    if (!trimmed) {
      return;
    }

    if (isSeparatorLine(trimmed)) {
      if (current.length) {
        entries.push(current);
        current = [];
      }
      return;
    }

    current.push(trimmed);
  });

  if (current.length) {
    entries.push(current);
  }

  return entries
    .map((block) => {
      const filtered = block.filter((line) => line && !isSeparatorLine(line));
      if (!filtered.length) return null;

      const lastLine = filtered[filtered.length - 1] || '';
      const yearMatch = lastLine.match(/\b(19|20)\d{2}\b/);
      const end_year = yearMatch ? yearMatch[0] : null;
      const contentLines = end_year && filtered.length > 1 ? filtered.slice(0, -1) : filtered;

      return {
        institution: contentLines[0] || null,
        degree: contentLines[1] || null,
        field: contentLines.slice(2).join(' ').trim() || null,
        end_year,
      };
    })
    .filter(Boolean);
};

const parseResume = async (filePath) => {
  const emptyProfile = {
    full_name: null,
    emails: [],
    phones: [],
    location: { city: null, region: null, country: null },
    headline: null,
    skills: [],
    experience: [],
    education: [],
  };

  if (!filePath) {
    warn('Missing resume path. Returning empty profile.');
    return emptyProfile;
  }

  let text;
  try {
    text = readTextFile(filePath);
  } catch (err) {
    warn(`Unable to read resume file ${filePath}: ${err.message}`);
    return emptyProfile;
  }

  if (!text || !text.trim()) {
    return emptyProfile;
  }

  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n').map((line) => normalizeText(line)).filter((line) => line !== undefined);
  const contentLines = lines.filter((line) => line.trim().length > 0);

  const full_name = contentLines.length >= 1 ? contentLines[0] : null;
  const headline = contentLines.length >= 2 && !isHeading(contentLines[1]) ? contentLines[1] : null;

  const sections = findSectionRanges(lines);
  const skills = parseSkills(sections.skills);
  const experience = parseExperience(sections.experience);
  const education = parseEducation(sections.education);

  const location = extractLocation(contentLines);
  const emails = extractEmails(normalizedText);
  const phones = extractPhones(normalizedText);
  const links = extractLinks(contentLines, normalizedText);

  return {
    full_name: full_name || null,
    emails,
    phones,
    location,
    headline: headline || null,
    skills,
    experience,
    education,
    links,
  };
};

module.exports = {
  parseResume,
  parseResumeCandidate: parseResume,
};
