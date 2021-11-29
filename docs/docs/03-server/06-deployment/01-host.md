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
    # 安装依赖
    npm run install
    ```
## 启动服务

可直接启动服务：

```shell
node index.js
```

也可通过 PM2 启动服务：

```shell
pm2 start index.js
```