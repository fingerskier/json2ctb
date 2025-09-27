# json2ctb
Ingest JSON data and excretes Canonical Text Blocks

## CTB

A Canonical Text Block is meant to be a natural-language representation of data.


## Usage

initialize the module:

```
import {JSON2CTB} from 'json2ctb'
const json2ctb = new JSON2CTB(config)
```

`config` is optional and may contain:

```
{
    ignore: ['id', 'realmId', 'owner'],
    output: undefined
}
```

- `ignore`: An array of property names that should be excluded when rendering the Canonical Text Block.
- `output`: An optional file path. When provided, the generated Canonical Text Block will be written to this location in addition to being returned.