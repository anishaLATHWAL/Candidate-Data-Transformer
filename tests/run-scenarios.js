const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { runPipeline } = require('../src/index');

const tmp = (p) => path.resolve(__dirname, p);

const scenarios = [];

// Scenario A: existing recruiter + resume
scenarios.push({
  name: 'sample-recruiter-with-resume',
  csv: path.resolve('input', 'recruiter.csv'),
  resume: path.resolve('input', 'resume.txt'),
  checks: async (out) => {
    assert.ok(Array.isArray(out));
    assert.strictEqual(out.length, 2);
    out.forEach((r) => {
      assert.ok(r.candidate_id);
      assert.ok('emails' in r);
    });
  },
});

// Scenario B: john/jane matching
scenarios.push({
  name: 'john-jane-match',
  setup: async () => {
    const csvPath = tmp('john_jane.csv');
    const resumePath = tmp('john_resume.txt');
    fs.writeFileSync(csvPath, 'full_name,email,phone\nJohn,john@gmail.com,9876500000\nJane,jane@gmail.com,9876500001\n', 'utf8');
    fs.writeFileSync(resumePath, 'John\nSenior Engineer\nEmail: john@gmail.com\nPhone: 9876500000\n', 'utf8');
    return { csv: csvPath, resume: resumePath };
  },
  teardown: async () => {
    fs.unlinkSync(tmp('john_jane.csv'));
    fs.unlinkSync(tmp('john_resume.txt'));
  },
  checks: async (out) => {
    assert.ok(Array.isArray(out) && out.length === 2);
    const john = out.find((r) => r.emails && r.emails.includes('john@gmail.com'));
    const jane = out.find((r) => r.emails && r.emails.includes('jane@gmail.com'));
    assert.ok(john && jane, 'Both John and Jane present');
    const johnHasResume = john.provenance.some((p) => p.source === 'resume');
    const janeHasResume = jane.provenance.some((p) => p.source === 'resume');
    assert.strictEqual(johnHasResume, true, 'John should have resume provenance');
    assert.strictEqual(janeHasResume, false, 'Jane should not have resume provenance');
  },
});

// Scenario C: only resume
scenarios.push({
  name: 'only-resume',
  setup: async () => {
    const resumePath = tmp('solo_resume.txt');
    fs.writeFileSync(resumePath, 'Solo User\nEngineer\nEmail: solo@example.com\n', 'utf8');
    return { csv: null, resume: resumePath };
  },
  teardown: async () => { fs.unlinkSync(tmp('solo_resume.txt')); },
  checks: async (out) => {
    assert.ok(Array.isArray(out) && out.length === 1);
    assert.strictEqual(out[0].full_name, 'Solo User');
    assert.ok(out[0].emails && out[0].emails.includes('solo@example.com'));
  },
});

// Scenario D: malformed CSV (should not crash)
scenarios.push({
  name: 'malformed-csv',
  setup: async () => {
    const pth = tmp('malformed.csv');
    fs.writeFileSync(pth, 'name,email\n"Broken User,broken@example.com\n', 'utf8');
    return { csv: pth, resume: null };
  },
  teardown: async () => { fs.unlinkSync(tmp('malformed.csv')); },
  checks: async (out) => {
    assert.ok(Array.isArray(out));
  },
});

// Scenario E: duplicate emails/phones/skills deduplication
scenarios.push({
  name: 'dedupe-fields',
  setup: async () => {
    const pth = tmp('dupes.csv');
    fs.writeFileSync(pth, 'full_name,email,phone,skills\nDupes,ALICE@EXAMPLE.COM;alice@example.com,9876543210;+91-9876543210,js;JavaScript;JS\n', 'utf8');
    return { csv: pth, resume: null };
  },
  teardown: async () => { fs.unlinkSync(tmp('dupes.csv')); },
  checks: async (out) => {
    assert.ok(Array.isArray(out) && out.length === 1);
    const r = out[0];
    assert.ok(r.emails.length === 1);
    assert.ok(r.phones.length === 1);
    assert.ok(r.skills && r.skills.includes('JavaScript'));
  },
});

// Scenario F: unicode name
scenarios.push({
  name: 'unicode-name',
  setup: async () => {
    const pth = tmp('unicode.csv');
    fs.writeFileSync(pth, 'full_name,email\nJosé,jose@example.com\n', 'utf8');
    return { csv: pth, resume: null };
  },
  teardown: async () => { fs.unlinkSync(tmp('unicode.csv')); },
  checks: async (out) => {
    assert.ok(out.length === 1);
    assert.strictEqual(out[0].full_name, 'José');
  },
});

// Scenario G: large CSV (100 rows)
scenarios.push({
  name: 'large-csv',
  setup: async () => {
    const pth = tmp('large.csv');
    const lines = ['full_name,email,phone'];
    for (let i = 0; i < 100; i++) {
      lines.push(`User${i},user${i}@example.com,9876500${(1000 + i)}`);
    }
    fs.writeFileSync(pth, lines.join('\n'), 'utf8');
    return { csv: pth, resume: null };
  },
  teardown: async () => { fs.unlinkSync(tmp('large.csv')); },
  checks: async (out) => {
    assert.ok(out.length === 100);
  },
});

(async () => {
  for (const s of scenarios) {
    console.log(`Running scenario: ${s.name}`);
    let csv = s.csv;
    let resume = s.resume;
    if (s.setup) {
      const res = await s.setup();
      csv = res.csv;
      resume = res.resume;
    }

    try {
      const out = await runPipeline({ csvPath: csv, resumePath: resume, configPath: path.resolve('config', 'default-config.json'), outputPath: null });
      await s.checks(out);
      console.log(`  ✔ ${s.name} passed`);
    } catch (err) {
      console.error(`  ✖ ${s.name} failed:`, err.message || err);
    }

    if (s.teardown) await s.teardown();
  }
})();
