---
sidebar_position: 4
---

# 使用数据库

## 选择合适的数据库

有很多合适的数据库可供你选择，但无论如何，我们推荐你将其与 TypeScript 的强类型结合使用。
例如：
- MongoDB
- MySQL
- Redis

## 全局实例

你没必要在每个请求到达时都去创建一条全新的数据库连接，你可以在启动之初就创建好数据库实例。

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

大部分数据库使用前都需要先连接，为了确保用户的请求到达时一切都准备就绪，你可以自行处理 Server 的启动流程。
一般来说，推荐先准备好所有正常工作所必须的资源（例如连接好数据库），然后再启动 Server。假设我们的服务同时用到了 `MongoDB` 和 `Redis`，你可以这样处理启动流程：

```ts title="backend/src/index.ts"

let server = new HttpServer();

export const redis = new Redis({...});

export const mongo = new Mongo.DB({...});

async function main(){
    server.logger.log('开始连接 Redis ...');
    await redis.connect();

    server.logger.log('开始连接 MongoDB ...');
    await mongo.connect();

    server.logger.log('准备启动服务...');
    await server.start();
}
main().catch(e=>{
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