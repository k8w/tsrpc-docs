---
sidebar_position: 1
---

# 支持的平台列表

TSRPC 客户端支持许多平台，根据需要从不同的 NPM 包引入 `HttpClient` 或 `WsClient` 即可，其余的写法全部一样，例如：

```ts
import { HttpClient } from 'tsrpc-browser';
import { WsClient } from 'tsrpc-browser';
```

| 客户端平台 | NPM 包 |
| :-: | :-: |
| 浏览器、React Native | tsrpc-browser |
| 微信小程序 | tsrpc-miniapp |
| NodeJS | tsrpc |

:::danger WIP
此文档还在编写中…… 敬请期待。
:::