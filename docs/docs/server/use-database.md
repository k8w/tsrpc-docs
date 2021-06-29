---
sidebar_position: 5
---

# 使用数据库

## 数据库的选择

根据实际情况，有很多数据库可以选择。
但多数情况下，为了最大程度的利用 TypeScript 类型特性，我们推荐你使用 **支持 JSON** 的数据库。
为什么这么说呢？

假设我们有一个数据表用于存储文章（英文是 Post），类型定义如下：
```ts
export interface Post {
    id: number,
    title: string,
    content: string,
    createUserId: number,
    createTime: Date,
    // 更新人和更新时间，是可选的（因为第一次创建时不存在）
    updateUserId?: number,
    updateTime?: Date
}
```

有 2 个字段 `updateUserId` 和 `updateTime`，它们是可选的。这很合理，因为当文章初次创建时是不包含这两个字段的。（只有文章更新时，才会设置这两个字段）

但这样的类型定义，其实潜在的埋下了一个坑，即它没有约束 `updateUserId` 和 `updateTime` 必须 **同时** 出现或不出现。如果在代码里不小心只设置了其中一个而忘记另一个，类型上依旧是合法的，TypeScript 不会提示任何错误。
但业务上显然是错误的，这是一个 BUG！

> 墨菲定律：可能犯错的一定会犯错。

我们完全可以在类型定义阶段就避免它！
这是一个典型的场景：**一组字段要么同时出现要么同时不出现**。
针对这种场景，你可以将这一组字段全部包装成一个子对象，然后将整体设为可选，例如：
```ts
export interface Post {
    id: number,
    title: string,
    content: string,
    // 为了保持风格统一，create 也这样处理
    create: {
        uid: number,
        time: Date
    }
    update?: {
        uid: number,
        time: Date
    }
}
```

如此，`update.uid` 和 `update.time` 要么同时出现，要么同时不出现。如果只传递了其中一个，TypeScript 会在编译阶段就提示错误。
不仅规避了前面提到的坑，你会发现代码似乎也变得更优雅了：之前重复的单词 `update` 现在只出现了 1 次，代码量更少了。

还有很多类似的例子，你可以巧妙利用类型定义让数据结构更严谨，但这就不可避免的需要用到嵌套的 JSON 结构。
所以为了更好的利用 TypeScript 的类型特性，我们建议你使用支持存储 JSON 结构的数据库。

MongoDB 就是一个不错的选择。

:::note
如果你只是开发一个本地单进程的轻量服务，[LowDB](https://github.com/typicode/lowdb) 也是一个不错的选择。
:::

## 使用 MongoDB

这里我们拿 MongoDB 举例。

如果你对 Mongo 还不熟悉，也可以看看官方提供的 [快速入门](https://docs.mongodb.com/manual/tutorial/getting-started/).

### 安装
MongoDB 已经提供了官方的 NodeJS 客户端，使用细节可以参阅 [官方文档](http://mongodb.github.io/node-mongodb-native/)。
首先安装它：
```shell
npm i mongodb
```

因为我们使用的是 TypeScript，所以还需要它的类型定义。
```shell
npm i @types/mongodb --save-dev
```

然后就可以在代码中使用了。

### 配置和启动

MongoDB 的客户端都是异步的 API，并且它会自动维护一个连接池，所以你只需要全局创建一个共享的 `Db` 实例即可。
为方便全局实例的管理，可以将它们统一封装在一起，例如：

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
你可以将连接配置放在配置文件或环境变量中。
:::

你需要在服务启动前就连接好数据库，所以修改一下 `index.ts` 中的启动流程：

```ts title="index.ts"
async function main() {
    // Auto implement APIs
    await server.autoImplementApi(path.resolve(__dirname, 'api'));
    
    // 在服务启动前先连接好数据库
    await Global.initDb();

    await server.start();
};
```

然后，就可以在你的接口中使用 `Global.db` 来调用 MongoDB 了，例如：
```ts
export async function ApiGetPost(call: ApiCall<ReqGetPost, ResGetPost>) {
    let op = await Global.db.collection<Post>('Post').findOne({
        _id: new ObjectID(call.req._id)
    });
    // ...
}
```

:::tip
通常你不需要手动去关闭连接，保持数据库的长连接可以让你的接口响应更加迅速。
:::

### 表名和结构映射
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

### 处理 ObjectID
MongoDB 为所有记录自动创建了一个 `_id` 字段，类型为 `ObjectID`，这个类型引用自 `mongodb` NPM 包。
所以前端是无法使用 `ObjectID` 类型的，在与前端通讯时需要转为字符串：

```ts
import { ObjectID } from 'mongodb';

let _id = new ObjectID("60d9f7d32b285522785b3cb5");
let str = _id.toHexString();
```

因此，在 `shared` 目录下的所有类型定义和文件，你都不应该使用 `ObjectID`。因为它们要跨项目共享，前端可没有安装 `mongodb`。
但是你的数据库表结构定义却需要 `_id: ObjectID`，并且前端也需要用到表结构类型，声明两份显然又是在埋坑。（类型冗余）

TSRPC 提供了一个工具类型 `Overwrite` 可以解决这个问题。

#### 1. 在 shared 目录下定义前后端通用的类型

为确保跨项目可用，`_id` 设置为 `string`。

```ts title="shared/protocols/models/Post.ts"
export interface Post {
    _id: string,
    title: string,
    content: string
}
```

#### 2. 在后端利用 Overwrite 改写实际数据库存储结构

为避免名称混淆，我们将 `Post` 的数据库表结构定义命名为 `DbPost`：

```ts title="backend/src/models/dbItems/DbPost.ts
import { ObjectID } from "mongodb";
import { Overwrite } from "tsrpc";
import { Post } from "../../shared/protocols/models/Post";

// { _id: ObjectID, title: string, content: string }
export type DbPost = Overwrite<Post, {
    _id: ObjectID
}>
```

如此，就可以最大限度避免类型冗余，针对后端的单独场景，使用 `Overwrite` 去进行少量字段改写。

### 有坑请注意
TypeScript 默认工作在严格模式下，`null` 和 `undefined` 是有区别的。

但 MongoDB 此处有坑，例如如果你：
```ts
db.collection('Test').insertOne({
    value: undefined
})
```

或者：

```ts
db.collection('Test').updateOne({ _id: 'xxx' }, {
    $set: {
        value: undefined
    }
})
```

以上操作，在 MongoDB 中，只会让 `value` 变成 `null`，而不是 `undefined`。
你下一次将数据拿回来时，会发现 `value` 变成了 `null`。

TSRPC 的自动类型检测默认跟 TypeScript 的严格模式一样，是区分 `null` 和 `undefined`，这就会造成响应无法正常返回。
解决办法有两种：

#### 1. 避免上述用法
TSRPC 是不会编码 undefined 的，即如果你从客户端发送 `{ value: undefined }`，服务端收到的是 `{}`。
所以大多数问题是在 `update` 的时候人为导致的，记住在 MongoDB 的 `update` 中将字段设为 `undefined` 应该是使用 `$unset: { 字段名: 1 }`，而不是 `$set: { 字段名: undefined }`。

#### 2. 让 TSRPC 非严格校验 `null` 和 `undefined`
即令 TSRPC 将 `null` 和 `undefined` 视为相同，与 `tsconfig` 中 `strictNullChecks: false` 的表现一致。
只要你的业务不是将 `null` 和 `undefined` 严格区分对待，这么做是最简单的。

## 减少类型冗余

CRUD 接口常见的场景是，对于数据表结构，只允许客户端发送有限的字段，其余字段由客户端来维护。
利用 TypeScript 工具类型 `Pick`、`Omit`、`Partial`，你也可以在最小冗余的情况下定义它们，例如：

```ts
export interface ReqAddPost {
    // 从 Post 中剔除指定的 4 个字段
    newPost: Omit<Post, '_id' | 'create' | 'update' | 'visitedNum'>;
}
```

```ts
export interface ReqUpdatePost {
    // { _id: string, title?: string, content?: string }
    update: { _id: string } & Partial<Pick<Post, 'title' | 'content'>>;
}
```

:::tip
即便客户端发送了协议以外的额外字段，TSRPC 类型系统也会自动剔除它们，确保类型和字段的严格安全。
:::

## CRUD 的完整例子

参见：https://github.com/k8w/tsrpc-examples/tree/main/examples/mongodb-crud