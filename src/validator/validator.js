const { getByPath } = require('../utils/helpers');

const validateOutput = (projected, config) => {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config for validation');
  }

  const fields = Array.isArray(config.fields) ? config.fields : [];
  const errors = [];

  for (const f of fields) {
    if (!f || !f.path) continue;
    if (f.required) {
      const value = getByPath(projected, f.path);
      if (value === undefined || value === null) {
        errors.push(`Missing required field: ${f.path}`);
      }
    }
  }

  if (errors.length) {
    const err = new Error(`Validation failed: ${errors.join('; ')}`);
    err.details = errors;
    throw err;
  }

  return true;
};

module.exports = {
  validateOutput,
};
