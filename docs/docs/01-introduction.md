---
id: introduction.html
description: TSRPC 是专为 TypeScript 设计的 RPC 框架，适用于 HTTP API、WebSocket 实时应用、NodeJS 微服务，经千万级用户验证。比 JSON 更强大，类型安全，支持二进制传输。
keywords:
  - tsrpc
  - ts-rpc
  - typescript rpc
  - ts nodejs
  - typescript nodejs
  - websocket
  - nestjs
  - expressjs
  - koa
  - eggjs
---

# 介绍

## TSRPC 是什么

> TSRPC 是专为 TypeScript 设计的 RPC 框架，经千万级用户验证。<br/>
适用于 HTTP API、WebSocket 实时应用、NodeJS 微服务等场景。

一直以来，前后端通信都存在着一些痛点。

1. 依赖文档或第三方语言定义协议，沟通成本高，维护难度大。
1. 缺乏类型安全，前后端联调常被拼写等低级错误困扰，甚至埋下安全隐患。
1. JSON 支持的类型有限，发送二进制数据 `ArrayBuffer` 、处理 `Date` `ObjectId` 等类型转换都很麻烦。
1. 请求和响应都是明文，极易抓包破解，字符串加密方式有限，二进制序列化门槛太高。
1. 实时类业务增多，但 HTTP、WebSocket 技术框架各异，一套代码难以兼容。
1. Serverless 日渐成熟，容器、云函数各有千秋，但不同云厂商标准不一，一套代码难以兼容。
1. 前端平台日趋多样，浏览器、小程序…… 网络请求各有差异，一套代码难以兼容。
1. 所有的现存框架，都无法支持 TypeScript 的高级类型，如 [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)、[Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)、[Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) 等。

我们无法找到一个能完美解决这些问题的现成框架，于是我们全新设计和创造了 **TSRPC** 。


## 特性
TSRPC 具有一些前所未有的强大特性，给您带来极致的开发体验。

- 🥤 **原汁原味 TypeScript**
  - 直接基于 TypeScript 的 `type` 和 `interface` 定义协议
  - 无需装饰器、注解、第三方语言
  - 支持 TypeScript 高级类型，如 [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)、[Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)、[Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) 等。
- 👓 **类型安全**
  - 开发时全程代码提示，避免低级错误
  - 运行时自动参数校验，总是类型安全
- 🔥 **更强的 JSON**
  - 支持在 JSON 中传输更多数据类型
  - 例如 `ArrayBuffer`、`Date`、`ObjectId`
- 💾 **支持二进制传输**
  - 可将 TypeScript 类型直接编码为二进制
  - 包体更小、更易加密、无需 Protobuf
- 🔥 **支持 Serverless**
  - 同时支持 Serverless 云函数和容器化部署
  - 兼容阿里云、腾讯云、AWS 标准
- 🔥 **一键生成接口文档**
  - 一键生成多种格式的接口文档
  - 例如 Swagger / OpenAPI / Markdown
- ☎ **多协议**
  - 同时支持 HTTP / WebSocket
  - 传输协议无关的架构，轻松扩展至任意信道
- 💻 **跨平台**
  - 浏览器 / 小程序 / App / NodeJS 多平台支持
  - 兼容 Restful API 调用，兼容 Internet Explorer 10
- ⚡️ **高性能**
  - 单核单进程 5000+ QPS 吞吐量（测试于 Macbook Air M1, 2020)
  - 经过数个千万用户级项目验证，单元测试、压力测试、DevOps 方案齐备

## 概览

API 接口本质上是一个服务端实现、客户端调用的异步函数，
编写一个接口主要分为 3 步。

**1. 定义协议**

接口的输入参数叫做 **请求**，返回值叫做 **响应**，定义协议就是定义这两个数据类型。

```ts
import { ObjectId } from 'mongodb';

// 请求
export interface ReqSendMessage {
  message: { type: '文字', data: string } | { type: '语音', data: Uint8Array },
  time: Date
}

// 响应
export interface ResSendMessage {
  msgId: ObjectId
}
```

利用 TSRPC 的强大特性，使用条件类型、发送二进制数据、处理 `ObjectId` `Date` 类型转换都不再是问题。

**2. 服务端实现**

服务端的实现就是一个简单的异步函数，框架会确保输入和输出的类型安全，非法请求将被自动拦截。

```ts
export async function ApiSendMsg(call: ApiCall<ReqSendMsg, ResSendMsg>) {
    // 写入数据库
    let opInsert = await db.collection('Message').insertOne(call.req);

    // 返回响应
    call.succ({
        msgId: opInsert.insertedId
    })
}
```

**3. 客户端调用**

客户端调用远端接口，就像调用本地异步函数一样简单，全程享有代码提示和类型检查。

![全程代码提示](assets/code-hint.gif)


## 开始学习

虽然有诸多新鲜、令人激动的强大特性，
但就像你能在 [Github](https://github.com/k8w/tsrpc) 上看到的那样，TSRPC 其实是一个已经开源超过 4 年的成熟框架。虽然一直没写文档，也没怎么推广，但我们已经使用它开发了若干个百万级DAU、千万级用户的项目，累计覆盖超过1亿+线上用户。

对于这份文档的迟到感到抱歉，希望能对你的工作有所帮助。

[开始学习 TSRPC](get-started/create-tsrpc-app)

:::note 扫码加入微信交流群 （请注明来意）
![](assets/wechat.png)
:::