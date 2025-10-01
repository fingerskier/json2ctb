# json2ctb
Ingest JSON data and excretes Canonical Text Blocks

## CTB

A Canonical Text Block is meant to be a natural-language representation of data.


## Usage

The package now ships as an ES module that can be consumed from Node.js or bundled for the browser without pulling in Node-only dependencies.

Generate a Canonical Text Block from a JavaScript value or JSON string:

```js
import { jsonToCtb } from 'json2ctb';

const block = jsonToCtb({
  id: 'user-123',
  name: 'Ada Lovelace',
  role: 'Engineer',
});

console.log(block);
```

The conversion accepts an optional `ignore` array that augments the default ignored keys (`['id', 'realmId', 'owner']`).

```js
const block = jsonToCtb(data, { ignore: ['createdAt', 'updatedAt'] });
```

### Writing to disk in Node.js

For Node.js workflows you can opt into synchronous file output by importing the Node-flavoured helper:

```js
import { jsonToCtbToFile } from 'json2ctb/node';

const block = jsonToCtbToFile(data, { output: 'output.ctb' });
```

The helper resolves `output` relative to the current working directory and writes the rendered Canonical Text Block to disk.

## Examples

- `examples/deep/example.json` – Nested data that exercises hierarchical rendering.
- `examples/multi-records.json` – Multiple record types with IDs and cross references between datasets.
