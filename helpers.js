const DEFAULT_IGNORED_PROPERTIES = ['id', 'realmId', 'owner'];

function buildIgnoreSet(customIgnore) {
  const ignore = new Set(DEFAULT_IGNORED_PROPERTIES);
  if (!customIgnore) {
    return ignore;
  }

  const values = Array.isArray(customIgnore)
    ? customIgnore
    : typeof customIgnore === 'string'
      ? customIgnore.split(',')
      : [];

  for (const key of values) {
    if (typeof key === 'string' && key.trim()) {
      ignore.add(key.trim());
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

function collectNamedEntities(value, referenceMap = new Map()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectNamedEntities(item, referenceMap);
    }
    return referenceMap;
  }

  if (!isPlainObject(value)) {
    return referenceMap;
  }

  const keys = Object.keys(value);
  const idKey = keys.find((key) => key.toLowerCase() === 'id');
  const nameKey = keys.find((key) => key.toLowerCase() === 'name');

  if (idKey && nameKey) {
    const idValue = value[idKey];
    const nameValue = value[nameKey];
    if (typeof idValue === 'string' && typeof nameValue === 'string') {
      referenceMap.set(idValue, nameValue);
    }
  }

  for (const key of keys) {
    collectNamedEntities(value[key], referenceMap);
  }

  return referenceMap;
}

function resolveReferenceValue(key, value, referenceMap) {
  if (
    typeof key === 'string' &&
    typeof value === 'string' &&
    key.toLowerCase().endsWith('id') &&
    referenceMap instanceof Map
  ) {
    const referenced = referenceMap.get(value);
    if (referenced !== undefined) {
      return referenced;
    }
  }
  return value;
}

function formatReferenceKey(key, value, referenceMap) {
  if (
    typeof key === 'string' &&
    typeof value === 'string' &&
    key.toLowerCase().endsWith('id') &&
    referenceMap instanceof Map &&
    referenceMap.has(value)
  ) {
    const baseKey = key.slice(0, -2);
    return `${baseKey}-xref`;
  }

  return key;
}

function describeValue(value, ignoreSet, indentLevel, lines, referenceMap) {
  const indent = '  '.repeat(indentLevel);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${indent}The list is empty.`);
      return;
    }

    value.forEach((item, index) => {
      if (isPlainObject(item) || Array.isArray(item)) {
        lines.push(`${indent}  ${index + 1}.`);
        describeValue(item, ignoreSet, indentLevel + 2, lines, referenceMap);
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

    for (const [key, val] of entries) {
      if (isPlainObject(val) || Array.isArray(val)) {
        lines.push(`${indent}  - ${key}:`);
        describeValue(val, ignoreSet, indentLevel + 2, lines, referenceMap);
      } else {
        const resolvedValue = resolveReferenceValue(key, val, referenceMap);
        const displayKey = formatReferenceKey(key, val, referenceMap);
        lines.push(`${indent}  - ${displayKey}: ${formatPrimitive(resolvedValue)}`);
      }
    }
    return;
  }

  lines.push(`${indent}${formatPrimitive(value)}.`);
}

module.exports = {
  DEFAULT_IGNORED_PROPERTIES,
  buildIgnoreSet,
  describeValue,
  collectNamedEntities,
  formatReferenceKey,
};
