---
id: host.html
---

# 部署到云主机

:::danger
此文档还在编写中…… 敬请期待。
:::

## 构建
1. 执行构建
    ```shell
    cd backend
    npm run build
    ```

## 环境准备
1. 将构建好的制品 `backend/dist` 复制到云主机
2. 进入云主机下的程序目录，安装依赖
    ```shell
    npm run install
    ```
## 启动服务

可直接启动服务：

```shell
node index.js
```

考虑到后台运行、自动重启、多进程部署等需要，推荐通过 [PM2](https://pm2.keymetrics.io/) 启动服务：

```shell
npm install -g pm2
pm2 start index.js
```