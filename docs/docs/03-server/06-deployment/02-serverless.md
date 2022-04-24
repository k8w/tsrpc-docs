---
id: serverless.html
---

# 部署到 Serverless 云函数

## 概述

TSRPC 提供了简单的办法快速适配兼容各个云函数平台，修改入口点 `index.ts`：

1. 无需 `server.start()` 监听端口
2. 自行编写入口函数接收请求，输入到 TSRPC Server，后将输出返回给前端
    - JSON 传输可使用 `server.inputJSON`
        ```ts
        let output = await server.inputJSON(接口路径, 请求JSON);
        // 响应 output 为纯 JSON 对象（已对特殊类型自动转换），可直接发送给客户端
        ```
    - 二进制传输可使用 `server.inputBuffer`
        ```ts
        let output = await server.inputBuffer(请求二进制 Body)
        // 响应 output 为 Uint8Array，可直接发送给客户端
        ```
3. 自行实现初始化流程，可将 `autoImplementApi` 第二个参数设为 `true` 来延迟注册接口，提高冷启动速度
    ```ts
    await server.autoImplementApi(path.resolve(__dirname, 'api'), true);
    ```

演示案例：

https://github.com/k8w/tsrpc-examples/tree/main/examples/serverless-faas

## 阿里云

适配到阿里云函数计算：

1. 创建 HTTP 函数，`npm run build` 然后将 `dist` 目录下的代码上传到阿里云根目录
1. 在 Web IDE 终端执行命令：
    ```shell
    npm i
    ```
1. 配置 **函数入口** 为 `aliyun-fc.handler`
1. 配置 **初始化函数** 为 `aliyun-fc.initializer`
1. 修改前端项目下 `client.ts` 中的后端地址，测试运行

阿里云函数计算入口点：
```ts title="aliyun-fc.ts"
// 阿里云 - 函数计算：FC
// https://www.aliyun.com/product/fc/

import { init, server } from "./models/server";

// 阿里云函数计算 - HTTP函数
export async function handler(req: any, res: any, context: any) {
    // JSON 请求
    if (req.headers['content-type']?.includes('application/json')) {
        let apiName = req.path.slice(1);    // 去除开头的 "/"
        let ret = await server.inputJSON(apiName, JSON.parse(req.body));
        res.setStatusCode(ret.isSucc ? 200 : 500);
        res.send(JSON.stringify(ret));
    }
    // 二进制请求
    else {
        let output = await server.inputBuffer(req.body);
        res.send(Buffer.from(output));
    }
}

// 阿里云函数计算 - 初始化
export async function initializer(context: unknown, callback: Function) {
    await init();
    callback();
}
```

## 腾讯云

适配到腾讯云云函数：

1. 创建 Event 函数，`npm run build` 然后将 `dist` 目录上传到腾讯云，并更名为 `src` 目录
1. 在 Web IDE 终端执行命令：
    ```shell
    cd src
    npm i
    ```
1. 配置 **执行函数** 为 `txcloud-scf.handler`
1. 修改前端项目下 `client.ts` 中的后端地址，测试运行

腾讯云云函数入口点：
```ts title="txcloud-scf.ts"
// 腾讯云 - 云函数：SCF
// https://cloud.tencent.com/product/scf

import { init, server } from "./models/server";

export async function handler(event: any, context: any) {
    // init
    await ensureInit();

    let apiName = event.path.slice(event.requestContext.path.length + 1);    // 从 URL 中提取 ApiName
    let ret = await server.inputJSON(apiName, JSON.parse(event.body));

    return {
        "statusCode": ret.isSucc ? 200 : 500,
        "headers": { "Content-Type": "application/json" },
        "body": JSON.stringify(ret)
    }
}

let promiseInit: Promise<void> | undefined;
async function ensureInit() {
    if (!promiseInit) {
        promiseInit = init(true);
    }
    return promiseInit;
}
```

完整演示案例：

https://github.com/k8w/tsrpc-examples/tree/main/examples/serverless-faas