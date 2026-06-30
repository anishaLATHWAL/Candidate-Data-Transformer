const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { warn } = require('../utils/logger');
const { normalizeString, isBlank } = require('../utils/helpers');

const parseCSV = async (filePath) => {
  if (!filePath) {
    throw new Error('CSV file path is required');
  }

  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    warn(`CSV file not found: ${absolutePath}. No CSV candidates will be loaded.`);
    return [];
  }

  const candidates = [];

  const splitCell = (raw, separators) => {
    if (raw === undefined || raw === null) return [];
    const s = String(raw).trim();
    if (!s) return [];
    const parts = s.split(new RegExp(separators.join('|'))).map((p) => p.trim()).filter(Boolean);
    return parts;
  };

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(absolutePath)
      .on('error', (err) => {
        warn(`Unable to read CSV file ${absolutePath}: ${err.message}`);
        resolve([]);
      })
      .pipe(csv())
      .on('data', (row) => {
        const trimmed = Object.keys(row).reduce((acc, key) => {
          const k = key.trim();
          const v = normalizeString(row[key]);
          acc[k] = v;
          return acc;
        }, {});

        // convert known multi-value columns into arrays
        const normalizedRow = Object.keys(trimmed).reduce((acc, key) => {
          const lower = key.toLowerCase();
          const value = trimmed[key];

          if (/skill/.test(lower)) {
            acc[key] = splitCell(value, [',', ';', '\\/', '\\|']);
            return acc;
          }

          if (/email/.test(lower)) {
            acc[key] = splitCell(value, [';', ',', '\\|']);
            return acc;
          }

          if (/phone/.test(lower)) {
            acc[key] = splitCell(value, [';', ',', '\\|', '\\/']);
            return acc;
          }

          acc[key] = value;
          return acc;
        }, {});

        const hasValue = Object.values(normalizedRow).some((value) => {
          if (Array.isArray(value)) return value.length > 0;
          return !isBlank(value);
        });
        if (!hasValue) return;

        candidates.push(normalizedRow);
      })
      .on('error', (err) => {
        warn(`Malformed CSV encountered in ${absolutePath}: ${err.message}`);
        resolve([]);
      })
      .on('end', () => {
        resolve(candidates);
      });

    stream.on('close', () => {});
  });
};

module.exports = {
  parseCSV,
};
