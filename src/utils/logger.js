const COLORS = {
  reset: '\u001b[39m',
  green: '\u001b[32m',
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
  boldOn: '\u001b[1m',
  boldOff: '\u001b[22m',
};

const prefix = '[candidate-transformer]';

const log = (...args) => {
  console.log(prefix, ...args);
};

const warn = (...args) => {
  console.warn(`${prefix} [warn]`, ...args);
};

const error = (...args) => {
  console.error(`${prefix} [error]`, ...args);
};

const ok = (message) => {
  const mark = `${COLORS.green}✔${COLORS.reset}`;
  console.log(`${mark} ${message}`);
};

const fail = (message) => {
  const mark = `${COLORS.red}✖${COLORS.reset}`;
  console.log(`${mark} ${message}`);
};

module.exports = {
  log,
  warn,
  error,
  ok,
  fail,
};
