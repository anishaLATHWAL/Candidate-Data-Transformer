const normalizePhones = (phones) => {
  if (!Array.isArray(phones)) return [];

  const normalized = [];
  const seen = new Set();

  const toDigits = (value) => {
    if (typeof value !== 'string') return null;
    let trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const leadingPlus = trimmed.startsWith('+');
    trimmed = trimmed.replace(/[\s()\-\.]/g, '');
    trimmed = trimmed.replace(/[^+0-9]/g, '');
    if (leadingPlus && !trimmed.startsWith('+')) {
      trimmed = `+${trimmed}`;
    }
    return trimmed;
  };

  const toE164 = (value) => {
    if (!value) return null;
    const cleaned = toDigits(value);
    if (!cleaned) return null;

    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      if (!/^[0-9]+$/.test(digits)) return null;
      if (digits.length < 8 || digits.length > 15) return null;
      return `+${digits}`;
    }

    if (/^0[0-9]{10}$/.test(cleaned)) {
      return `+91${cleaned.slice(1)}`;
    }

    if (/^[1-9][0-9]{9}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }

    if (/^91[0-9]{10}$/.test(cleaned)) {
      return `+${cleaned}`;
    }

    return null;
  };

  for (const raw of phones) {
    if (raw === undefined || raw === null) continue;
    const candidate = toE164(raw);
    if (!candidate) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    normalized.push(candidate);
  }

  return normalized;
};

module.exports = {
  normalizePhones,
};
