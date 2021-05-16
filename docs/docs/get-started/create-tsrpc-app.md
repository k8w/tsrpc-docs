---
sidebar_position: 1
---

# 创建 TSRPC 应用

## 创建项目

使用 `create-tsrpc-app` 工具，可以快速创建 TSRPC 项目。
为方便演示，我们创建一个 Web 前端 + 后端的全栈项目。

```shell
npx create-tsrpc-app my-tsrpc-app --template web
```

这将创建一个叫做 `my-tsrpc-app` 的目录，并在其中初始化一个 Web 应用项目结构。

:::note
`create-tsrpc-app` 包含了很多开箱即用的全栈项目模板，可以通过 `--template` 参数来指定。你也可以省去 `--template` 参数，来创建一个纯粹的后端服务。[查看模板列表](a)
:::

## 目录结构

项目已经初始化好了，我们使用的是 `--template web` ，它包含 2 个项目：
- backend：TSRPC 后端服务
- frontend：Web 前端项目，未引入任何框架，仅用 WebPack 进行构建

目录结构释义如下：
```
|- backend --------------------------- 后端项目
    |- src
        |- shared -------------------- 前后端共享代码（同步至前端）
            |- protocols ------------- 协议定义
        |- api ----------------------- API 实现
        index.ts

|- frontend -------------------------- 前端项目
    |- src
        |- shared -------------------- 前后端共享代码（只读）
            |- protocols
        |- index.ts
    |- index.html
```

TSRPC 在前后端项目间共享协议定义等公共代码，来获得更好的代码提示和提高开发效率。

## 本地开发

前端和后端项目，均在各自的目录通过 `npm run dev` 运行本地开发服务。

```shell
cd backend
npm run dev
```

```shell
cd frontend
npm run dev
```

前后端都启动了，打开 http://127.0.0.1:8080 看看效果吧~

## 编译构建

同理，在各自的目录通过 `npm run build` 编译构建，默认输出到 `dist` 目录。
```shell
cd backend
npm run build
```

```shell
cd frontend
npm run build
```