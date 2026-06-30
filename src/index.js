
const path = require('path');
const fs = require('fs');
const { log, warn, error, ok, fail } = require('./utils/logger');
const { safeReadJson } = require('./utils/helpers');
const { parseCSV } = require('./parsers/csvParser');
const { parseResume } = require('./parsers/resumeParser');
const { mergeCandidate } = require('./merger/mergeCandidate');
const { calculateConfidence } = require('./merger/confidence');
const { buildProvenance } = require('./merger/provenance');
const { projectCandidate } = require('./projector/projector');
const { validateOutput } = require('./validator/validator');
const { matchResumeToRow } = require('./utils/matcher');

const runPipeline = async ({ csvPath, resumePath, configPath, outputPath }) => {
  log('Pipeline start');

  let config;
  try {
    config = safeReadJson(configPath);
    log('Loaded config', configPath);
  } catch (err) {
    throw new Error(`Unable to load config: ${err.message}`);
  }

  // 1. Parse CSV
  log('Parsing CSV', csvPath);
  let csvCandidates = [];
  try {
    if (csvPath) {
      csvCandidates = await parseCSV(csvPath);
    }
    ok(`CSV parsed (${csvCandidates.length} candidate${csvCandidates.length === 1 ? '' : 's'})`);
  } catch (err) {
    warn('CSV parse error, continuing with empty CSV:', err.message);
    csvCandidates = [];
  }

  // 2. Parse Resume
  log('Parsing resume', resumePath);
  let resumeCandidate = null;
  try {
    if (resumePath) {
      resumeCandidate = await parseResume(resumePath);
    }
    if (resumeCandidate) ok('Resume parsed'); else ok('No resume provided');
  } catch (err) {
    warn('Resume parse error, continuing with null resume:', err.message);
    resumeCandidate = null;
  }

  // If no CSV rows and resume exists, process resume alone
  const candidatesToProcess = Array.isArray(csvCandidates) && csvCandidates.length > 0 ? csvCandidates : (resumeCandidate ? [null] : []);

  const results = [];
  const errorsList = [];

  for (let i = 0; i < candidatesToProcess.length; i += 1) {
    const csvRow = candidatesToProcess[i];
    try {
      log(`Processing candidate ${i + 1}/${candidatesToProcess.length}`);

      // Merge per CSV row with best-matching resume (if any)
      const matchedResume = resumeCandidate && csvRow ? matchResumeToRow(csvRow, resumeCandidate) : resumeCandidate;
      const canonical = mergeCandidate(csvRow, matchedResume);

      // Confidence
      const confidence = calculateConfidence(Object.assign({}, canonical, { _fieldSources: canonical._fieldSources }));
      canonical._confidence = confidence;

      // Provenance (use the resume actually matched to this row)
      const provenance = buildProvenance(csvRow, matchedResume, canonical);
      canonical._provenance = provenance;

      // Project
      const projected = projectCandidate(canonical, config);

      // Validate per-candidate
      try {
        validateOutput(projected, config);
      } catch (err) {
        // attach validation errors but continue
        warn(`Validation failed for candidate ${i + 1}: ${err.message}`);
        errorsList.push({ index: i, error: err.message });
      }

      results.push(projected);
    } catch (err) {
      warn(`Failed to process candidate ${i + 1}: ${err.message}`);
      errorsList.push({ index: i, error: err.message });
    }
  }

  // After processing candidates
  if (results.length > 0) ok('Merge complete');
  if (results.length > 0) ok('Confidence calculated');

  // Write output array
  if (outputPath) {
    try {
      const dest = path.resolve(process.cwd(), outputPath);
      fs.writeFileSync(dest, JSON.stringify(results, null, 2), 'utf8');
      ok(`Output written to ${dest}`);
    } catch (err) {
      warn('Failed to write output file:', err.message);
    }
  }
  if (errorsList.length) {
    fail('Pipeline completed with errors for some candidates');
  } else {
    ok('Pipeline complete');
  }

  return results;
};

module.exports = {
  runPipeline,
};
