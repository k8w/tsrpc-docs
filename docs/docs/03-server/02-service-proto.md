---
id: service-proto.html
description: 使用 create-tsrpc-app 工具，可以快速创建 TSRPC 项目。创建过程是交互式的，在菜单上选择相应的配置，即可轻松创建包含前后端的 TSRPC 全栈应用项目。
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

这里牵扯出重要的一个问题：新生成的 ServiceProto 与旧的能保持兼容吗？通常有几种情况。

### 类型兼容的情况

新协议的在类型层面兼容旧协议，这种情况下新旧协议**是兼容的**，可以无缝切换，例如：

```ts title="旧协议"
export interface ReqSubmit {
    name: string
}

export interface ResSubmit {
    id: number
}
```

```ts title="新协议"
export interface ReqSubmit {
    name: string,
    age?: number
}

export interface ResSubmit {
    id: number,
    time: Date
}
```

- 新协议的请求虽然多了一个 `age` 字段，但由于是可选的，所以旧版协议的请求也能够兼容
- 新协议的响应虽然多了一个 `time` 字段，对于旧版协议它是一个多余字段，会被[自动剔除](../get-started/type-system.html#字段剔除)

### 类型不兼容的情况

例如：

```ts title="旧协议"
export interface ReqSubmit {
    name: string
}

export interface ResSubmit {
    id: number
}
```

```ts title="新协议"
export interface ReqSubmit {
    name: string,
    age: number
}

export interface ResSubmit {
    newId: number
}
```

- 新协议的请求多了必需的 `age` 字段，如此旧协议的请求便会收到 “缺少必需字段 `age`” 的报错
- 新协议的响应缺少了旧协议必需的 `id` 字段，如此旧协议的响应便会收到 “缺少必需字段 `id` ”的报错

这种情况下新旧协议**类型不兼容**，如果贸然更新服务端版本，可能导致旧协议的客户端出现报错。

这种情况下，也有一些解决方案，例如：

- 旧接口不变，而是写一个新的接口 `Submit_1`
- 发布新版服务到不同的 URL 下
    - 例如旧版接口发布到 `/api/v1/`，新版接口发布到 `/api/v2`
    - 待所有客户端完成切换后再弃用旧版接口
    
### 二进制编码的兼容

如果你使用过 Protobuf，应该有印象：每个字段都要指定一个编码序号，你需要手动维护这些序号，来确保新旧协议的编码兼容。
TSRPC 直接使用 TypeScript 源代码进行类型定义，不需要指定类似的编码序号，那么是如何做到增减字段时还能保持新旧协议的编码兼容的呢？

答案就是 TSRPC 中也存在类似的编码序号，但是是由命令行工具 **自动维护** 的。

例如你的一个 `interface` 有 3 个字段 `a`、`b`、`c`，它们的字段序号可能是 `1`、`2`、`3`。
但设想一下这种情况，假设你删除了 `b`，然后新增了一个 `d`，新生成的协议，字段序号会变成怎样呢？
事实上，新的字段结构 `a`、`c`、`d` 的编码序号会被生成为 `1`、`3`、`4`。

这是因为当重新生成 ServiceProto 时，TSRPC 会检测目标位置的旧版协议，比较新旧协议然后自动完成兼容处理，确保一定不会出现编码序号的冲突。
我们把维护编码序号交给工具来完成，将你从手动管理中释放出来。