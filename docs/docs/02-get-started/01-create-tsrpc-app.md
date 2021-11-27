---
id: create-tsrpc-app.html
description: 使用 create-tsrpc-app 工具，可以快速创建 TSRPC 项目。创建过程是交互式的，在菜单上选择相应的配置，即可轻松创建包含前后端的 TSRPC 全栈应用项目。
keywords:
  - create-tsrpc-app
  - tsrpc
  - ts rpc
  - ts-rpc
  - TypeScript RPC
  - websocket
  - ts nodejs
  - nestjs
  - grpc
  - expressjs
  - koa
  - eggjs
---

# 创建 TSRPC 应用

## 创建项目

使用 `create-tsrpc-app` 脚手架工具，可以快速创建 TSRPC 项目：

```shell
npx create-tsrpc-app@latest
# 或者
yarn create tsrpc-app
```

创建过程是交互式的，在菜单上选择相应的配置，即可轻松创建包含前后端的 TSRPC 全栈应用项目。

![](assets/create-tsrpc-app.gif)

:::note
需要 NodeJS 12 以上，可通过 `npx create-tsrpc-app@latest --help` 查看更多帮助信息。
:::

## 全栈项目结构

服务端项目被命名为 `backend`，客户端项目被命名为 `frontend`，常见的目录结构如下：

```
|- backend --------------------------- 后端项目
    |- src
        |- shared -------------------- 前后端共享代码
            |- protocols ------------- 协议定义
        |- api ----------------------- API 实现
        index.ts
    |- tsrpc.config.ts --------------- TSRPC 项目配置文件

|- frontend -------------------------- 前端项目
    |- src
        |- shared -------------------- 前后端共享代码（Symlink）
            |- protocols
        |- index.ts
```

- `backend/src/shared`、`frontend/src/shared` 为共享代码目录
    - TSRPC 会在前后端项目中共享一些跨项目复用的代码，例如协议定义、公共类型和业务逻辑等。共享代码源存放于后端项目的 `src/shared` 目录下，并自动同步到前端项目中。
- `backend/tsrpc.config.ts` 为项目配置文件，可修改相关项目配置。

## 运行

在前端和后端项目下运行 `npm run dev` 即可启动本地服务。
项目模板里已经自带了小例子，启动看看效果吧~

```shell
cd backend
npm run dev
```

```shell
cd frontend
npm run dev
```

该命令会持续监听项目文件，当代码发生变化时，自动更新和重启服务。随便改几行代码保存，试试看有什么变化吧。

:::tip
建议你总是先启动后端，再启动前端。
:::

## 构建

在前端和后端项目下运行 `npm run build` 即可执行构建。

```shell
cd backend
npm run build
```

```shell
cd frontend
npm run build
```

构建完成后的制品将输出到 `dist` 目录下，可直接用于 [部署](deployment.html) 。