---
sidebar_position: 1
---

# 介绍

## TSRPC是什么

TSRPC 是一个面向 TypeScript 的 RPC 框架。

<!-- 现如今，正有越来越多的团队使用 TypeScript + NodeJS 开发后端服务。
NodeJS 极大的降低了全栈开发的门槛，而 TypeScript 提供了史上最强大的类型检测系统。
在前后端之间共享逻辑代码和类型定义，极大的提升了开发效率。 -->

目前，大多数项目仍在使用传统的 Restful API 进行前后端通信，这存在一些痛点。
1. 依赖文档进行协议定义，前后端联调常被低级错误困扰（如字段名大小写错误，字段类型错误等）。
2. 一些框架虽然实现了协议定义规范，但需要引入 [Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#decorators) 或第三方 IDL 语言。
3. 一些框架虽然实现了类型校验，但无法支持 TypeScript 的高级类型，例如不支持这样业务中常见的定义：
```ts
type Shape = BaseShape & (Circle | Rect);
```
3. JSON 支持的类型有限，例如不支持 `ArrayBuffer`，实现文件上传会非常麻烦。
4. 请求和响应都是明文，破解门槛太低，字符串加密方式有限且强度不够。
5. 等等...

我们已经无法找到一个能完美解决这些问题的现成框架，于是我们全新设计和创造了 **TSRPC**，从 4 年前开始。

## 特性
TSRPC 具有一些前所未有的强大特性，给您带来极致的开发体验。

- 🥤 **原汁原味 TypeScript**
  - 直接基于 TypeScript `type` 和 `interface` 定义协议
  - 不需要额外注释，没有 Decorator，没有第三方 IDL 语言
- 👓 **自动类型检查**
  - 在编译时刻和运行时刻，自动进行输入输出的类型检查
  - 总是类型安全，放心编写业务代码
- 💾 **二进制序列化**
  - 比 JSON 更小的传输体积
  - 比 JSON 更多的数据类型：如 `Date`, `ArrayBuffer`, `Uint8Array` 等
  - 方便地实现二进制加密
- 🔥 **史上最强大的 TypeScript 序列化算法**
    - 不需要任何注解，直接实现将 TypeScript 源码中的类型定义序列化
    - 首个也是目前唯一支持 TypeScript 高级类型的二进制序列化算法，包括：
      - [Union Type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
      - [Intersection Type](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
      - [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
      - [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
      - 等等
- ⚡️ **高性能**
  - 单 CPU 核 2500+ QPS 吞吐量
  - 单元测试、压力测试、DevOps 方案齐备
- 💻 **多终端支持**
  - NodeJS / 浏览器 / App / 小程序
- ☎ **多协议支持**
  - HTTP / WebSocket


## 兼容性

完全可以在 Server 端使用 TSRPC，同时兼容传统前端。

- **兼容 JSON 和 Restful API 调用**
  - 可自行使用 `XMLHttpRequest` 或其它 AJAX 框架调用接口（JSON）
- **兼容纯 JavaScript 的项目使用**
  - 可在纯 JavaScript 项目中使用 TSRPC Client，也能享受类型检查和序列化特性

<!-- ## 与其它框架的区别
- ExpressJS / KoaJS
  - 不支持 WebSocket
  - 没有强类型
- SocketIO
  - 没有强类型
  - 不支持 HTTP
- gRPC
  - 必须依赖第三方 IDL 语言（Protobuf）
  - 类型特性不如 TypeScript 强大 -->

## 开始学习

虽然有诸多新鲜、令人激动的强大特性，
但就像你能在 Github 上看到的那样，TSRPC 其实是一个已经开源超过 4 年的成熟框架。虽然一直没写文档，也没怎么推广，但我们已经使用它开发了若干个百万级DAU、千万级用户的项目，累计覆盖超过1亿+线上用户。

对于这份文档的迟到感到抱歉，但希望能对你的工作有所帮助。

[开始学习 TSRPC](get-started/installation.md)