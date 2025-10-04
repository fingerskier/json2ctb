#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { jsonToCtb } from './index.js';

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
  const ctb = jsonToCtb(parsed, { ignore: args.ignore });

  if (ctb === null) {
    process.stdout.write('');
    process.exit(0);
  }

  if (args.output) {
    const resolvedOutputPath = path.resolve(process.cwd(), args.output);
    fs.writeFileSync(resolvedOutputPath, `${ctb}\n`, 'utf8');
  }

  process.stdout.write(`${ctb}\n`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
