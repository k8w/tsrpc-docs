---
id: serverless.html
---

# 部署到 Serverless 云函数

:::danger
此文档还在编写中…… 敬请期待。
:::

**TSRPC 提供了简单的办法快速适配兼容各个云函数平台**，修改入口点 `index.ts`：

1. 无需 `server.start()` 监听端口
2. 自行编写入口函数接收请求，输入到 TSRPC Server，后将输出返回给前端
    - JSON 传输可使用 `server.inputJSON`
        ```ts
        let output = await server.inputJSON(请求 JSON, URL 路径);
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