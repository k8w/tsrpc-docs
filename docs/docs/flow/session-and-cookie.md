---
sidebar_position: 2
---

# 实现 Session 和 Cookie

:::danger WIP
此文档还在编写中…… 敬请期待。
:::

## Cookie

### 概念

Cookie 是 HTTP 协议中的一个概念，你可以在 [MDN](https://developer.mozilla.org/docs/Web/HTTP/Cookies) 上查看更多 HTTP Cookie 的信息。

由于 TSRPC 被设计为跨协议的，也就是说它不一定是运行在 HTTP 协议之上，所以 TSRPC 框架**不使用** HTTP Cookie，但通过 Flow，我们可以很容易的实现同样的特性。这使它更佳通用 —— 可以在 APP、微信小程序、NodeJS客户端上通用。

### 实现

HTTP Cookie 的本质就是透传一组数据，这些数据可以在服务端设置，也可以在客户端设置。简单说来就是服务端发送回来的 Cookie 数据，客户端把它存储下来，等到下一次请求时继续带到参数中。

所以实现思路就是使用 Flow 对服务端和客户端进行改造：
1. 在所有请求和响应中加入公共字段，比如取名为 `__cookie`（可以通过基类继承）
2. Server 返回 API 响应时，自动将 `__cookie` 设为请求传来的值（除非重设）
3. Client 发送 API 请求时，自动将上一次返回的 `__cookie` 加入请求体中。上一次返回的 `__cookie` 应该被存储在了某处，例如 `localStorage`。

## Session

### 概念

Session 指会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）。

跟 Cookie 一样，这些数据需要在多轮请求中保持；但区别在于客户端不能随意修改它们（例如已登录的用户ID），或者客户端压根看不见它们（例如一些访问统计数据）。

### 实现

1. 服务端在新客户端访问时，生成一个 Session ID，通过 Cookie 传递。
2. 服务端根据 Session ID 来存取 Session 数据，数据可以存储在内存或数据库中，取决于实际情况。

## 完整例子
https://github.com/k8w/tsrpc-examples/tree/main/examples/session-and-cookie
