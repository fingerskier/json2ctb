import {
  DEFAULT_IGNORED_PROPERTIES,
  buildIgnoreSet,
  collectNamedEntities,
  describeValue,
} from './helpers.js';

const TITLE_KEYS = ['name', 'title', 'label'];

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function ensureParsedSource(data) {
  if (data === null || data === undefined) {
    return null;
  }

  if (typeof data !== 'string') {
    return data;
  }

  if (!data.trim()) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to parse JSON string input.');
  }
}

function isEmptyValue(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function jsonToCtb(data, options = {}) {
  const { ignore } = options;
  const ignoreSet = buildIgnoreSet(ignore);

  const source = ensureParsedSource(data);
  if (isEmptyValue(source)) {
    return null;
  }

  const lines = [];

  if (isPlainObject(source)) {
    const titleKey = TITLE_KEYS.find((key) => Object.prototype.hasOwnProperty.call(source, key));
    if (titleKey) {
      const rawTitle = source[titleKey];
      if (rawTitle !== null && rawTitle !== undefined) {
        const title = String(rawTitle).trim();
        if (title) {
          lines.push(title, '-'.repeat(title.length));
        }
      }
    }
  }

  const referenceMap = collectNamedEntities(source);
  describeValue(source, ignoreSet, 0, lines, referenceMap);

  return lines.join('\n');
}

export { DEFAULT_IGNORED_PROPERTIES };
