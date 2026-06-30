const path = require('path');
const { log, warn, error } = require('./utils/logger');
const { runPipeline } = require('./index');

// simple color helpers (avoid adding deps)
const colors = {
  green: (s) => `\u001b[32m${s}\u001b[39m`,
  red: (s) => `\u001b[31m${s}\u001b[39m`,
  yellow: (s) => `\u001b[33m${s}\u001b[39m`,
  cyan: (s) => `\u001b[36m${s}\u001b[39m`,
  bold: (s) => `\u001b[1m${s}\u001b[22m`,
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '-h' || token === '--help') {
      result.help = true;
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = args[index + 1];
      if (!next || next.startsWith('--')) {
        throw new Error(`Missing value for argument ${token}`);
      }
      result[key] = next;
      index += 1;
    }
  }

  return result;
};

const main = async () => {
  try {
    const { csv, resume, config, output, help } = parseArgs();

    const usage = () => {
      console.log(colors.bold('Candidate Data Transformer CLI'));
      console.log();
      console.log('Usage:');
      console.log(`  ${colors.cyan('node src/cli.js --csv input/recruiter.csv --resume input/resume.txt --config config/default-config.json --output output/result.json')}`);
      console.log();
      console.log('Options:');
      console.log(`  ${colors.cyan('--csv <path>')}     Path to recruiter CSV (optional if --resume provided)`);
      console.log(`  ${colors.cyan('--resume <path>')}  Path to resume TXT (optional if --csv provided)`);
      console.log(`  ${colors.cyan('--config <path>')}  Path to config JSON (required)`);
      console.log(`  ${colors.cyan('--output <path>')}  Path to write output JSON (optional)`);
      console.log(`  ${colors.cyan('--help')}           Show this help`);
      console.log();
      console.log('Example:');
      console.log(`  ${colors.cyan('node src/cli.js --csv input/recruiter.csv --resume input/resume.txt --config config/default-config.json --output output/result.json')}`);
      console.log();
    };

    if (help) {
      usage();
      process.exit(0);
    }

    if (!csv && !resume) {
      error('At least one source must be provided: --csv or --resume');
      usage();
      process.exit(1);
    }

    if (!config) {
      error('Config file is required: --config <path>');
      usage();
      process.exit(1);
    }

    const outputPath = output ? path.resolve(process.cwd(), output) : null;

    const result = await runPipeline({ csvPath: csv, resumePath: resume, configPath: config, outputPath });

    if (Array.isArray(result)) {
      log(colors.green(`Pipeline completed successfully. ${result.length} candidate(s) processed.`));
    } else {
      log(colors.green('Pipeline completed successfully.'));
    }

    if (!outputPath) {
      // print to stdout if no file written
      process.stdout.write(JSON.stringify(result, null, 2));
    }

    process.exit(0);
  } catch (err) {
    // friendly error reporting
    if (err && err.message) {
      error(colors.red(err.message));
    } else {
      error('An unknown error occurred');
    }
    process.exit(2);
  }
};

if (require.main === module) {
  main();
}
