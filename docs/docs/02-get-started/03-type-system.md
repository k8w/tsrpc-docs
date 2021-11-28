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

> TSRPC 是专为 TypeScript 设计的 RPC 框架。

众所周知，TypeScript 的类型系统只在编译时刻生效，在运行时刻并不生效。
而用户的输入是不可靠的，这将带来很大的安全隐患。

**但 TSRPC 在运行时刻也是类型安全的。**

这得益于我们遵循 TypeScript 类型标准，全新实现了一套独立、轻量的运行时类型系统。
不但实现了运行时类型检测，甚至可以基于 TypeScript 的类型定义直接完成二进制序列化，而不需要引入 Protobuf 这样的第三方语言。

## 运行时类型检测
### 类型检测

TSRPC 会在 API 接口函数的 **请求输入和响应输出前** 自动进行类型检测，对格式非法的请求和响应予以拦截。

- 客户端先进行一次校验，将类型不合法的请求拦截在本地。
- 服务端在执行 API 前还会做二次校验，确保进入执行阶段的 API 请求一定是类型合法的。

你只需放心编写业务逻辑，而不需要担心类型安全问题。

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

除了确保每个字段类型的匹配之外，TSRPC 还会确保字段名称和数量的严格匹配。

- 在 **请求输入和响应输出前**，将协议中未定义的多余字段自动剔除
- 剔除后的剩余字段如与协议匹配，则正常执行后续请求和响应流程，不会报错

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

如果客户端构造了一个恶意请求，包含了一个未定义的敏感字段 `update.role`：
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

:::tip
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
:::

## TypeScript 高级类型

TypeScript 是目前世界上类型系统最强大的语言之一，有许多其它语言不支持的高级类型特性。
作为专为 TypeScript 设计的 RPC 框架，TSRPC 支持常见的高级类型特性，例如：

1. 逻辑类型：如 `A & (B | C)`
2. 工具类型：Pick、Omit、Overwrite、Partial、NonPrimitive
3. 引用和嵌套等……（[查看完整列表](../inside/types.html)）

灵活运用这些特性，能使我们在类型建模阶段，减少类型定义冗余，规避潜在错误。

例如，常见的增删改查接口，可通过 TypeScript 工具类型简化如下：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="add"
  values={[
    {label: '增加接口', value: 'add'},
    {label: '删除接口', value: 'del'},
    {label: '修改接口', value: 'update'},
    {label: '查询接口', value: 'get'},
    {label: '表结构', value: 'item'}
  ]}>
  <TabItem value="add">

```ts title="PtlAddArticle.ts"
import { ObjectId } from 'mongodb';
import { Article } from './Article';

// 新建文章
export interface ReqAddArticle {
    // 不需要填写 `_id` 和服务端维护的字段，用 Omit 剔除之
    article: Omit<Article, '_id' | 'create' | 'update'>;
}

export interface ResAddArticle {
    _id: ObjectId
}
```

  </TabItem>

  <TabItem value="del">

```ts title="PtlDelArticle.ts"
import { ObjectId } from 'mongodb';

// 新建文章
export interface ReqDelArticle {
    // 要删除的文章 ID
    _id: ObjectId
}

export interface ResDelArticle {
    deletedCount: number
}
```

  </TabItem>

  <TabItem value="update">

```ts title="PtlUpdateArticle.ts"
import { ObjectId } from 'mongodb';
import { Article } from './Article';

// 修改文章
export interface ReqUpdateArticle {
    // _id 必填，仅允许修改 title 或 content
    update: Pick<Article, '_id'> & Partial<Pick<Article, 'title' | 'content'>>;
}

export interface ResUpdateArticle {
    matchedCount: number,
    modifiedCount: number
}
```

:::tip
由于 [字段剔除](#字段剔除) 特性的存在，你可以修改 `Article` 数据后直接提交给修改接口，不允许被修改的字段（如 `category`）将被自动过滤。
:::

  </TabItem>

  <TabItem value="get">

```ts title="PtlGetArticle.ts"
import { ObjectId } from 'mongodb';
import { Article } from './Article';

// 新建文章
export interface ReqGetArticle {
    _id: ObjectId
}

export interface ResGetArticle {
    article: Article
}
```

  </TabItem>

  <TabItem value="item">

```ts title="Article.ts"
import { ObjectId } from 'mongodb';

// 数据库表 `Article` 的结构定义
export interface Article {
    _id: ObjectId,
    title: string,
    content: string,
    // 文章分类，一经创建，不可修改
    category: string,

    // 以下字段由服务端维护，不可由客户端修改
    create: {
        time: string,
        uid: ObjectId
    },
    update?: {
        time: string,
        uid: ObjectId
    }
}
```

  </TabItem>
</Tabs>

## 更丰富的可传输类型

> TSRPC 使跨端 API 调用就像本地异步函数一样简单。

JSON 字符串是目前最普遍的 HTTP API 传输格式，但支持的数据类型有限，尤其是一些常用的类型无法直接传输，例如：

1. `ArrayBuffer` 和 `Uint8Array`
    - 文件上传和收发二进制数据刚需
    - `multipart/form-data` 写法复杂，跟 JSON 接口完全不同
    - 手动转为 `base64` 字符串太麻烦，且会显著增大包体
1. `Date`
    - 迫不得已改用数字时间戳，但人类不可读，增加调试、数据运维成本
1. `ObjectId`
    - 在 MongoDB 中大量存在，为和前端交互不得不手动处理类型转换

我们不得不手动处理各种类型转换，这距离 “像本地函数一样调用远程 API” 还有一些距离。

**但在 TSRPC 中不存在此问题！**

使用 TSRPC 客户端，即可 **直接使用** 上述所有类型，而无需考虑传输类型转换。
TSRPC 会在传输阶段自动进行编解码和类型转换。
例如实现文件上传，只需像调用本地函数那样直接发送 `Uint8Array` 即可：

<Tabs
  defaultValue="protocols"
  values={[
    {label: '协议定义', value: 'protocols'},
    {label: '服务端实现', value: 'server'},
    {label: '浏览器调用', value: 'client'}
  ]}>
  <TabItem value="protocols">

```ts
export interface ReqUpload {
    fileName: string,
    fileData: Uint8Array  // 可直接使用 Uint8Array
}

export interface ResUpload {
    url: string;
}
```

  </TabItem>

  <TabItem value="server">

```ts
import { ApiCall } from "tsrpc";
import fs from 'fs/promises';

export async function ApiUpload(call: ApiCall<ReqUpload, ResUpload>) {
  // 写入文件
  await fs.writeFile('uploads/' + call.req.fileName, call.req.fileData);

  call.succ({
      url: 'http://127.0.0.1:3000/uploads/' + call.req.fileName
  });
}
```

  </TabItem>

  <TabItem value="client">

```ts
async function upload(fileData: Uint8Array, fileName: string) {
    // 像普通接口一样调用
    let ret = await client.callApi('Upload', {
        fileData: fileData,  // 可直接发送 Uint8Array
        fileName: fileName
    });
    
    console.log(ret.isSucc ? '上传成功' : '上传失败')
}
```

  </TabItem>
</Tabs>

:::tip
协议中更推荐使用 `Uint8Array` 来代替 `ArrayBuffer`，它更易操作，且跨平台兼容性更好。
:::

## 二进制序列化

TSRPC 同时支持 JSON 格式传输和二进制格式传输。

- JSON 格式：更佳通用，包体较大，明文容易被抓包破解
- 二进制格式：包体显著减小，天然防破解，更易于二次加密

TSRPC 的二进制传输并非将 JSON 字符串二次编码，而是基于 TypeScript 类型定义**直接编码到二进制**，编码的时间和空间效率与 Protobuf 相当，
具体编码细节可以了解另一个开源项目 [TSBuffer](https://github.com/k8w/tsbuffer) 。

项目模板默认使用 JSON 格式传输，改用二进制传输也非常简单：

- 服务端
    - 无需任何配置，天然支持二进制传输
    - 开启 `new HttpServer()` 时的 `json: true` 配置，允许 JSON 格式的请求
        - 根据请求头自动判断：`Content-Type: application/json`
    - 安全性要求高的服务，建议关闭 `json: true`，仅允许二进制传输
- 客户端
    - 关闭 `new HttpClient()` 时的 `json: true` 配置，即可切换到二进制传输
    - 此时包体将变成乱码，为便于调试你可以增加 `logger: console` 的配置，这将把请求和响应日志打印在控制台上
    ```ts
    let client = new HttpClient(serviceProto, {
        server: 'http://127.0.0.1:3000',
        // json: true
        logger: console
    });
    ```

