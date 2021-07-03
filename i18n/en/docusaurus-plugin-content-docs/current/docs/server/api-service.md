---
sidebar_position: 3
---

## API Service

## What is API Service

An API Service is a service based on the request/response model, where the request parameters are obtained from the client, processed by the server, and a response is returned.
The response is mandatory, whether or not the request is received and processed correctly by the server, the client will receive an explicit reply, both in the form of success and error.
This process is implemented on the server side as an asynchronous function.

## Implementing an API

An implementation of an API Service is an asynchronous function, a blank API implementation function, with the following template.

```ts
export async function ApiXXX(call: ApiCall<ReqXXX, ResXXX>) {}
```

### ApiCall

The implementation function has one parameter `call: ApiCall<ReqXXX, ResXXX>`, by which we get the request parameters and return the response.

#### Print logs

In an API implementation function, you should use `call.logger` to print the log, not `console`.

```ts
call.logger.log('xxxxx')
```

This is because a `Server` always processes multiple requests in parallel, so the logs of multiple requests are combined together and you can hardly distinguish them.
`call.logger` will automatically add some prefixes to the log messages, such as connection ID, request ID, which makes it easier to filter the logs of the same request when you are debugging.

! [](assets/log.png)

If you want to modify these prefixes, for example in a prefix [Flow](. /flow/flow) that resolves the login state, you want to add the logged-in user ID to the prefix of each request log.
This can be modified with `call.logger.prefixes`, e.g.

```ts
call.logger.prefixs.push('UserID=123456')
```

#### gets the request parameters

`call.req` is the request parameter sent by the client, which corresponds to the protocol type named `Req{interface name}`.
As soon as an `ApiCall` is parsed, the `Server` performs automatic type detection on it.
So whether implementing a function or [Flow](... /flow/flow), `call.req` **must be type-safe**.

:::note
In fact, since TSRPC is binary serialized (not `JSON.stringify`), the wrong type cannot be transferred at all.
:::

#### returns a response or error

The API interface also returns to the client via `call`, in both success and error cases.

A successful response is returned by `call.succ(res)`, which corresponds to the `Res{interface name}` type defined in the protocol.

The error response is returned by `call.error(message, data?)`.
The first parameter, `message`, should be a human-readable error message, such as "insufficient balance", "wrong password", etc.
The 2nd parameter, optional, is additional information about the error, and can be passed any field (e.g. error code) that can be fetched on the client side.

All errors returned to the client are encapsulated in a `TsrpcError` object.

#### Other

- The `Connection` that transmitted the request can be retrieved via `call.conn`.
- The `Server` can be retrieved via `call.server`.

### TsrpcError

All errors returned to the client by the TSRPC server are encapsulated as `TsrpcError` with the following type definition.
``ts
export class TsrpcError {
// Human-readable error message
message: string;
// Error type
type: TsrpcErrorType;
// Error code
code?: string | int;

    // Any field can be passed in
    [key: string]: any;

    // Two constructors, consistent with call.error()
    constructor(data: TsrpcErrorData);
    constructor(message: string, data?: Partial<TsrpcErrorData>);

}

```

It is easy to see that its constructor parameters are the same as `call.error`. This is because `call.error` is actually equivalent to constructing a `TsrpcError` object and returning it to the front-end.

#### Error Types

Generally the errors that you return from the active `call.error` in the API are business errors.
But in addition, there are many other errors that the client may encounter during the API call.
For example, network errors, exceptions caused by errors reported by server-side code, exceptions caused by errors reported by client-side code, and so on.
All these errors are included in `TsrpcError`, and we distinguish them by `type`. When you use `call.error`, the error type is set to `TsrpcError.Type.ApiError` by default.

All error types are defined below, and you can use this enumeration with ``TsrpcError.Type``.

``ts
export enum TsrpcErrorType {
    /** NetworkError */
    NetworkError = "NetworkError",
    /* Internal server-side exceptions (e.g. code reporting errors) */
    ServerError = "ServerError",
    /* Internal client-side exception (e.g. code error) */
    ClientError = "ClientError",
    /* Business error */
    ApiError = "ApiError"
}
```

#### error code

You may also notice that `TsrpcError` has a default error code field `code`, but it is **optional**.

This is because in real-world projects we find that for the vast majority of projects that don't have multilingual requirements, the error code isn't really useful.
In contrast, a human-readable error message is much more user-friendly, both for developers to debug and for displaying directly in the front-end interface.
That's why TSRPC makes `message` a required field and `code` an optional field that you can use when you have a specific need.

For example, there is a common error called `you are not logged in`, and wherever the front-end receives this type of error, it should jump to the login screen.
In this scenario, we need to recognize this error of the specified type.
Although you can also identify it by `message`, that is always unreliable and will not work if the error text is changed one day. This can be done with a specific error code `code`, which can be an integer or a string.
We prefer to use strings because it is easier to debug with a clear and easy-to-read error message than reducing the transmission by a few bytes, e.g.

```ts
call.error('You are not logged in yet', {
  code: 'NEED_LOGIN',
})
```

### Organizing the code

As a project grows in size, it is unlikely that all of the code implementing an API interface will be in one file.
At the same time, we may also have the need to reuse the same piece of business logic code for multiple interfaces.
In short, we need to split the code and call them in the API interface.

So the question arises, what to do with the hierarchical logging and error responses mentioned above if not within the API implementation function?

#### 1. Pass `logger` as a parameter

Passing `logger: Logger` as a parameter to an external public function makes it easy to handle hierarchical logging in the case of multiple API reuse.

```ts
export class SomeUtil {
  static someFunc(logger?: Logger) {
    logger?.log('xxxx')
  }
}
```

:::note
This doesn't affect its compatibility with non-TSRPC projects, after all you can always pass `console` as a legitimate `Logger`.
:::

#### 2. `throw new TsrpcError()`

Imagine you're developing a `buy item` API interface and the business process looks like this.

! [](assets/throw-new-error.svg)

As you can see, when you split up the business logic and call it through the layers, you end up with an error message to return to the top-level caller.
The actual chain in the business may be longer than that! Typically we might handle this in one of these 2 ways.

1. cascade the error message back, then do error detection at each call in the API implementation, and `call.error` if a business error is found.
   - **Problem:** Very cumbersome and adds significant code; you have to detect errors everywhere, and forgetting one can cause problems.
2. Pass `call` backwards in layers, taking the passed `call` to `call.error` where the actual error occurs.
   - **Problem:** Very inelegant and equivalent to coupling pure business logic with the TSRPC framework, which does not facilitate their cross-project use.

**TSRPC gives a new solution: `throw new TsrpcError()`**

```ts
import { TsrpcError } from 'tsrpc';

export class chargeback module {
    chargeback(logger?: Logger){
        if(insufficient balance){
            throw new TsrpcError('Insufficient balance', {
                code: 'NOT_ENOUGH_MONEY'
            })
        }
    }
}
```

TSRPC constrains the API interface implementation function to throw an exception if any method is called via `throw`.

- If the error thrown is `TsrpcError`, it is considered to be an error **that can be returned directly to the client**, and is automatically returned to the client via `call.error`.
- If not, it is considered as an error reported by the server-side code and will return an error of `type` as `ServerError` to the client with the default error message `"Server Internal Error"`.

Accordingly, because of the exception thrown by `throw`, the API implementation function will also abort execution.
Therefore, `throw new TsrpcError` is an elegant and concise way to return errors directly to the client regardless of the call hierarchy when business code is split outside of the API implementation function.

### Caution

`call.succ()` and `call.error()` are two function calls that send return data to the client immediately after execution, but this **is not the same as the end of execution of the **implementation function.
It is fundamentally different from `return` and `throw`.

For example, this is a `buy item` interface.

```ts
export async function ApiBuy(call: ApiCall<ReqBuy, ResBuy>) {
    if(insufficient balance){
        call.error('balance is low yo~');
        // return;
    }

    ship();
    call.succ({
        result: 'Purchase successful'
    })
}
```

Assuming the `insufficient balance` is hit, `call.error` is executed to return an error.
But since there is no `return` after this, the code continues to execute backwards anyway, all the way `shipping()` until `call.succ`.
Although the framework provides protection so that only the first return takes effect, `shipping()` is executed anyway.
Although the balance is insufficient, but shipped, on behalf of the majority of the white whoring party thank you in advance.

**So, please keep in mind:**

After `call.error` or `call.succ`, if this is not the last line of code but the process ends here, always remember to `return`.

## Mounting to Server

After implementing an API interface, you need to mount it to `Server` in order to provide services to the public.

### Automounting

If you created the project using `npx create-tsrpc-app@latest`, this is the default form.
In `backend/src/index.ts` you can see a line of code like this

```ts
await server.autoImplementApi(path.resolve(__dirname, 'api'))
```

`server.autoImplementApi` is to automount the API in the target folder, the rule is

- Find all `PtlXXX.ts` files according to the directory structure under the protocols directory (`protocols`), and find the corresponding file (`Ptl` prefix to `Api`) under the specified API directory.
  - For example `protocols/a/b/c/PtlXXX.ts` corresponds to `api/a/b/c/ApiXXX.ts`.
- Then under that file, look for an export function with the same name as `ApiXXX` and make that function available to the public as an implementation of `PtlXXX`, e.g.

```ts
export async function ApiXXX(call: ApiXXX<ReqXXX, ResXXX>) {}
```

- If the function of the same name for `ApiXXX` is not found under that file, then `default` is used as the implementation function, e.g.

```ts
export default async function (call: ApiXXX<ReqXXX, ResXXX>) {}
```

### Manual mounts

In addition to automounting, you can also mount manually, e.g.

```ts
server.implementApi('a/b/c/XXX', (call) => {
  // API implementation part
})
```

It is recommended that you mount all the API implementation functions before calling ``server.start()` to start the service.
