---
sidebar_position: 4
---

- 工程化建议
    - 启动流程
    - 环境和配置
    - 代码结构

# 使用数据库

## 选择合适的数据库

有很多合适的数据库可供你选择，常见的例如：
- [MongoDB](https://mongodb.com)：纯 API 调用，无需学习 SQL，与 TypeScript 结合良好。
- [MySQL](https://mysql.com)：经典老牌 SQL 数据库。
- [Redis](https://redis.io)：内存型数据存储，适用于高速缓存等场景。

相比于 SQL 数据库，我们更推荐 MongoDB 这样的 NoSQL 数据库，它更适合使用 TypeScript + NodeJS 进行代码优先的开发。

## 全局实例

通常，你可以在启动之初就创建好数据库实例。
例如你可以放置一个 `export` 的全局实例：

```ts title="backend/src/index.ts
export const mongo = new MongoDB({...})
```

需要时直接引用全局数据库实例：

```ts title="backend/src/api/ApiXXXX.ts
import { mongo } from '../index';

await mongo.collection('xxx').find({}).toArray();

```

## 启动流程

大部分数据库使用前都需要先连接，为了确保用户的请求到达时一切已经准备就绪，你可以自行处理 Server 的启动流程。
例如先连接好所有数据库实例，再 `server.start()`。假设我们的服务同时用到了 `MongoDB` 和 `Redis`，你可以这样处理启动流程：

```ts title="backend/src/index.ts"

let server = new HttpServer();

// 全局数据库实例
export const redis = new Redis({...});
export const mongo = new Mongo.DB({...});

// 启动流程
async function main(){
    // 先连接数据库
    await redis.connect();
    await mongo.connect();

    // 再启动服务
    await server.start();
}
main().catch(e=>{
    // 任何启动过程异常，退出进程
    server.logger.error('启动失败', e);
    process.exit(-1);
});

```

## 配置
很多时候，尤其是在不同环境之间，你需要修改数据库的连接配置。
有很多种机制实现它们。
例如：
- 提取一个配置文件
- 通过环境变量获取

## 代码结构
把配置、公共全局实例、服务启动过程全部放在 `index.ts` 里看起来是臃肿且不直观的。你可以将它们整理分散到不同的模块文件中去，例如：
```
|- backend/src
    |- models
        |- Global.ts
    |- api
    |- index.ts
```