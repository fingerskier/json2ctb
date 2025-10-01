import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { jsonToCtb } from '../index.js';
import { jsonToCtbToFile } from '../node.js';

function runTest(name, fn) {
  (async () => {
    try {
      await fn();
      console.log(`\u2713 ${name}`);
    } catch (error) {
      console.error(`\u2717 ${name}`);
      console.error(error);
      process.exitCode = 1;
    }
  })();
}

runTest('jsonToCtb returns Canonical Text Block output for objects', () => {
  const result = jsonToCtb({ hello: 'world' });
  assert.ok(result.includes('hello: "world"'));
});

runTest('jsonToCtb parses JSON string input', () => {
  const result = jsonToCtb('{"greeting":"hi"}');
  assert.ok(result.includes('greeting: "hi"'));
});

runTest('jsonToCtbToFile writes to disk in Node.js environments', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'json2ctb-'));
  const outputPath = path.join(tempDir, 'output.ctb');

  try {
    const result = jsonToCtbToFile({ key: 'value' }, { output: outputPath });
    assert.ok(fs.existsSync(outputPath));
    assert.strictEqual(fs.readFileSync(outputPath, 'utf8'), `${result}\n`);
  } finally {
    try {
      fs.unlinkSync(outputPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
});

runTest('jsonToCtb remains usable when process is unavailable', () => {
  const originalProcess = globalThis.process;

  try {
    globalThis.process = undefined;
    const result = jsonToCtb({ greeting: 'hi' });
    assert.ok(result.includes('greeting: "hi"'));
  } finally {
    globalThis.process = originalProcess;
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
