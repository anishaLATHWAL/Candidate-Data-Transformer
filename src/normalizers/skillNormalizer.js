const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];

  const aliasMap = {
    cpp: 'C++',
    'c plus plus': 'C++',
    js: 'JavaScript',
    javascript: 'JavaScript',
    nodejs: 'Node.js',
    reactjs: 'React',
    py: 'Python',
    ts: 'TypeScript',
    mongodb: 'MongoDB',
  };

  const normalized = new Set();

  for (const raw of skills) {
    if (raw === undefined || raw === null) continue;
    const trimmed = String(raw).trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    const mapped = aliasMap[key] || trimmed;
    normalized.add(mapped);
  }

  return Array.from(normalized).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

module.exports = {
  normalizeSkills,
};
