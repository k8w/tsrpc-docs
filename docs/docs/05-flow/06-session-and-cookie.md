---
sidebar_position: 6
slug: /docs/flow/session-and-cookie.html
---

# Session 和 Cookie

## Cookie

### 概念

Cookie 是 HTTP 协议中的一个概念，你可以在 [MDN](https://developer.mozilla.org/docs/Web/HTTP/Cookies) 上查看更多 HTTP Cookie 的信息。

由于 TSRPC 被设计为跨协议的，也就是说它不一定是运行在 HTTP 协议之上，所以 TSRPC 框架**不使用** HTTP Cookie，但通过 Flow，我们可以很容易的实现同样的特性。这使它更佳通用 —— 可以在 APP、微信小程序、NodeJS客户端上通用。

### 实现

HTTP Cookie 的本质就是透传一组数据，这些数据可以在服务端设置，也可以在客户端设置。简单说来就是服务端发送回来的 Cookie 数据，客户端把它存储下来，等到下一次请求时继续带到参数中。

#### 1. 给所有请求、响应增加公共的 `__cookie` 字段（通过基类继承）
```ts
export interface BaseRequest {
    __cookie?: Cookie;
}

export interface BaseResponse {
    __cookie?: Cookie;
}

export interface Cookie {
    sessionId?: string,
    [key: string]: any
}
```

#### 2. 客户端收到服务端发送的 `__cookie` 后，将其存在 `localStorage` 中

```ts
client.flows.preApiReturnFlow.push(v => {
    if (v.return.isSucc) {
        if (v.return.res.__cookie) {
            localStorage.setItem(CookieStorageKey, JSON.stringify(v.return.res.__cookie))
        }
    }

    return v;
})
```

#### 3. 客户端发送请求时，自动将本地存储的 `__cookie` 加入请求参数。
```ts
client.flows.preCallApiFlow.push(v => {
    let cookieStr = localStorage.getItem(CookieStorageKey);
    v.req.__cookie = cookieStr ? JSON.parse(cookieStr) : undefined;
    return v;
})
```

根据需要，还可以自行加入超时时间等其它逻辑。

## Session

### 概念

Session 指会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）。

跟 Cookie 一样，这些数据需要在多轮请求中保持；但区别在于客户端不能随意修改它们（例如已登录的用户ID），或者客户端压根看不见它们（例如一些访问统计数据）。

### 实现

1. 服务端在新客户端访问时，生成一个 Session ID，通过 Cookie 传递。
2. 服务端根据 Session ID 来存取 Session 数据，数据可以存储在内存或数据库中，取决于实际情况。

## 完整例子
https://github.com/k8w/tsrpc-examples/tree/main/examples/session-and-cookie
