---
id: service-proto.html
description: TSRPC 同时支持请求/响应模型的 API 接口服务，和发布/订阅模型的实时消息服务。本节内容介绍如何用 TSRPC 来定义以上两种服务的协议，以及它们是如何工作的。
keywords:
  - tsrpc service
  - tsrpc proto
  - tsrpc 协议
  - service proto
  - tsbuffer
  - tsrpc api
  - tsrpc msg
---

# 协议定义

TSRPC 可提供两种类型的服务：
- API Service —— API 接口服务，基于请求 / 响应模型
- Message Service —— 实时消息服务，基于发布 / 订阅模型

协议，即上述两种服务的定义，包括它们涉及的请求、响应等数据结构和相关额外配置。

## 定义规则

每个 API 接口和消息都定义在独立的文件中，所有协议定义文件均放置在 **协议目录** 下，允许子目录嵌套。
协议目录默认为 `backend/src/shared/protocols`，可在 `tsrpc.config.ts` 中修改。

TSRPC 完全通过 **文件名和类型名** 来识别协议。
所以务必要严格按照 TSRPC 规定的名称前缀来命名，具体规则如下。

### API Service
- 文件名为：`Ptl{接口名}.ts` （Ptl 是 Protocol 的缩写）
- 请求类型名为： `Req{接口名}`，通过 `interface` 或 `type` 定义，需 `export`
- 响应类型名为：`Res{接口名}`，通过 `interface` 或 `type` 定义，需 `export`

:::info 重要
TSRPC 有统一的 [错误处理](../engineering/error.html) 规范，所以定义协议时，不需要考虑失败和错误的情况。

例如 **不要** 这样定义：

```ts
export interface ResXXXXX {
    code: number,   // 与 TSRPC 的错误处理重复
    message: string,
    data: {
        // ...
    }
}
```
:::

**例子：**
```ts title="PtlLogin.ts"
export interface ReqLogin {
    username: string,
    password: string
}

export interface ResLogin {
    user: {
        id: number,
        nickname: string
    }
}
```

### Message Service
- 文件名为：`Msg{消息名}.ts`
- 消息类型名为：`Msg{消息名}`，通过 `interface` 或 `type` 定义，需 `export`

### 额外配置项

你可以给每个服务增加额外的配置项，直接在协议定义文件中添加 `export const conf`：

```ts title="order/PtlUpdateOrder.ts"
export interface ReqUpdateOrder {
    // ...
}

export interface ResUpdateOrder {
    // ...
}

// 额外的配置项，随便填写
export const conf = {
    needLogin: true,
    needRoles: ['管理员', '运营经理']
}
```

这些额外配置项可以在运行时通过 `call.service` 或 `server.serviceMap` 获得。
你可以用它独立配置各个接口，例如 “是否需要登录” “需要的角色权限” 等，以便在后续流程中统一处理。

:::info 重要
虽然规定请求和响应必须定义在 `PtlXXX.ts` 文件内，但它们可以自由引用外部其它文件的类型。但由于协议目录是跨项目共享的，所以为了方便起见，应当保证所有协议的依赖项都位于 `shared` 目录内部，且不要引用自 `node_modules`，除非你确定这些依赖在前后端项目中都有安装。
:::

## 运行原理

### 运行时类型系统

众所周知，TypeScript 的类型信息（如 `type`、`interface`）会在编译后被抹除，TSRPC 是如何在运行时也知道这些信息，进而实现类型检测和二进制序列化呢？
这得益于我们遵循 TypeScript 类型标准，全新实现了一套独立、轻量的运行时类型系统。

### ServiceProto

TSRPC 会自动解析 TypeScript 源码，转换成运行时类型系统需要的格式 —— `ServiceProto`，它也是你在创建 TSRPC 服务端、客户端实例时要传入的首个参数。

```ts
import { HttpClient } from 'tsrpc-browser';
import { serviceProto } from './shared/protocols/serviceProto';

// 创建客户端实例，传入 serviceProto
export const client = new HttpClient(serviceProto, {
    // ...
});
```

### 生成方式
`ServiceProto` 是何时被生成的呢？有几种方式。

- `npm run dev` 本地开发服务运行期间，当协议文件变更，会自动重新生成
- `npm run build` 构建前，会自动重新生成
- 你也可以通过 `npm run proto` 手动重新生成

ServiceProto 默认生成到 `src/shared/protocols/serviceProto.ts`，位置可在 `tsrpc.config.ts` 中修改。

## 同步协议

ServiceProto 在服务端和客户端项目中都需要用到，
为此，TSRPC 提供了 [跨项目共享代码](../engineering/share-codes.html) 的方案。
命令行工具 `tsrpc-cli` 已经自动帮你完成了大部分工作，所以通常你无需关注同步细节，只需记住：

1. 总是先启动服务端项目 `npm run dev`，再启动客户端
1. 服务端 `npm run dev` 期间，会自动同步共享目录下的变更
1. 服务端 `npm run build` 前会自动执行一次同步
1. 服务端 `npm run sync` 可执行一次性手动同步

## 协议变更

`npm run dev` 本地开发服务运行期间，当协议文件变更，会自动重新生成 ServiceProto 然后同步到客户端项目。

这里牵扯出重要的一个问题：新生成的 ServiceProto 与旧的能保持兼容吗？
通常情况，你只需要关注新旧协议在类型定义层面是否兼容即可 ——
**类型兼容的新旧协议可以无缝切换** 。

欲了解更多可参考 [协议变更和蓝绿发布](deployment/proto-change.html) 。