---
sidebar_position: 2
---

# 实现 Session 和 Cookie

:::danger WIP
此文档还在编写中…… 敬请期待。
:::

例子：
https://github.com/k8w/tsrpc-examples/tree/main/examples/session-and-cookie

## Cookie

### 概念

Cookie 是 HTTP 协议中的一个概念，常用于：
- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

你可以在 [MDN](https://developer.mozilla.org/docs/Web/HTTP/Cookies) 上查看更多 HTTP Cookie 的信息。

由于 TSRPC 被设计为跨协议的，也就是说它不一定是运行在 HTTP 协议之上，所以 TSRPC 框架**不使用** HTTP Cookie，但通过 Flow，我们可以很容易的实现同样的特性。这使它更佳通用，你可以在 APP、微信小程序、NodeJS客户端上也用到类似的功能。

### 实现

Cookie 的本质就是透传一组数据，这些数据可以在服务端设置，也可以在客户端设置。总而言之就是对一端发来的 Cookie 数据，接收端在返回时还原样带着它们（也可以修改）。

所以实现思路就是使用 Flow 对服务端和客户端进行改造：
1. 在所有请求和响应中加入公共字段 `__cookie`
2. Server 返回 API 响应时，自动将 `__cookie` 设为请求传来的值（除非重设）
3. Client 发送 API 请求时，自动将上一次返回的 `__cookie` 加入请求体中。上一次返回的 `__cookie` 应该被存储在了某处，例如 `localStorage`。

## Session

### 概念

跟 Cookie 提到的一样，Session 指会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）。

有一些情况，你希望这些数据只能被服务端修改或可见，客户端只有有限的使用权限（例如只读）。例如当前已经登录的用户是谁，显然这只能服务端说了算。

此时就需要一套由服务端维护的 Session 数据。

### 实现

1. 服务端在新客户端访问时，生成一个 Session ID，通过 Cookie 传递。
2. 服务端根据 Session ID 来存取 Session 数据，数据可以存储在内存、文件或数据库中，取决于实际情况。