const path = require('path');

const tests = [
  './emailNormalizer.test.js',
  './phoneNormalizer.test.js',
  './nameNormalizer.test.js',
  './skillNormalizer.test.js',
  './dateNormalizer.test.js',
  './locationNormalizer.test.js',
  './mergeCandidate.test.js',
  './confidence.test.js',
  './provenance.test.js',
  './projector.test.js',
  './pipeline-multiple.test.js',
  './csvParser.test.js',
  './edgecases.test.js',
  './location-regression.test.js',
  './matcher.test.js',
  './validation-edgecases.test.js',
  './integration-john-jane.test.js',
];

const runAll = async () => {
  let failedLocal = false;
  for (const testFile of tests) {
    try {
      const required = require(path.resolve(__dirname, testFile));
      // If the module exports a function, call it (it may return a Promise)
      if (typeof required === 'function') {
        const maybePromise = required();
        if (maybePromise && typeof maybePromise.then === 'function') {
          await maybePromise;
        }
      }
    } catch (err) {
      failedLocal = true;
      console.error(`Test failed: ${testFile}\n`, err);
    }
  }
  if (failedLocal) process.exit(1);
};

runAll();
