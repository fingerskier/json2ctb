import {
  DEFAULT_IGNORED_PROPERTIES,
  buildIgnoreSet,
  collectNamedEntities,
  describeValue,
} from './helpers.js';

function ensureParsedSource(data) {
  if (typeof data !== 'string') {
    return data;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to parse JSON string input.');
  }
}

export function jsonToCtb(data, options = {}) {
  const { ignore } = options;
  const ignoreSet = buildIgnoreSet(ignore);

  const source = ensureParsedSource(data);
  const lines = ['Canonical Text Block', '--------------------'];
  const referenceMap = collectNamedEntities(source);
  describeValue(source, ignoreSet, 0, lines, referenceMap);

  return lines.join('\n');
}

export { DEFAULT_IGNORED_PROPERTIES };
