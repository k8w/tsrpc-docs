---
sidebar_position: 2
---

# 第一个 API

API 本质上是一个异步函数，实现在 Server 端，可在 Client 端调用。
这个异步函数的输入参数，叫做请求 `Request`，输出叫做响应 `Response`。
定义一对请求和响应的文件，叫做协议 `Protocol`。

要实现一个 API ，首先需要定义它的协议。

## 定义协议

### 命名规范 
所有协议均位于 `backend/src/shared/protocols` 或其子目录下，命名规则为 `Ptl*.ts`。前缀 `Ptl` 为 `Protocol` 的缩写，`*` 为协议名。
例如：

- 协议 `protocols/PtlGetData.ts`，协议名为 `GetData`
- 协议 `protocols/user/PtlLogin.ts`，协议名为 `Login`，协议路径为 `user/`

### 请求和响应
在协议文件内，应该存在 2 个 `export` 的类型定义：请求 `Req{协议名}` 和 响应 `Res{协议名}`。

:::note
- `Req` 是 `Request` 的缩写，`Res` 是 `Response` 的缩写。
- 类型定义可以是 `interface`，也可以是 `type`。
:::

假设我们要实现一个获取文章接口 `article/GetArticle`，例子如下。

```ts title="backend/src/shared/protocols/article/PtlGetArticle.ts"
export interface ReqGetArticle {
    articleId: number;
}

export interface ResGetArticle {
    title: string,
    content: string,    
    createTime: Date
}
```

如你所见，TSRPC 使用原汁原味的 TypeScript 来定义协议，不需要额外的注释，同时还支持更多类型（例如 `Date` 、 `ArrayBuffer` 、 `Uint8Array` 等）

### 生成 ServiceProto
`ServiceProto` 是 TSRPC 真正使用到的协议定义文件，不过大多数时间你都不需要关心，因为它是自动生成的。
在 `backend` 目录，执行 `npm run proto` 即可生成。

```shell
cd backend
npm run proto
```

### 共享代码
现在你看到一个 `proto.ts` 生成到了 `backend/src/shared/protocols` 目录下，这个就是协议定义的全部内容。
前端项目需要它获取 API 信息，同时也需要协议文件里的类型定义获得更好的代码提示。
所以，我们需要将协议目录 `protocols` 同步到前端项目。

更进一步，你可能还有其它代码可以在前后端之间复用。例如表单验证规则、日期格式化方法等业务代码。因此我们设计了 `src/shared` 目录，它代表了所有在前后端之间共享的代码。这些代码在后端项目中编辑，然后同步到前端（前端只读）。

为防止意外更改，你需要手动完成同步，通过 `npm run sync`：
```shell
cd backend
npm run sync
```

:::tip
你也可以使用软连接（Symlink）或其它工具，来实现自动同步。
:::

至此，API 协议的定义、生成、同步，都完成了。