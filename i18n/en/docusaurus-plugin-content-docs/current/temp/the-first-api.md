---
sidebar_position: 2
---

# First API

The API is essentially an **asynchronous function** that is implemented on the Server side and called on the Client side.

The input parameter to this asynchronous function is called a request (`Request`) and the output is called a response (`Response`).
The file that defines a request and response pair is called a `Protocol`.

To implement an API, you first need to define its protocol.

## Defining protocols

### Naming convention

All protocols are located in the `backend/src/shared/protocols` directory, which is called the **protocols directory**.

All files in the protocols directory and its subdirectories named `Ptl*.ts` are considered **protocols**, and `*` is resolved to **protocols name**, e.g.

| protocol file path           | protocol name |
| ---------------------------- | ------------- |
| `protocols/PtlGetData.ts`    | `GetData`     |
| `protocols/user/PtlLogin.ts` | `Login`       |

:::note

- The prefix `Ptl` stands for the abbreviation `Protocol`.
- The protocol name depends only on the filename and is not affected by the path where it is located.
  :::

### Requests and responses

A protocol file corresponds to an API interface. Therefore, within the protocol file, there must be 2 `export` type definitions.

- Request: `Req${protocol name}`
- Response: `Res${protocol name}`

:::note

- `Req` is an abbreviation for `Request` and `Res` is an abbreviation for `Response`.
- The type definition can be either `interface` or `type`.
  :::

Suppose we want to implement an interface `HelloWorld`, create the file `PtlHelloWorld.ts` in the protocol directory, for example.

```ts title="backend/src/shared/protocols/PtlHelloWorld.ts"
export interface ReqHelloWorld {
  name: string
}

export type ResHelloWorld = {
  reply: string
  time: Date
}
```

As you can see, TSRPC uses the original TypeScript to define the protocol without additional comments, and also supports more types (e.g. `Date`, `ArrayBuffer`, `Uint8Array`, etc.)

### Generate ServiceProto

`ServiceProto` is the real protocol definition file for TSRPC, execute the following command to generate it automatically.

```shell
cd backend
npm run proto
```

:::tip
TSRPC works based on ServiceProto, so this procedure should be re-run whenever the protocol is changed.
:::

### Shared code

Now you see a `proto.ts` generated into the `backend/src/shared/protocols` directory, this file is the entire contents of the protocol.
Front-end projects also need these files to work properly, as well as to get better code hints.
So, we need to synchronize the protocols directory `protocols` to the front-end project.

Further, you may have other code that can be reused between the front and back ends. For example, business code such as form validation rules, date formatting methods, etc. So we designed the `src/shared` directory, which represents all the code shared between the front and back ends. There are many ways to implement the sharing and synchronization mechanism, we default to manual synchronization: 1.

1. the contents of `src/shared` should be edited in `backend` and then synchronized to `frontend` (read-only).
2. Execute `npm run sync` under `backend` to complete the sync manually.

```shell
cd backend
npm run sync
```

:::tip
You can also use a soft link (Symlink) or other tool to automate syncing.
:::

At this point, the API protocol is defined, generated, and synced.

## Implementing the API

### Naming convention

The entry files of API interfaces are all located in `backend/src/api` directory, which correspond to the protocol files in the protocol directory one by one, except that the prefix `Ptl` is changed to `Api`.

For example, the protocol directory file structure is as follows.

```
|- backend/src/shared/protocols
    |- user
        |- PtlLogin.ts protocol user/Login
    |- PtlGetData.ts protocol GetData
    |- SomeOtherFile.ts is not considered a protocol because the file name is not prefixed with Ptl
```

then the corresponding API implementation directory structure should be

```
|- backend/src/api
    |- user
        |- ApiLogin.ts protocol user/Login implementation
    |- ApiGetData.ts implementation of the GetData protocol
```

### Naming convention

As with the **protocol directory**, the

## Calling the API

### Call path

The client calls the remote API based on the **call path**, which is `protocol path/protocol name`, for example, as follows

| protocol file path                    | call path    |
| ------------------------------------- | ------------ |
| `Protocol directory/PtlGetData.ts`    | `GetData`    |
| `Protocol directory/user/PtlLogin.ts` | `user/Login` |
