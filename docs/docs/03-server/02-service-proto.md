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

TSRPC 完全通过 **名称** 来识别协议，这包括了文件名、类型名等。
所以务必要严格按照 TSRPC 规定的名称前缀来命名，具体规则如下。

### API Service
- 文件名为：`Ptl{接口名}.ts`，下面的几项都定义于此文件内
- 请求类型名为： `Req{接口名}` (必须 `export`)
- 响应类型名为：`Res{接口名}`（必须 `export`）

### Message Service
- 文件名为：`Msg{消息名}.ts`，下面的几项都定义于此文件内
- 消息类型名为：`Msg{消息名}`

### 额外配置项

你可以给每个服务增加额外的配置项，直接在服务定义文件中添加 `export const conf`：

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

众所周知，TypeScript 的类型信息（如 `type`、`interface`）会在编译后被抹除，TSRPC 是如何在运行时也知道这些信息，进而实现类型检测和二进制序列化呢？

这得益于我们遵循 TypeScript 类型标准，全新实现了一套独立、轻量的运行时类型系统。
TSRPC 会自动解析 TypeScript 源码，转换成运行时类型系统需要的格式 —— `ServiceProto`。

`ServiceProto` 是何时被生成的呢？有几种方式。

- `npm run dev` 本地开发服务运行期间，当协议文件变更，会自动重新生成
- `npm run build` 构建前，会自动重新生成
- 你也可以通过 `npm run proto` 手动重新生成

ServiceProto 默认生成到 `src/shared/protocols/serviceProto.ts`，可在 `tsrpc.config.ts` 中修改。

## 同步协议

## 协议变更