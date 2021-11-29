---
id: install.html
description: 使用 create-tsrpc-app 工具快速创建 TSRPC 项目，或是跟随本篇文档指引，手动安装配置。
keywords:
  - tsrpc
  - tsrpc 安装
  - tsrpc 配置
  - tsrpc-cli
  - tsrpc.config.ts
  - tsrpc config
  - tsrpc dev
  - tsrpc build
---

# 安装

## 通过脚手架创建项目

你可以通过脚手架工具 [create-tsrpc-app](../get-started/create-tsrpc-app.html) 快速创建全栈或纯后端项目。

```shell
npx create-tsrpc-app@latest
# 或者
yarn create tsrpc-app
```

或者，你也可以根据本节内容，手动安装和配置项目。

## 手动安装

1. 安装 `tsrpc`
    ```shell
    npm install tsrpc
    # 或者
    yarn add tsrpc
    ```
2. 安装 `tsrpc-cli` 命令行工具
    ```shell
    npm install tsrpc-cli --save-dev
    # 或者
    yarn add tsrpc-cli --dev
    ```

## 配置

初始化配置文件：
```shell
npx tsrpc init
```

根目录下生成的 `tsrpc.config.ts` 即为 TSRPC 的项目配置文件，
`tsrpc-cli` 依据这些配置来执行各种命令。

配置项主要有 4 部分：
- proto：配置协议目录、接口实现目录、代码生成模板等
- sync：配置共享代码目录、同步方式及目标位置等
- dev：本地开发服务相关配置
- build：构建相关的配置

欲了解更多配置细节，参见 [配置参数说明](xxx) 。

## 入口文件

服务端的入口文件通常是 `src/index.ts`，入口文件的主要任务是：

1. 初始化（如连接数据库、注册接口等）
2. 启动 TSRPC Server

例如：

```ts
import * as path from "path";
import { HttpServer } from "tsrpc";
import { serviceProto } from "./shared/protocols/serviceProto";

// Create the Server
const server = new HttpServer(serviceProto, {
    port: 3000,
    // Remove this to use binary-only mode (remove from the client too)
    json: true
});

// Initialize
async function init() {
    // Auto implement APIs
    await server.autoImplementApi(path.resolve(__dirname, 'api'));

    // TODO
    // Prepare something... (e.g. connect the db)
};

// Entry
async function main() {
    await init();
    await server.start();
};
main();
```

如果你需要多平台部署，例如同时兼容 Serverless 云函数和 Docker 容器的部署，你可以针对不同平台编写多个入口文件。
云函数平台的入口文件可参考 [部署到 Serverless 云函数](advanced/serverless.html) 。

## 命令行工具

`tsrpc-cli` 是辅助 TSRPC 项目开发和构建的命令行工具，`npx tsrpc init` 后，会自动将常用命令写入 `package.json` 中。

常用命令：
- `npm run dev`：运行本地开发服务器
- `npm run build`：执行构建
- `npm run doc`：生成 API 接口文档

高级命令：
- `npm run proto`：重新生成协议定义 `ServiceProto`
- `npm run sync`：立即同步共享目录
- `npm run link`：立即创建共享目录的 Symlink

欲了解更多，可参考 [tsrpc-cli 使用说明](TODO) 。