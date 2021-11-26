---
id: type-system.html
description: TSRPC 具有独一无二的运行时类型系统，确保运行时类型安全，扩展 JSON 支持更多传输类型，轻松实现二进制序列化。
keywords:
- TSRPC
- TypeScript 类型检测
- TypeScript 运行时
- TypeScript 序列化
- typescript protobuf
- JSON Schema
- JSON ArrayBuffer
- JSON 二进制
- JSON Date
- JSON ObjectId
---

# TSRPC 类型系统

> TSRPC 是专为 TypeScript 设计的 RPC 框架

上一节中，我们介绍了 TSRPC 如何让实现和调用 API 接口变得更容易。
如果这些还不够让你动心，那么本节内容将向你介绍 TSRPC 沉淀超过 4 年、全球独一无二、最强大的核心特性 —— 运行时类型系统。

## 运行时类型系统

TSRPC 使用 TypeScript 类型来定义协议，以获得代码提示和开发时刻的类型检查。
但众所周知，TypeScript 的类型系统只在编译时刻生效，在运行时刻并不生效，这将带来很大的安全隐患。

**但 TSRPC 在运行时刻也是类型安全的。**

这得益于我们遵循 TypeScript 类型标准，全新实现了一套独立、轻量的 [运行时类型系统](../inside/types.html)。
不但实现了运行时类型检测，甚至可以基于 TypeScript 的类型定义直接完成二进制序列化，而不需要引入 Protobuf 这样的第三方语言。

### 类型安全

TSRPC 会在 API 接口函数的 **输入和输出前** 自动进行类型检测，对格式非法的请求和响应予以拦截。

- 客户端先进行一次校验，将类型不合法的请求拦截在本地。
- 服务端在执行 API 前还会做二次校验，确保进入执行阶段的 API 请求一定是类型合法的。

这意味着你放心编写业务逻辑，而不需要担心类型安全问题。

例如上一节中的 `user/Login` 接口，我们手动发送一个类型不合法的请求：
```json
{
    "username": "admin",
    "password": 12345   // 类型不合法，应该是 string
}
```

则该请求不会进入 API 实现函数中，而是被框架拦截，返回错误响应：
```json
{
    "isSucc": "false",
    "err": {
        // TODO
    }
}
```

### 字段剔除

除了确保每个字段的类型与协议匹配之外，TSRPC 还会确保字段名称和数量的严格匹配。

- 在 **请求和响应前**，将协议中未定义的多余字段自动剔除
- 剔除后，剩余字段正常进入请求和响应流程

例如有一个更新用户信息的接口 `user/Register`，其请求格式定义为：

```ts
export interface ReqRegister {
    id: number,
    update: {
        nickname?: string,
        avatar?: string
    }
}
```

如果客户端构造了一个恶意请求：
```json
{
    "id": 123,
    "update": {
        "nickname": "test",
        "role": "超级管理员"    // 敏感字段，不在协议中，不允许更新！
    }
}
```

**后端极有可能因为检查不严格，而导致安全隐患！**

但在 TSRPC 中 **不存在此问题** —— 由于字段剔除的特性，实际进入 API 实现函数的请求参数为：

```json
{
    "id": 123,
    "update": {
        "nickname": "test"
        // 非法字段 role 已被自动过滤
    }
}
```

非法字段已被框架预先自动过滤，从而 **规避了安全隐患** 。

凡事总有例外，如果你确实需要动态字段，而不需要自动剔除的话，可利用 TypeScript 的 [索引签名](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures) 定义如下：
```ts
export interface ReqRegister {
    id: number,
    update: {
        nickname?: string,
        avatar?: string,
        // 索引签名：允许动态字段
        [key: string]: string
    }
}
```

## TypeScript 高级类型支持



## 更强的 JSON

## 二进制传输
