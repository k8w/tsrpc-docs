---
sidebar_position: 1
---

# Introduction

## What Is TSRPC 

TSRPC is a TypeScript RPC framework for browser Web applications, WebSocket real-time applications, NodeJS microservices, and other scenarios.

<!-- Today, more and more teams are using TypeScript + NodeJS to develop backend services.
NodeJS greatly lowers the barrier to full-stack development, while TypeScript provides the most powerful type detection system ever.
Sharing logic code and type definitions between frontend and backend greatly improves development efficiency. -->

Currently, most projects are still using traditional Restful API for frontend and backend communication, which has some pain points.
1. Relying on documentation for protocol definition, frontend and backend linkage is often plagued by low-level errors (such as field case errors, field type errors, etc.).
2. Some frameworks implement the protocol definition specification but require the introduction of [Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#decorators) or a third-party IDL language.
3. Some frameworks implement type-checking but are unable to support TypeScript's advanced types, such as:
```ts
// userinfo
interface UserInfo {
  // source type
  from: { type: 'Invitation', fromUserId: string }
    | { type: 'Promotional links', url: string }
    | { type: 'Direct access' },
  // registeration time
  createTime: Date
}
```
4. JSON supports limited types, for example `ArrayBuffer` is not supported, which makes file uploads implementation very troublesome.
5. The request and response are plaintext, the cracking threshold is too low, and the string encryption is limited and not strong enough.
6. etc.

We couldn't find an off-the-shelf framework that solved these problems perfectly, so we completely redesigned and created **TSRPC** 。

## Overview

A protocol called `Hello`, from definition and implementation to browser invocation.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="protocols"
  values={[
    {label: 'Protocol Definition', value: 'protocols'},
    {label: 'Server-side implementation', value: 'server'},
    {label: 'Client-side invocation', value: 'client'},
  ]}>
  <TabItem value="protocols">

```ts
export interface ReqHello {
  name: string;
}

export interface ResHello {
  reply: string;
}
```

  </TabItem>

  <TabItem value="server">

```ts
import { ApiCall } from "tsrpc";

export async function ApiHello(call: ApiCall<ReqHello, ResHello>) {
  call.succ({
    reply: 'Hello, ' + call.req.name
  });
}
```

  </TabItem>

  <TabItem value="client">

```ts
let ret = await client.callApi('Hello', {
    name: 'World'
});
console.log(ret); // { isSucc: true, res: { reply: 'Hello, World' } }
```

  </TabItem>
</Tabs>

## 特性
TSRPC has some unprecedented and powerful features that give you the ultimate development experience.

- 🥤 **Pure TypeScript**
  - Define protocols directly based on TypeScript `type` and `interface`
  - No additional annotations, no Decorator, no third-party IDL language
- 👓 **Automatic type checking**
  - Automatic type checking of input and output at compile time and run time
  - Always type safe, write business code with confidence
- 💾 **Binary serialization**
  - Smaller transfer size than JSON
  - More data types than JSON: e.g. `Date`, `ArrayBuffer`, `Uint8Array`, etc.
  - Convenient implementation of binary encryption
- 🔥 **The most powerful TypeScript serialization algorithm ever**
    - Serialize type definitions in TypeScript source code directly without any annotations
    - The first and currently the only binary serialization algorithm that supports TypeScript's advanced types, including
      - [Union Type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
      - Intersection Type](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
      - Pick Type](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)
      - [Partial Type](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)
      - [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
      - etc.
- ☎ **Multi-protocol**
  - Simultaneous HTTP / WebSocket support
- 💻 **Multi-platform**
  - NodeJS / Browser / App / Applet
- ⚡️ **High Performance**
  - Single core single process 5000+ QPS throughput (tested on Macbook Air M1, 2020)
  - Unit testing, stress testing, DevOps solutions all in place
  - Proven in several 10 million user level projects


## Compatibility

Fully compatible with TSRPC on the Server side and with traditional front ends.

- **Compatible with Restful API calls in JSON form**
  - Can use `XMLHttpRequest`, `fetch` or other AJAX frameworks to call the interface as JSON by itself
- **Compatible with pure JavaScript project use**
  - You can use TSRPC Client in pure JavaScript projects and enjoy type checking and serialization features
- **Compatible with Internet Explorer 10**
  - Browser-side compatibility up to IE 10, Chrome 30

<! -- ## Differences with other frameworks
- ExpressJS / KoaJS
  - No WebSocket support
  - No strong types
- SocketIO
  - No strong types
  - HTTP is not supported
- gRPC
  - Must rely on third-party IDL language (Protobuf)
  - Type features are not as powerful as TypeScript -->

## Start learning

While there are many new, exciting and powerful features
But as you can see on [Github](https://github.com/k8w/tsrpc), TSRPC is actually a mature framework that has been open source for over 4 years. Although it hasn't been documented or promoted much, we have used it to develop several projects with millions of DAUs and millions of users, reaching over 100 million+ online users.

Sorry for the lateness of this document, and hope it will help you in your work.

[Start learning TSRPC](get-started/create-tsrpc-app.md)