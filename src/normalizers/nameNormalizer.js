const normalizeName = (name) => {
  try {
    if (name === undefined || name === null) return null;
    let string = String(name).trim();
    if (!string) return null;

    // Preserve unicode letters (e.g. José). Use unicode property escapes.
    string = string.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    string = string.replace(/\s+/g, ' ');
    if (!string) return null;

    const titleCased = string
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return titleCased || null;
  } catch (err) {
    return null;
  }
};

module.exports = {
  normalizeName,
};
