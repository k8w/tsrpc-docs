---
sidebar_position: 2
---

# Implementing Session and Cookies

## Cookies

### Concepts

Cookies are a concept in the HTTP protocol and you can see more information on HTTP cookies at [MDN](https://developer.mozilla.org/docs/Web/HTTP/Cookies).

Since TSRPC is designed to be cross-protocol, meaning it doesn't necessarily run on top of the HTTP protocol, the TSRPC framework **doesn't use** HTTP cookies, but with Flow, we can easily implement the same feature. This makes it more general -- it works on APPs, WeChat applets, and NodeJS clients.

### Implementation

The essence of an HTTP cookie is to pass through a set of data that can be set on the server side or on the client side. Simply put, the server side sends back the cookie data, the client stores it and continues to bring it to the parameters until the next request.

#### 1. Add a common `__cookie` field to all requests and responses (inherited via base class)

````ts
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
```  2.

#### 2. The client receives the `__cookie` from the server and stores it in `localStorage`

```ts
client.flows.preApiReturnFlow.push(v => {
    if (v.return.isSucc) {
        if (v.return.res.__cookie) {
            localStorage.setItem(CookieStorageKey, JSON.stringify(v.return.res.__cookie))
        }
    }

    return v;
})
````

#### 3. When the client sends a request, it automatically adds the locally stored `__cookie` to the request parameters.

```ts
client.flows.preCallApiFlow.push((v) => {
  let cookieStr = localStorage.getItem(CookieStorageKey)
  v.req.__cookie = cookieStr ? JSON.parse(cookieStr) : undefined
  return v
})
```

You can also add other logic such as timeout time as needed.

## Session

### Concepts

Session refers to session state management (e.g. user login status, shopping cart, game score or other information that needs to be recorded).

Like cookies, this data needs to be maintained over multiple requests; the difference is that the client cannot modify it at will (e.g. logged-in user IDs) or it is not visible to the client at all (e.g. some access statistics).

### Implementation

1. The server generates a Session ID when a new client accesses it, which is passed through a cookie.
2. The server accesses the Session data based on the Session ID, which can be stored in memory or in a database, depending on the situation.

## Full example

https://github.com/k8w/tsrpc-examples/tree/main/examples/session-and-cookie
