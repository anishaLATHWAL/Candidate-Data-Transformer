const { getByPath, setByPath } = require('../utils/helpers');

const DEFAULT_MISSING_POLICY = 'null';

const normalizeConfig = (config) => {
  if (!config || typeof config !== 'object') {
    return {
      fields: [],
      include_confidence: false,
      include_provenance: false,
      on_missing: DEFAULT_MISSING_POLICY,
    };
  }

  const fields = Array.isArray(config.fields) ? config.fields : [];
  const include_confidence = config.include_confidence === true;
  const include_provenance = config.include_provenance === true;
  const on_missing = ['omit', 'null', 'error'].includes(config.on_missing) ? config.on_missing : DEFAULT_MISSING_POLICY;

  return { fields, include_confidence, include_provenance, on_missing };
};

const resolveFieldValue = (canonicalCandidate, fieldConfig) => {
  const sourcePath = fieldConfig.from || fieldConfig.path;
  return getByPath(canonicalCandidate, sourcePath);
};

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const projectCandidate = (canonicalCandidate, config) => {
  try {
    const normalizedConfig = normalizeConfig(config);
    const projected = {};
    const errors = [];

    if (!canonicalCandidate || typeof canonicalCandidate !== 'object') {
      return projected;
    }

    normalizedConfig.fields.forEach((fieldConfig) => {
      if (!fieldConfig || typeof fieldConfig !== 'object' || !fieldConfig.path) {
        return;
      }

      const outputPath = fieldConfig.path;
      const value = resolveFieldValue(canonicalCandidate, fieldConfig);
      const missing = isEmptyValue(value);

      if (missing) {
        if (normalizedConfig.on_missing === 'omit') {
          return;
        }

        if (normalizedConfig.on_missing === 'error') {
          errors.push(`Missing value for field ${outputPath}`);
        }

        setByPath(projected, outputPath, null);
        return;
      }

      setByPath(projected, outputPath, value);
    });

    if (normalizedConfig.include_confidence) {
      const confidence = canonicalCandidate._confidence || null;
      if (confidence !== null) {
        projected.confidence = confidence;
      }
    }

    if (normalizedConfig.include_provenance) {
      const provenance = canonicalCandidate._provenance || null;
      if (provenance !== null) {
        projected.provenance = provenance;
      }
    }

    if (errors.length > 0) {
      projected.errors = errors;
    }

    return projected;
  } catch (err) {
    return {};
  }
};

module.exports = {
  projectCandidate,
};
