---
sidebar_position: 2
---

# 使用客户端

## 创建客户端

首先，根据 [运行平台](supported-platforms) 和服务端协议，创建 `HttpClient` 或 `WsClient`。
客户端支持并发请求，所以通常你只需要在全局创建和维护唯一的客户端实例即可，例如：

```ts title="apiClient.ts"
import { HttpClient } from 'tsrpc-browser';
import { serviceProto } from './shared/protocols/serviceProto';

// 创建全局唯一的 apiClient，需要时从该文件引入
export const apiClient = new HttpClient(serviceProto, {
    server: 'https://xxx.com/api',
    logger: console
});
```

`HttpClient` 和 `WsClient` 的构造函数均有 2 个参数。
第 1 个参数 `serviceProto`，即我们 `npm run proto` 生成出的 `serviceProto.ts` 中的协议定义。
第 2 个参数为客户端配置，可配置选项参见：
- `HttpClient` 配置选项：[HttpClientOptions](/api/http-client#httpclientoptions)
- `WsClient` 配置选项：[WsClientOptions](/api/ws-client#wsclientoptions)




## callApi

通过 `client.callApi` 来调用 API 接口：

```ts
let ret = await client.callApi('接口名', {
    // 请求参数
})
```

:::tip
包括 `callApi` 在内，TSRPC 的所有方法都 **不会** 抛出异常，所以你总是 **无需** `catch()` 或 `try...catch...` 。
:::

## ApiReturn
`callApi` 是异步的，它的返回类型是 `Promise<ApiReturn>`，包含了成功和错误 2 种情况：

```ts
export interface ApiReturnSucc<Res> {
    isSucc: true;
    res: Res;
    err?: undefined;
}

export interface ApiReturnError {
    isSucc: false;
    res?: undefined;
    err: TsrpcError;
}

export type ApiReturn<Res> = ApiReturnSucc<Res> | ApiReturnError;
```

## 错误处理

`callApi` 不总是成功的，可能出现一些错误。

### 传统方式的隐患

传统基于 `Promise` 或回调函数的方式存在一些隐患，这常常成为 BUG 的根源，例如：

#### 一、 分散地处理各种错误

例如如果你使用 `fetch`，通常有这些错误等着你处理：
```js
fetch(...)
    .then(v=>{ 
        1. HTTP 状态码报错
        2. HTTP 状态码正常，但返回了业务报错（例如 “余额不足” “密码错误”）
    })
    .catch(e=>{ 
        1. 网络错误
        2. 代码报错
    })
```

有非常多潜在的错误，它们分散在各个角落等着你处理。疏忽一处，就可能引发问题。

#### 二、 忘记处理错误

很多新手没有处理错误的意识，例如在上面的例子中，可能会忘记 `catch`。
这点小小的疏忽可能造成很大的问题，例如一个常见的需求：“请求期间显示 Loading”。
```js
showLoading();   // 显示一个全屏 Loading
let res = await fetch( ... );
hideLoading();   // 隐藏 Loading
```

乍一看没毛病，可一旦发生网络错误，`fetch` 会抛出异常，下面的 `hideLoading()` 不会执行。如此，界面上的 Loading 就永远不消失，通常被称为 “卡死了”。
不要小看它，实际项目中有相当比例 “卡死” 的问题跟这有关！

### TSRPC 的解决之道

先看例子：
```ts title="frontend/src/index.ts"
let ret = await client.callApi('Hello', {
    name: 'World'
});

// 处理错误，异常分支
if (!ret.isSucc) {
    alert('Error: ' + ret.err.message);
    return;
}

// 成功
alert('Success: ' + ret.res.reply);
```

在 TSRPC 中：
1. 所有方法都 **不会抛出异常**
    - 因此总是 **无需** `catch()` 或 `try...catch...` ，规避了新手陷阱。
2. 所有错误都 **只需在一处处理**
    - 根据 `ret.isSucc` 判断成功与否，成功则取响应 `ret.res`，失败则取错误 `ret.err`（包含了错误类型和详情信息）。
2. 通过 TypeScript 类型系统，巧妙的使你 **必须做错误检测**
    - 如果你将上面错误处理部分的代码删去，或是删除处理错误后的 `return`，TypeScript 编译器会报错。


## 取消请求

在一些场景下你可能会需要中途取消 API 请求。例如使用 React、Vue 开发的单页面应用，希望在组件 `unmount` 后取消尚未返回的 API 请求。

TSRPC 有 3 种方式来处理取消，取消之后的请求，其调用方收到的 Promise **既不会 `resolve` 也不会 `reject`**。

### 通过 `SN` 取消单个请求

每次 `callApi` 后都会为本次请求生成一个唯一的请求序号 `SN`，通过 `client.abort(SN)` 即可取消指定序号的请求。
通过 `client.lastSN` 可以获得最后发出的请求序号，例如：

```ts
client.callApi('XXX', { ... }).then(ret => {
    // 如果请求被取消，则无论服务端是否返回，客户端都不会处理
    console.log('请求完成', ret)
});

// 调用 callApi 后立即记录 SN
let sn = client.lastSN;

// 1 秒后，如果请求仍未完成，则会被取消
setTimeout(()=>{
    client.abort(sn);
}, 1000)
```

### 通过 `abortKey` 取消多个请求

`callApi` 可以的第 3 个参数是可选的配置项，其中包含 `abortKey`。
你可以在请求之初就事先指定一个 `abortKey`，然后调用 `client.abortByKey(key)` 来取消所有为指定 `abortKey` 且尚未结束的请求。（已完成的请求不受影响）

这对于前端组件化开发很有帮助，例如在组件内部 `callApi` 时总是指定 `abortKey: 组件ID`，然后在组件销毁时 `client.abortByKey(组件ID)`，即可实现组件销毁时自动取消内部未完成的请求，例如：

```ts
// 同一个 abortKey 可以影响多个请求
client.callApi('XXX', { ... }, { abortKey: 'MyAbortKey' }).then(ret => { ... });
client.callApi('XXX', { ... }, { abortKey: 'MyAbortKey' }).then(ret => { ... });
client.callApi('XXX', { ... }, { abortKey: 'MyAbortKey' }).then(ret => { ... });

// 1 秒后，取消那些尚未完成的请求
setTimeout(()=>{
    client.abortByKey('MyAbortKey');
}, 1000)
```

### 取消所有未完成的请求

通过 `abortAll()` 来取消客户端下所有未完成的请求：

```ts
client.abortAll();
```

## 自定义工作流

你可以通过 [Flow](../flow/flow) 来自定义客户端工作流程，实现诸如 [Session 和 Cookie](../flow/session-and-cookie)、[客户端权限验证](../flow/user-authentication)、[Mock](../flow/mock) 等特性。