---
sidebar_position: 1
---

# 支持的平台列表

## 总览

TSRPC 客户端支持许多平台，根据需要从不同的 NPM 包引入 `HttpClient` 或 `WsClient` 即可，不同平台间的是 API 一致的。

| 客户端平台 | NPM 包 |
| :-: | :-: |
| 浏览器、React Native | tsrpc-browser |
| 微信小程序 | tsrpc-miniapp |
| NodeJS | tsrpc |

例如在浏览器项目下使用，则对应 `tsrpc-browser` 这个库，首先安装它：

```shell
npm i tsrpc-browser
```

所有上述库中都已经自带了 TS 类型定义，根据代码提示引用即可：

```ts
import { HttpClient } from 'tsrpc-browser';
import { WsClient } from 'tsrpc-browser';
import { serviceProto } from './shared/protocols/serviceProto';

const client1 = new HttpClient(serviceProto, {
    server: 'https://xxx.com/api',
    logger: console
});

const client2 = new WsClient(serviceProto, {
    server: 'https://xxx.com/api',
    logger: console
});
```

客户端的具体用法见下一节 [使用客户端](use-client) 。

## 在跨平台项目下使用

例如你在使用 [uni-app](https://uniapp.dcloud.io/) 或 [Taro](https://taro.aotu.io/) 这样的跨平台前端框架实现一个需要同时支持多端（例如浏览器 + 微信小程序 + Android App + iOS App）的应用。
那么你需要根据实际运行的平台，来选择对应的客户端库。
由于 TSRPC 的 API 在不同平台的库之间是重名的，所以你需要在 `import` 时手动 `as` 为一个别名，例如：

```ts
import { HttpClient as HttpClientBrowser } from 'tsrpc-browser';
import { HttpClient as HttpClientMiniapp } from 'tsrpc-miniapp';
import { serviceProto } from './shared/protocols/serviceProto';

// 根据实际运行平台创建对应的 Client
export const client = 是微信小程序 ?
    // 微信小程序使用 tsrpc-miniapp
    new HttpClientMiniapp(serviceProto, {
        server: 'https://xxx.com/api',
        logger: console
    })
    // 浏览器和原生环境使用 tsrpc-browser (XMLHttpRequest 兼容的环境都可以使用 tsrpc-browser)
    : new HttpClientBrowser(serviceProto, {
        server: 'https://xxx.com/api',
        logger: console
    });
```

## 在 Cocos Creator 中使用

目前 Cocos Creator 2.x 和 3.x 各版本都是完美支持的。

由于 Cocos Creator 天然就是 NPM 支持良好，所以无需额外配置，参照上述例子 `npm install` 安装和 `import` 使用即可。
如果你的项目是跨平台的，那么也需要像上面的例子那样，根据运行平台来创建对应的客户端。