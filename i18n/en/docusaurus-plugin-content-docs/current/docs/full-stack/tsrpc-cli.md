---
sidebar_position: 1.1
---

# tsrpc-cli command line tools

```
Usage notes.

    tsrpc proto <options> Generate TSRPC Proto file
        -i, --input <folder> Path to the protocol folder used to generate the Proto
        -o, --output <file> The path of the output file, not specified will be output directly to the command line
                                            -o XXX.ts and -o XXX.json will output two different formats
        -c, --compatible <file> compatibility mode: path to the old Proto file to be compatible with (same as output by default)
        --new is not compatible with the old version and generates a new Proto file
        --ugly output is a less readable but smaller compressed format
        --verbose shows debugging information
        --ignore <glob> files to ignore from the --input scope

    tsrpc api <options> Automatically generate TSRPC API implementation
        -i, --input <file> Path to the Proto file
        -o, --output <folder> Path to the output API folder

    tsrpc sync --from <dir> --to <dir> Sync the contents of the folder to the target location in a read-only manner

    tsrpc link --from <dir> --to <dir> Create a Symlink to the source at the target location for automatic synchronization

    tsrpc build <options> Build the TSRPC backend project
        --proto <protoPath> proto file address, default is src/shared/protocols/serviceProto.ts
        --proto-dir <folder> protocols directory, defaults to the serviceProto.ts directory

    tsrpc encode <options> [exp] Encode JS expressions
        [exp] the value to encode (JS expression, e.g. "123" "new Uint8Array([1,2,3])")
        -p, --proto <file> Encode the Proto file to be used
        -s, --schema <id> encode the SchemaID to be used
        --i, --input <file> input as file, not to be used with [exp] (file content as JS expression)
        -o, --output <file> The path to the output file, not specified will be output directly to the command line
        --verbose show debugging information

    tsrpc decode <options> [binstr] Decode binary data
        [binstr] String representation of the binary data to be decoded, e.g. "0F A2 E3 F2 D9"
        -p, --proto <file> Decode the Proto file to be used
        -s, --schema <id> The SchemaID to be used for decoding
        -i, --input <file> input as file, not to be used with [binstr]
        --o, --output <file> Output file path, not specified will be output to command line
        --verbose Show debugging information

    tsrpc validate <options> [exp] Validate JSON data
        [exp] The value to validate (JS expression, e.g. "123" "new Uint8Array([1,2,3])")
        -p, --proto <file> Validate the Proto file to be used
        -s, --schema <id> Validate the SchemaID to be used
        -i, --input <file> input as file, not to be used with [exp] (file content is a JS expression)

    tsrpc show <file> Print the contents of the binary file
```

:::danger WIP
This document is still in preparation ...... Stay tuned.
:::
