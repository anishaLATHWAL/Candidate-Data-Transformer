const fs = require('fs');
const path = require('path');

const isBlank = (value) => {
  return value === undefined || value === null || String(value).trim().length === 0;
};

const uniqueArray = (values) => {
  return Array.from(new Set(values.filter((value) => !isBlank(value))));
};

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim().replace(/\s+/g, ' ');
};

const safeReadJson = (filePath) => {
  const absolute = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absolute, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON config at ${absolute}: ${err.message}`);
  }
};

const readTextFile = (filePath) => {
  const absolute = path.resolve(process.cwd(), filePath);
  return fs.readFileSync(absolute, 'utf8');
};

const getByPath = (object, pathString) => {
  if (!object || !pathString) return undefined;
  const normalizedPath = pathString.replace(/\[(\d+)\]/g, '.$1');
  return normalizedPath.split('.').reduce((value, key) => {
    if (value === undefined || value === null) return undefined;
    return value[key];
  }, object);
};

const setByPath = (object, pathString, value) => {
  const keys = pathString.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = object;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }
    if (current[key] === undefined || current[key] === null) {
      current[key] = isFinite(Number(keys[index + 1])) ? [] : {};
    }
    current = current[key];
  });
};

const toTitleCase = (value) => {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

module.exports = {
  isBlank,
  uniqueArray,
  normalizeString,
  safeReadJson,
  readTextFile,
  getByPath,
  setByPath,
  toTitleCase,
};
