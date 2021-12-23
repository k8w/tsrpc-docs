---
id: container.html
---

# 部署到容器或集群

create-tsrpc-app 创建出的项目模板中，已经包含了 Dockerfile：`backend/Dockerfile`，可直接用于构建镜像。

Dockerfile 示例：

```Dockerfile
FROM node

# 使用淘宝 NPM 镜像（国内机器构建推荐启用）
RUN npm config set registry https://registry.npmmirror.com/

# npm install
ADD package*.json /src/
WORKDIR /src
RUN npm i

# build
ADD . /src
RUN npm run build

# clean
RUN npm prune --production

# move
RUN rm -rf /app \
    && mv dist /app \
    && mv node_modules /app/ \
    && rm -rf /src

# ENV
ENV NODE_ENV production

EXPOSE 3000

WORKDIR /app
CMD node index.js
```