---
sidebar_position: 1
---

# List of supported platforms

## Overview

The TSRPC client supports many platforms, just bring in `HttpClient` or `WsClient` from different NPM packages as needed, the API is consistent across platforms.

| Client Platform | NPM Packages |
| :-------------: | :----------: |
|  tsrpc-browser  |
|  tsrpc-miniapp  |
|     NodeJS      |    tsrpc     |

For example, for use under the browser project, this corresponds to the `tsrpc-browser` library, which is first installed as follows.

```shell
npm i tsrpc-browser
```

All of the above libraries already come with their own TS type definitions, so just follow the code hints to reference them: ```ts

```ts
import { HttpClient } from 'tsrpc-browser'
import { WsClient } from 'tsrpc-browser'
import { serviceProto } from '. /shared/protocols/serviceProto'

const client1 = new HttpClient(serviceProto, {
  server: 'https://xxx.com/api',
  logger: console,
})

const client2 = new WsClient(serviceProto, {
  server: 'https://xxx.com/api',
  logger: console,
})
```

See the next section [using-client](use-client) for more details on client usage.

## Using under cross-platform projects

For example, if you are using a cross-platform front-end framework like [uni-app](https://uniapp.dcloud.io/) or [Taro](https://taro.aotu.io/) to implement an application that needs to support multiple ends at the same time (e.g. browser + WeChat applet + Android App + iOS App).
Then you need to choose the corresponding client library according to the actual running platform.
Since the TSRPC API is renamed between libraries on different platforms, you need to manually `as` an alias when `import`, e.g.

```ts
import { HttpClient as HttpClientBrowser } from 'tsrpc-browser';
import { HttpClient as HttpClientMiniapp } from 'tsrpc-miniapp';
import { serviceProto } from '. /shared/protocols/serviceProto';

// Create the corresponding Client according to the actual running platform
export const client = is a WeChat applet ?
    // WeChat applets use tsrpc-miniapp
    new HttpClientMiniapp(serviceProto, {
        server: 'https://xxx.com/api',
        logger: console
    })
    // Browser and native environments use tsrpc-browser (XMLHttpRequest-compatible environments can use tsrpc-browser)
    : new HttpClientBrowser(serviceProto, {
        server: 'https://xxx.com/api',
        logger: console
    });
```

## Using in Cocos Creator

Currently Cocos Creator 2.x and 3.x versions are perfectly supported.

Since Cocos Creator is naturally well supported by NPM, you don't need to configure it additionally, just refer to the above example `npm install` and `import`.
If your project is cross-platform, you will also need to create a client based on the platform you are running on, as in the example above.
