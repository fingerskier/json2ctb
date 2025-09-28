const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { jsonToCtb } = require('..');

function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('jsonToCtb returns Canonical Text Block output for objects', () => {
  const result = jsonToCtb({ hello: 'world' });
  assert.ok(result.includes('hello: "world"'));
});

runTest('jsonToCtb writes to disk when output is provided in Node.js environments', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'json2ctb-'));
  const outputPath = path.join(tempDir, 'output.ctb');

  try {
    const result = jsonToCtb({ key: 'value' }, { output: outputPath });
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

runTest('jsonToCtb throws a descriptive error when output is requested without process.cwd', () => {
  const originalProcess = global.process;

  try {
    // Simulate a non-Node.js environment where process is not defined.
    global.process = undefined;

    assert.throws(
      () => jsonToCtb({ name: 'Test' }, { output: 'out.ctb' }),
      /requires a Node\.js environment/
    );
  } finally {
    global.process = originalProcess;
  }
});

runTest('jsonToCtb still returns output when process is unavailable and no file output is requested', () => {
  const originalProcess = global.process;

  try {
    global.process = undefined;
    const result = jsonToCtb({ greeting: 'hi' });
    assert.ok(result.includes('greeting: "hi"'));
  } finally {
    global.process = originalProcess;
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
