---
id: deployment.html
description: TSRPC 支持部署到云主机、Serverless 云函数、Docker 容器和 Kubernetes 集群等多种平台。针对不同云函数平台的标准差异，TSRPC提供了简单快速的兼容适配方案。
keywords:
- tsrpc
- serverless
- midway
- 云函数
- 函数计算
- faas
- scf
- tsrpc 部署
- tsrpc serverless
- tsrpc 云函数
---

# 部署

TSRPC 支持多种平台的部署，本节仅做简单介绍，欲了解更多请参见 [更多部署指南](#更多部署指南) 。

## 服务端

1. 执行构建
    ```shell
    cd backend
    npm run build
    ```
2. 将构建好的制品 `backend/dist` 复制到云主机
3. 进入云主机下的程序目录，安装依赖然后运行 `index.js` 即可
    ```shell
    # 安装依赖
    npm run install
    # 启动服务
    node index.js
    ```

## 客户端

1. 执行构建
    ```shell
    cd frontend
    npm run build
    ```
2. 将构建好的制品 `frontend/dist` 复制到文件服务器或 CDN

:::note
[create-tsrpc-app](create-tsrpc-app.html) 自带的项目模板均采用前后端分离的架构，前端只需要部署静态文件。
如果你使用其它前端框架，请参照框架要求自行构建部署。
:::

## Serverless 云函数

Serverless 云函数是流行的部署方案，具有运维简单，价格低廉等优点。
主流的云厂商如阿里云、腾讯云都已经提供了云函数平台，但各自标准不一，难以兼容。

TSRPC 服务端可快速兼容适配至各个云函数平台，一套代码可以同时兼容云函数、Docker 容器的部署。

欲了解更多，参见 [部署到 Serverless 云函数](../server/deployment/serverless.html) 。

## 更多部署指南

TSRPC 支持多平台的部署，本节仅做简单介绍，欲了解更多可查看详细部署指南：
- [部署到云主机](../server/deployment/host.html)
- [部署到 Serverless 云函数](../server/deployment/serverless.html)
- [部署到容器或集群](../server/deployment/container.html)

## 小结

至此，你已了解了 TSRPC 的常见使用方式。
当然 TSRPC 能做的远不止这些，进一步学习可查看左侧目录中的更多专题文档，
也欢迎你加入微信交流群，共同学习成长。

:::note 扫码加入微信交流群 （请注明来意）
![](../assets/wechat.png)
:::