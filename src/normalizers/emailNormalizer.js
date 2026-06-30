const normalizeEmails = (emails) => {
  if (!Array.isArray(emails)) return [];

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const seen = new Set();
  const normalized = [];

  for (const raw of emails) {
    if (raw === undefined || raw === null) continue;
    const trimmed = String(raw).trim().toLowerCase();
    if (!trimmed) continue;
    if (!emailRegex.test(trimmed)) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
};

module.exports = {
  normalizeEmails,
};
