#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORED_PROPERTIES = ['id', 'realmId', 'owner'];

function buildIgnoreSet(customIgnore) {
  const ignore = new Set(DEFAULT_IGNORED_PROPERTIES);
  if (Array.isArray(customIgnore)) {
    for (const key of customIgnore) {
      if (typeof key === 'string' && key.trim()) {
        ignore.add(key.trim());
      }
    }
  }
  return ignore;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function formatPrimitive(value) {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
}

function describeValue(value, ignoreSet, indentLevel, lines) {
  const indent = '  '.repeat(indentLevel);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${indent}The list is empty.`);
      return;
    }

    lines.push(`${indent}The list has ${value.length} item${value.length === 1 ? '' : 's'}:`);
    value.forEach((item, index) => {
      if (isPlainObject(item) || Array.isArray(item)) {
        lines.push(`${indent}  ${index + 1}.`);
        describeValue(item, ignoreSet, indentLevel + 2, lines);
      } else {
        lines.push(`${indent}  ${index + 1}. ${formatPrimitive(item)}.`);
      }
    });
    return;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([key]) => !ignoreSet.has(key));
    if (entries.length === 0) {
      lines.push(`${indent}No relevant properties.`);
      return;
    }

    lines.push(`${indent}The object has ${entries.length} propert${entries.length === 1 ? 'y' : 'ies'}:`);
    for (const [key, val] of entries) {
      if (isPlainObject(val) || Array.isArray(val)) {
        lines.push(`${indent}  - ${key}:`);
        describeValue(val, ignoreSet, indentLevel + 2, lines);
      } else {
        lines.push(`${indent}  - ${key}: ${formatPrimitive(val)}.`);
      }
    }
    return;
  }

  lines.push(`${indent}${formatPrimitive(value)}.`);
}

function jsonToCtb(data, options = {}) {
  const { ignore } = options;
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
  describeValue(source, ignoreSet, 0, lines);
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) {
      continue;
    }

    const [keyPart, valuePart] = raw.split('=');
    const key = keyPart.slice(2);

    if (valuePart !== undefined) {
      args[key] = valuePart;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }

  return args;
}

if (require.main === module) {
  const args = parseArgs(process.argv);
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

  const ignoreList = typeof args.ignore === 'string'
    ? args.ignore.split(',').map((value) => value.trim()).filter(Boolean)
    : [];

  try {
    const ctb = jsonToCtb(parsed, { ignore: ignoreList });
    process.stdout.write(`${ctb}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { jsonToCtb, DEFAULT_IGNORED_PROPERTIES };
