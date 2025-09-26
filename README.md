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

`config` is optional and may contain ignored properties and ...

Defaults:
```
{
    ignore: ['id', 'realmId', 'owner']
}
```