import fs from 'node:fs';
import path from 'node:path';

import { jsonToCtb } from './index.js';

export function jsonToCtbToFile(data, options = {}) {
  const { output, ignore } = options;

  if (output === undefined || output === null) {
    throw new Error('The output option must be provided when writing to disk.');
  }

  if (typeof output !== 'string' || !output.trim()) {
    throw new Error('The output option must be a non-empty string when provided.');
  }

  const result = jsonToCtb(data, { ignore });
  const resolvedOutputPath = path.resolve(process.cwd(), output);
  fs.writeFileSync(resolvedOutputPath, `${result}\n`, 'utf8');
  return result;
}
