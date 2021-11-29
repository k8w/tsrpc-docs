---
id: unit-test.html
---

# 单元测试

:::danger
此文档还在编写中…… 敬请期待。
:::

可使用 [Mocha](https://mochajs.org/) 等工具进行单元测试，
[create-tsrpc-app](../../get-started/create-tsrpc-app.html) 创建出的项目模板中，即包含单元测试的例子。

一般来说，有两种实现单元测试的方式：

1. 使用 Client 测试
    - 先 `npm run dev` 启动本地开发服务
    - 在测试用例中，通过 `new HttpClient` 创建真实客户端
    - 通过 `client.callApi` 真实发送请求完成测试
2. 使用 Server 测试
    - 无需启动服务
    - 通过 `server.callApi` 完成测试（不发送网络请求，直接调用 API 实现函数）