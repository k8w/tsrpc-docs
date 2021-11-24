---
sidebar_position: 2
---

# 第一个 API

API 本质上是一个在 Server 端实现，在 Client 端调用的**异步函数**。

这个异步函数的输入参数叫做请求（ `Request` ），输出叫做响应（ `Response` ）。
定义一对请求和响应的文件，叫做协议（ `Protocol` ）。

要实现一个 API ，首先需要定义它的协议。

## 定义协议

### 命名规范

所有协议均位于 `backend/src/shared/protocols` 目录下，该 `protocols` 目录称为**协议目录**。

协议目录及其子目录下，所有命名符合 `Ptl*.ts` 的文件，均被视为**协议文件**，`*` 被解析为**协议名**，例如：

| 协议文件路径 | 协议名 |
| --- | --- |
| `protocols/PtlGetData.ts` | `GetData` |
| `protocols/user/PtlLogin.ts` | `Login` |

:::note
- 前缀 `Ptl` 代表 `Protocol` 的缩写。
- 协议名仅取决于文件名，不受其所在路径影响。
:::

### 请求和响应
一个协议文件对应一个 API 接口。故在协议文件内，必须存在 2 个 `export` 的类型定义：
- 请求：`Req${协议名}`
- 响应：`Res${协议名}`

:::note
- `Req` 是 `Request` 的缩写，`Res` 是 `Response` 的缩写。
- 类型定义可以是 `interface`，也可以是 `type`。
:::

假设我们要实现一个接口 `HelloWorld`，则在协议目录下创建文件 `PtlHelloWorld.ts`，例子如下。

```ts title="backend/src/shared/protocols/PtlHelloWorld.ts"
export interface ReqHelloWorld {
    name: string
}

export type ResHelloWorld = {
    reply: string,
    time: Date
}
```

如你所见，TSRPC 使用原汁原味的 TypeScript 来定义协议，不需要额外的注释，同时还支持更多类型（例如 `Date` 、 `ArrayBuffer` 、 `Uint8Array` 等）

### 生成 ServiceProto
`ServiceProto` 是 TSRPC 真正的协议定义文件，执行以下命令来自动生成它。

```shell
cd backend
npm run proto
```

:::tip
TSRPC 基于 ServiceProto 工作，所以每当协议改动后，都应该重新执行此过程。
:::

### 共享代码
现在你看到一个 `proto.ts` 生成到了 `backend/src/shared/protocols` 目录下，这个文件就是协议的全部内容。
前端项目也需要这些文件来正常工作，以及获得更好的代码提示。
所以，我们需要将协议目录 `protocols` 同步到前端项目。

更进一步，你可能还有其它代码可以在前后端之间复用。例如表单验证规则、日期格式化方法等业务代码。因此我们设计了 `src/shared` 目录，它代表了所有在前后端之间共享的代码。有很多方式能实现共享和同步机制，我们默认采用手动同步的方式：

1. `src/shared` 中的内容应当在 `backend` 中编辑，然后同步到 `frontend`（只读）。
2. 在 `backend` 下执行 `npm run sync` 来手动完成同步。
```shell
cd backend
npm run sync
```

:::tip
你也可以使用软连接（Symlink）或其它工具，来实现自动同步。
:::

至此，API 协议的定义、生成、同步，都完成了。

## 实现 API

### 命名规范
API 接口的入口文件均位于 `backend/src/api` 目录下，与协议目录下的协议文件一一对应，只是将前缀 `Ptl` 改为 `Api`。

例如，协议目录文件结构如下：
```
|- backend/src/shared/protocols
    |- user
        |- PtlLogin.ts      协议 user/Login
    |- PtlGetData.ts        协议 GetData
    |- SomeOtherFile.ts     由于文件名非Ptl前缀，故不视为协议
```

则对应的 API 实现目录结构应为：
```
|- backend/src/api
    |- user
        |- ApiLogin.ts      协议 user/Login 的实现
    |- ApiGetData.ts        协议 GetData 的实现
```
### 命名规范
同**协议目录**一样，

## 调用 API

### 调用路径
客户端根据**调用路径**来调用远端 API，调用路径为 `协议路径/协议名`，举例如下：

| 协议文件路径 | 调用路径 |
| --- | --- |
| `协议目录/PtlGetData.ts` | `GetData` |
| `协议目录/user/PtlLogin.ts` | `user/Login` |