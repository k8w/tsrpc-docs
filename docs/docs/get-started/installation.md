---
sidebar_position: 1
---

# 项目初始化

## 使用脚手架工具

使用脚手架工具，快速初始化一个新项目。

```shell
npx create-tsrpc-app 项目名称
```

跟随指引操作即可，有丰富的模板可供选择：
- 纯后端服务
- TSRPC + React
- TSRPC + Vue

项目初始化后，均通过以下命令完成日常操作。

启动本地开发服务器
```shell
npm run dev
```

编译构建
```shell
npm run build
```

## Server

TSRPC 框架：
```shell
npm install tsrpc
```

生成协议用的命令行工具：（一般在后端项目下使用）
```shell
npm install tsrpc-cli --save-dev
```

## Client

### NodeJS
```shell
npm install tsrpc
```

### 浏览器
```shell
npm install tsrpc-browser
```

### 小程序
```shell
npm install tsrpc-miniapp
```

### React Native
```shell
npm install tsrpc-browser
```