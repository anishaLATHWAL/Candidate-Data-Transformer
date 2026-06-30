# Candidate Data Transformer

A Node.js CLI tool that merges recruiter CSV data and unstructured resume text into a single canonical candidate profile. It prioritizes deterministic merging, normalization, provenance tracking, and configurable output.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Design Decisions](#design-decisions)
5. [Tech Stack](#tech-stack)
6. [Getting Started](#getting-started)
   - [1. Clone & Install](#1-clone--install)
   - [2. Run the Pipeline](#2-run-the-pipeline)
7. [Configuration](#configuration)
8. [Testing](#testing)
9. [Project Structure](#project-structure)

---

## Overview

This project ingests structured recruiter CSV data and a resume TXT file, then produces a normalized JSON candidate profile. It is designed for reliability, traceability, and downstream schema flexibility.

The pipeline works in clear stages:

- Parse structured CSV and unstructured resume text
- Normalize fields into canonical formats
- Match resume to CSV row using email, phone, or name
- Merge sources with source-aware conflict resolution
- Calculate confidence and capture provenance
- Project the result into a configurable output schema
- Validate final JSON

---

## Features

- Resume parser for freeform text with section detection
- Normalization for emails, phones, locations, skills, dates, and links
- Candidate matching by email, phone, then normalized full name
- Merge logic that prefers resume values and preserves CSV fallbacks
- Per-field provenance tracking and confidence scoring
- Runtime config for custom output schemas
- Validation of projected output
- Robust handling of partial or missing input data

---

## System Architecture

### High Level Flow

```text
CSV Input  -->  Parse CSV  -->
                            \ 
                             Merge --> Project --> Validate --> JSON Output
                            / 
Resume TXT -->  Parse Resume -->
```

### Key Components

- **Parser**: Reads CSV and resume text separately
- **Normalizer**: Standardizes values before merge
- **Matcher**: Connects the resume to a CSV row predictably
- **Merger**: Combines data into a canonical candidate object
- **Projector**: Applies runtime configuration for output shape
- **Validator**: Ensures required output fields are present

---

## Design Decisions

### Canonical Internal Model

The system maintains a stable internal candidate schema, then projects it into output formats using runtime config. This separates merge logic from presentation logic.

### Deterministic Match Priority

Resume matching uses this order:

1. Email
2. Phone
3. Normalized full name

This reduces ambiguity and keeps merges consistent.

### Merge Policy

- Scalars: prefer resume values when present
- Arrays: merge and deduplicate CSV and resume lists
- Objects: prefer non-empty resume objects, fallback to CSV
- Provenance: record source for each field
- Confidence: score fields based on source and agreement

### Edge Cases

- Resume-only input is supported
- Missing resume or CSV input does not crash the pipeline
- Duplicate contact methods are deduplicated
- Noisy resume headings and separators are ignored
- Partial dates such as `2022` and `Present` are preserved
- Mixed education/certification sections are handled gracefully

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: JavaScript (CommonJS)
- **CLI**: `src/cli.js`
- **Parsing**: CSV parser and resume text parser
- **Testing**: built-in test runner in `tests/`

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/candidate-data-transformer.git
cd candidate-data-transformer
npm install
```

### 2. Run the Pipeline

Default pipeline run:

```bash
node src/cli.js --csv input/recruiter.csv --resume input/resume.txt --config config/default-config.json --output output/result.json
```

Custom config example:

```bash
node src/cli.js --csv input/recruiter.csv --resume input/resume.txt --config config/custom-config.json --output output/custom-result.json
```

---

## Configuration

The runtime config controls output mapping and validation.

Important config options:

- `fields` — output selection and field mapping
- `include_confidence` — add `confidence` metadata
- `include_provenance` — add `provenance` metadata
- `on_missing` — `null`, `omit`, or `error`

Use custom config files to generate different JSON schemas for different consumers.


---

## Testing

Run the full test suite:

```bash
npm test
```

Run scenario-based verification:

```bash
node tests/run-scenarios.js
```

---

## Project Structure

- `src/cli.js` — entrypoint for CLI execution
- `src/index.js` — orchestrates the pipeline
- `src/parsers/` — CSV and resume parsers
- `src/normalizers/` — normalization helpers
- `src/merger/` — merge, confidence, provenance
- `src/projector/` — output projection
- `src/validator/` — validation logic
- `src/utils/` — shared helpers
- `config/` — config files for output projection
- `input/` — sample recruiter and resume files
- `output/` — generated output files
- `tests/` — automated tests

---
