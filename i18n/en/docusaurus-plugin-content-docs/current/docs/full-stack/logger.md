---
sidebar_position: 1
---

## Logger log management

## Overview

A well-engineered application, whether front-end or back-end, must have logs.
Although you can use `console.log` to print logs, it can be a bit tricky when faced with some special scenarios.
For example.

**server side**

- you want the API logs to be laid out in a fixed format (e.g. adding IP addresses, logged-in user IDs as prefixes)
- Output logs to a file, or even to a different format (e.g. JSON)
- Report logs to a remote log collection service (e.g. LogTail, LogStash)

**Client**

- Report and count exception logs
- Hide logs (to prevent cracking), but show them to developers (for easy debugging)

To facilitate the extension of the logging process, TSRPC abstracts a unified log management type: `Logger`.

## Logger

`Logger` is an abstract log exporter defined in TSRPC's public dependency library `tsrpc-proto`.

``ts
export interface Logger {
debug(... .args: any[]): void;
log(... . args: any[]): void;
warn(... . args: any[]): void;
error(... .args: any[]): void;
}

````

As with `console`, we define 4 logging levels and their output methods: `debug`, `log`, `warn`, `error`.
Obviously, `console` is a legitimate `Logger`.

All of TSRPC's Servers and Clients are initialized with a `logger` parameter, which TSRPC uses to output all internal logs.
You can modify the `logger` configuration at initialization to customize the logging output process.
`Server` defaults to `TerminalColorLogger` (which outputs logs with color and time to the console), and `Client` defaults to `undefined` (which outputs no logs).

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="server"
  values={[
    {label: '服务端', value: 'server'},
    {label: '客户端', value: 'client'},
  ]}>

  <TabItem value="server">

```ts
let server = new HttpServer(serviceProto, {
    logger: myLogger
})
```

  </TabItem>

  <TabItem value="client">

```ts
let client = new HttpClient(serviceProto, {
    logger: myLogger
})
```

  </TabItem>
</Tabs>

## Server-side logging

On the server side, you should try to avoid using `console` directly, and instead use the `logger` of each of `Server`, `Connection`, and `Call`, e.g.

```ts
server.logger.log('This is server-level log')
conn.logger.log('This is connection-level log')
call.logger.log('This is call-level log') // call is ApiCall or MsgCall
```

where `conn.logger` adds an additional prefix to `server.logger`, such as the IP address.
`call.logger` will add additional prefixes to `conn.logger`, such as the API call path.

! [](assets/log.png)

Adding prefixes based on the parent `Logger` is done through `tsrpc`'s built-in `PrefixLogger`.
You can also add or modify these prefixes yourself, for example by adding the user ID to the prefix of `call.logger`.

```ts
call.logger.prefixs.push('UserID=XXXX')
```

:::note
TSRPC Server is designed as a three-tier `Server` -> `Connection` -> `Call` structure, with a top-down one-to-many relationship.
(The exception is HTTP short connections, where 1 `Connection` corresponds to only 1 `Call`)
:::

Even if there is some public code that does not appear directly in the API implementation code, but may be called indirectly by the API, it is recommended that you pass `Logger` as a parameter.
For example, if you have a public payment method `PayUtil.pay`, there are many APIs that will call it to make a payment, and each payment will leave a log entry.
When there is a billing problem and you consult these logs, you will want to know exactly which API initiated these payment requests.
At this point, passing in `logger` from `ApiCall` can be very useful.

```ts
export class PayUtil {
  static pay(
    username: string,
    amount: number,
    productId: string,
    logger?: Logger
  ) {
    logger?.log(`${username} paid ${amount} for product ${productId}`)
  }
}
```

:::note
This doesn't affect its compatibility with other projects, after all you can always pass `console` as a legitimate `Logger`.
:::

## Example

If we want to report exception logs while hiding DEBUG level logs, for example, we can create a custom `Logger` that

``ts
let logger: Logger = {
debug(... .args: any[]): ()=>{
// does nothing, which is equivalent to hiding the log
};
log(... .args: any[]): ()=>{
// Let the log still output to the console
console.log(... .args);
// LOG level logs will not be reported
});
warn(... .args: any[]): ()=>{
// Let the logs still be output to the console
console.warn(... .args);
// WARN logging, reporting
report log method(... .args);
};
error(... .args: any[]): ()=>{
// Make the log still output to the console
console.error(... .args);
// ERROR log, report
report log method(... .args);
};
}

````

Another example is when we are on the client side and want to hide the log from normal users but make it visible to developers: the

```ts
// Set a hidden trigger (e.g. with the help of localStorage)
let logger = localStorage.getItem('debug') === 'yes' ? console : undefined

let client = new HttpClient(serviceProto, {
  server: 'http://127.0.0.1',
  logger: logger,
})
```

:::tip
The client defaults to `logger: undefined`, where all client logs will be hidden, which helps to raise the crack threshold.
:::
