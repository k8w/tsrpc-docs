---
id: use-db.html
---

# 使用数据库

## 数据库的选择

根据实际情况，有很多数据库可以选择，
但我们强烈推荐你使用 **支持 JSON 嵌套结构** 的 NoSQL 数据库，原因有二。

1. 更利于发挥 TypeScript 类型特性，参考 [类型设计](../../engineering/type-design.html)
2. 大幅简化关系型表结构设计，降低维护成本
3. 无需学习 SQL，纯 API 式调用更容易上手，也规避了 SQL 注入等安全风险

例如 [MongoDB](https://mongodb.com/) 就是一个非常不错的选择。

## 使用 MongoDB

MongoDB 是成熟的 NoSQL 数据库，对 TypeScript 支持十分良好。

:::note
[MongoDB Atlas](https://www.mongodb.com/atlas/database) 是官方推出的云数据库服务，提供 512 MB 免费空间，非常适合学习使用。
:::

### 安装
MongoDB 已经提供了官方的 NodeJS 驱动：
```shell
npm i mongodb
# 或者
yarn add mongodb
```

然后就可以在代码中使用了，使用细节可以参阅[官方文档](http://mongodb.github.io/node-mongodb-native/)。

### 配置和启动

MongoDB 的客户端都是异步的 API，并且会自动维护连接池，所以你只需要全局创建一个共享的 `Db` 实例即可，
例如：

```ts
import { Db, MongoClient } from "mongodb";

export class Global {
    static db: Db;

    static async initDb() {
        const uri = 'mongodb://username:password@xxx.com:27017/test?authSource=admin';
        const client = await new MongoClient(uri).connect();
        this.db = client.db();
    }
}
```

:::tip
安全起见，你可以将连接配置放在配置文件或环境变量中。
:::

你需要在服务启动前就连接好数据库，所以修改一下 `index.ts` 中的初始化流程：

```ts title="index.ts"
// Initialize
async function init() {
    // Auto implement APIs
    await server.autoImplementApi(path.resolve(__dirname, 'api'));    
    // 在服务启动前先连接好数据库
    await Global.initDb();
};

// Entry function
async function main() {
    await init();
    await server.start();
};
main();
```

然后，就可以使用 `Global.db` 来调用 MongoDB 了，例如：
```ts
export async function ApiGetPost(call: ApiCall<ReqGetPost, ResGetPost>) {
    let op = await Global.db.collection<Post>('Post').findOne({
        _id: call.req._id
    });
    // ...
}
```

:::tip
通常你不需要手动去关闭连接，保持数据库的长连接可以让你的接口响应更加迅速。
:::

### 表结构映射
在上面的例子中看到，我们可以通过 `db.collection<类型名>('表名')` 这样的写法来告诉 TypeScript 表结构类型。
但是，你又给自己埋下了一个小坑。

> 墨菲定律：可能犯错的一定会犯错。

如果表名拼写错了呢？如果类型名关联错了呢？这些都是常有的事。

同样，你也可以利用 TypeScript 的类型系统，在一开始就规避这些问题。
首先，定义一个 `interface`，显示指明所有表名及其类型：
```ts
export interface DbCollectionType {
    // 表名：类型名
    Post: DbPost,
    User: DbUser,
    Comment: DbComment
}
```

然后，自行实现一个 `.collection` 方法，利用 TS 的泛型，自动关联表名和类型名：
```ts
import { Collection, Db, MongoClient } from "mongodb";

export class Global {

    static db: Db;
    static async initDb() { ... }

    static collection<T extends keyof DbCollectionType>(col: T): Collection<DbCollectionType[T]> {
        return this.db.collection(col);
    }
}
```

现在，你就可以使用 `Global.collection` 来替代 `Global.db.collection` 了，享有了自动代码提示和类型约束。

![](assets/global-collection.gif)

### ObjectId 和 Date

#### ObjectId

在 TSRPC 下，你可以在协议中直接使用 `ObjectId` 类型，框架会自动完成传输前后的类型转换。

`ObjectId` 是 MongoDB 默认的 `_id` 类型，因为其引用自 `mongodb` NPM 包（前端未安装），所以通常无法在前端通用。
但通过 [脚手架工具](../get-started/create-tsrpc-app.md) 创建的 TSRPC 全栈项目却做到了这一点，其原理是在前端项目中的 `end.d.ts` 中定义了如下类型：

```ts
declare module 'mongodb' {
    export type ObjectId = string;
    export type ObjectID = string;
}
declare module 'bson' {
    export type ObjectId = string;
    export type ObjectID = string;
}
```

因此即便协议定义中包含了 `import { ObjectId } from 'mongodb'`，亦可以在前端通用。`ObjectId` 在前端被解析为普通字符串，但在后端将自动转换为 `ObjectId` 类型。

#### Date

在 TSRPC 下，你可以在协议中直接使用 `Date` 类型。

推荐直接使用 `Date` 类型而不是时间戳，通常它在数据库管理工具中可读性更佳，看数据、维护都更轻松。

### 例子：增删改查

https://github.com/k8w/tsrpc-examples/tree/main/examples/mongodb-crud

## 使用 MySQL

:::danger
TODO
:::

## 减少类型冗余

CRUD 接口常见的场景是，对于数据表结构，只允许客户端发送有限的字段，其余字段由客户端来维护。
利用 TypeScript 工具类型 `Pick`、`Omit`、`Partial`，你也可以在最小冗余的情况下定义它们，例如：

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

:::tip
即便客户端发送了协议以外的额外字段，TSRPC 类型系统也会自动剔除它们，确保类型和字段的严格安全。
:::