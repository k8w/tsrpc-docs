---
sidebar_position: 2
---

## Protocol and runtime principles

## Runtime type detection implementation principles

It is well known that TypeScript type detection only happens at compile time, because type information (e.g. `type`, `interface`) is erased at compile time. But TSRPC can detect these erased type information at runtime as well?
Besides, the TypeScript compiler is several MB, while TSRPC is only a few tens of KB ......

In fact, this is because we follow the TypeScript type system and independently implement a lightweight type system that can do type detection and even binary serialization at runtime. It supports most of the commonly used TypeScript types. [List of supported types](... /tsrpc-inside/supported-types)

:::note
This is another independent open source project [TSBuffer](https://github.com/k8w/tsbuffer), if you have separate TypeScript data type runtime detection and serialization needs can take a look. The documentation is temporarily vacant, we will improve it in the future, and of course you can contact the living author (see the bottom of the page).
:::

## Define the protocol

### ServiceProto

In summary, TSRPC has its own set of protocol and type definitions at runtime, and this definition format is named `ServiceProto`.
Generally speaking, you don't need to go into the details of this format, as it is defined via the [command line tool](...). /full-stack/tsrpc-cli) automatically.
If you are using a project created with `npx create-tsrpc-app@latest`, the generation command is already built into the `npm run proto` of the backend project. serviceProto is automatically generated to `protocols/serviceProto.ts`.

### Define rules

`tsrpc-cli` identifies protocols entirely by **name**, which includes filenames, type names, etc.
So be sure to strictly follow the name prefixes specified by TSRPC, as you did in [previous post](...). /get-started/the-first-api#Writing Protocol Files), the naming rules are summarized below.

#### API Service

- The file name is: `Ptl{interface name}.ts` and the following items are defined in this file
- Request type name: `Req{interface name}` (must be `export`)
- The response type is named: `Res{interface name}` (must `export`)
- The additional configuration item is: `export const conf = { ... }`

#### Message Service

- The file name is: `Msg{Message name}.ts` and the following items are defined in this file
- Message type name: `Msg{Message name}`
- Additional configuration items are: `export const conf = { ... }`

The protocol information and additional configuration items can be obtained at runtime via `call.service` or `server.serviceMap`.

:::tip
Although it is specified that requests and responses must be defined within the `PtlXXX.ts` file, they are free to refer to other files of external types. However, since protocol directories are shared across projects, for convenience, you should ensure that all protocol dependencies are located inside the `shared` directory and are not referenced from `node_modules` unless you are sure that they are installed in both front and back-end projects.
:::

### Synchronizing protocols

The ServiceProto and protocol directories are also needed on the client side, so you can sync them to the client project in any way you like. Our project template has the `npm run sync` command built in for you.

If you don't check Symlink when creating your project, `npm run sync` is implemented to delete the target folder, then copy it from the backend and finally set it to read-only. The point of making it read-only is to prevent front-end changes from being overwritten by new syncs.

If you want to synchronize changes on both the front and back ends, you can enable Symlink when you create the project, where `npm run sync` just creates a shortcut to the target location. At this point, both sides are actually the same directory, so you can synchronize changes and don't need to run `npm run sync` every time.

If you're on Windows and you're using Git, Symlink may become a file when you clone a project with Symlink in it locally.
If this happens, you just need to re-run `npm run sync` in the backend directory to generate Symlink.

## Protocol changes

Since the TSRPC runtime actually resolves `ServiceProto`, whenever the protocol changes, you should run `npm run proto` to regenerate it and then `npm run sync` to sync them out.

This brings up an important question: will the regenerated `ServiceProto` remain compatible with the old one?

Each interface, type definition in TSRPC, has an ID, which is a self-incrementing number.
For example, you have 3 interfaces `PtlA`, `PtlB`, `PtlC`, which might be coded as `1`, `2`, `3`.
But imagine this situation, suppose you delete `PtlB` and add a new `PtlD`, how will the interface IDs be coded for the newly generated protocol?

Don't worry about this situation! Because when you run `npm run proto`, `tsrpc-cli` will check if there is a file with the same name at the target location, and if there is, it will read it, compare the old and new protocols and make it as compatible as possible to make sure there is no ID conflict.

Of course, there is still another possibility of conflict, where there is an incompatible change in the type itself.
For example, changing from `a: string` to `a: number`, in which case the old and new protocols are not compatible. When publishing, you can use something like blue-green publishing to prevent protocol conflicts caused by inconsistent versions of the front and back ends.
