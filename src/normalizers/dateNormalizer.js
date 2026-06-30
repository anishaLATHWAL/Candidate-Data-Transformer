const normalizeDate = (date) => {
  try {
    if (date === undefined || date === null) return null;
    const raw = String(date).trim();
    if (!raw) return null;

    const normalized = raw.replace(/\s+/g, ' ').toLowerCase();
    if (/^(present|current)$/i.test(normalized)) {
      return 'Present';
    }

    const yyyyMm = normalized.match(/^(\d{4})[-\/](0[1-9]|1[0-2])$/);
    if (yyyyMm) {
      return `${yyyyMm[1]}-${yyyyMm[2]}`;
    }

    const monthMatch = normalized.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)(uary|ch|il|e|y|ust|tember|ober|ember)?\s+(\d{4})$/i);
    if (monthMatch) {
      const monthLookup = {
        jan: '01',
        feb: '02',
        mar: '03',
        apr: '04',
        may: '05',
        jun: '06',
        jul: '07',
        aug: '08',
        sep: '09',
        sept: '09',
        oct: '10',
        nov: '11',
        dec: '12',
      };
      const monthKey = monthMatch[1].toLowerCase();
      const year = monthMatch[3];
      const month = monthLookup[monthKey];
      if (month) {
        return `${year}-${month}`;
      }
    }

    const yearOnly = normalized.match(/^(\d{4})$/);
    if (yearOnly) {
      return `${yearOnly[1]}-01`;
    }

    return null;
  } catch (err) {
    return null;
  }
};

module.exports = {
  normalizeDate,
};
