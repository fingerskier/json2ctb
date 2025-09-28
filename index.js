#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');


const {
  DEFAULT_IGNORED_PROPERTIES,
  buildIgnoreSet,
  collectNamedEntities,
  describeValue,
} = require('./helpers');


function jsonToCtb(data, options = {}) {
  const { ignore, output } = options;
  const ignoreSet = buildIgnoreSet(ignore);

  let source = data;
  if (typeof data === 'string') {
    try {
      source = JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to parse JSON string input.');
    }
  }

  const lines = ['Canonical Text Block', '--------------------'];
  const referenceMap = collectNamedEntities(source);
  describeValue(source, ignoreSet, 0, lines, referenceMap);

  const result = lines.join('\n');

  if (output !== undefined && output !== null) {
    if (typeof output !== 'string' || !output.trim()) {
      throw new Error('The output option must be a non-empty string when provided.');
    }

    if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
      throw new Error('File output requires a Node.js environment with process.cwd available.');
    }

    const resolvedOutputPath = path.resolve(process.cwd(), output);
    fs.writeFileSync(resolvedOutputPath, `${result}\n`, 'utf8');
  }

  return result;
}

if (require.main === module) {
  const args = yargs(hideBin(process.argv))
    .usage('Usage: $0 --input <path> [options]')
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Path to the input JSON file.',
      demandOption: true,
    })
    .option('ignore', {
      alias: 'g',
      type: 'array',
      description: 'Properties to ignore in the output.',
      coerce: (value) => (Array.isArray(value) ? value : [])
        .flatMap((entry) => String(entry).split(','))
        .map((entry) => entry.trim())
        .filter(Boolean),
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Optional file path to write the Canonical Text Block.',
    })
    .help()
    .alias('help', 'h')
    .parse();

  const inputPath = args.input;

  if (!inputPath) {
    console.error('Error: --input <path> is required.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), inputPath);

  let fileContents;
  try {
    fileContents = fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    console.error(`Error: Unable to read file at ${resolvedPath}.`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(fileContents);
  } catch (error) {
    console.error('Error: Input file does not contain valid JSON.');
    process.exit(1);
  }

  try {
    const ctb = jsonToCtb(parsed, { ignore: args.ignore, output: args.output });
    process.stdout.write(`${ctb}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { jsonToCtb, DEFAULT_IGNORED_PROPERTIES };
