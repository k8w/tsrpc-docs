---
sidebar_position: 2
slug: /docs/engineering/error.html
---

# 错误处理

## TsrpcError

所有 TSRPC 服务端返回给客户端的错误被封装为 `TsrpcError`，类型定义如下：
```ts
export class TsrpcError {
    // 人类可读的错误信息
    message: string;
    // 错误类型
    type: TsrpcErrorType;
    // 错误码
    code?: string | int;
    // 可以传入任意字段
    [key: string]: any;
    // ...
}
```

`call.error` 其实就相当于构造了一个 `TsrpcError` 对象，然后返回给客户端。

### 错误类型

一般你在 API 中主动 `call.error` 返回的错误都是业务错误。
但除此之外，客户端在调用 API 的过程中还可能遇到很多其它错误。
例如网络错误、服务端代码报错导致的异常、客户端代码报错导致的异常等。
所有这些错误，我们都将它们纳入 `TsrpcError`，通过 `type` 来区分它们，当你在使用 `call.error` 时，错误类型默认设置为 `TsrpcError.Type.ApiError`。

所有错误类型定义如下，你可以使用 `TsrpcError.Type` 来使用这个枚举。

```ts
export enum TsrpcErrorType {
    /** 网络错误 */
    NetworkError = "NetworkError",
    /** 服务端内部异常（例如代码报错） */
    ServerError = "ServerError",
    /** 客户端内部异常（例如代码报错） */
    ClientError = "ClientError",
    /** 业务错误 */
    ApiError = "ApiError"
}
```

### 错误码

你可能还注意到，`TsrpcError` 有一个默认的错误码字段 `code`，但它是 **可选** 的。

这是因为在实际项目中我们发现，对于绝大多数没有多语言需求的项目，其实错误码并没有什么卵用。
相比之下，一个人类可读的错误信息无论是对于开发人员调试，还是直接显示在前端界面，都更佳友好。
所以 TSRPC 将 `message` 作为必填字段，`code` 作为选填字段，当你有特殊需要时可以使用。

例如，有一种常见的错误叫 “您还未登录”，无论在何处，前端只要收到这个类型的错误，就应当跳转到登录界面。
在这个场景下，我们需要识别这个指定类型的错误。
虽然你也可以通过 `message` 来识别，但那总是不可靠的，万一哪天错误文案改了就失效了。此时就可以通过特定的错误码 `code` 来实现，它可以是整数或者字符串。
我们更倾向于使用字符串，因为相比减少几个字节的传输，调试时明晰易读的错误信息会更加方便，例如：

```ts
call.error('您还未登录', {
    code: 'NEED_LOGIN'
})
```

## 客户端错误处理

`callApi` 不总是成功的，可能出现一些错误，例如网络错误、业务错误等。
很多经验不足的程序员总是不记得处理错误，经常导致很多 “卡死” 的问题，例如：

```js
showLoading(); 
let res = await fetch( ... );
hideLoading();
```

`fetch` 后忘记 `catch`，一旦遇到网络错误抛出异常，则 `hideLoading` 不会执行，Loading 永远不消失，表现为 “卡死”。

#### TSRPC 的解决之道
1. 所有方法都 **不会抛出异常**，所有错误都通过 `return` 返回
    - 因此总是 **无需** 捕获异常，规避了新手总是忘记 `catch` 的坑。
2. 所有错误都 **只需在一处处理**
    - 根据 `ret.isSucc` 判断成功与否，成功则取响应 `ret.res`，失败则取错误 `ret.err`（包含了错误类型和详情信息）。
3. 通过 TypeScript 类型系统，巧妙的使你 **必须做错误检测**，例如：
    ```ts
    let ret = await client.callApi('Hello', {
        name: 'World'
    });

    if (ret.isSucc) {
        // 做了错误检测，不会报错
        console.log('Success', ret.res.reply);
    }

    // 未做错误检测，会报错
    console.log('Success', ret.res.reply);
    ```