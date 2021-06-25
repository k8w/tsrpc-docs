---
sidebar_position: 3
---

#  API Service

API Service 是基于请求 / 响应模型的服务，即从客户端获取请求参数，经服务端处理后返回响应。
响应是必须的，无论服务端是否正确收到和处理请求，客户端都将收到明确的回复，含成功和错误两种情况。
这一过程在服务端被实现为一个异步函数。

## 实现 API

一个 API Service 的实现即是一个异步函数，一个空白的 API 实现函数，模板如下：

```ts
export async function ApiXXX(call: ApiCall<ReqXXX, ResXXX>) {

}
```

### ApiCall

实现函数有一个参数 `call: ApiCall<ReqXXX, ResXXX>`，我们通过该参数来获取请求参数和返回响应。

#### 打印日志
在一个 API 实现函数中，你应该使用 `call.logger` 来打印日志，而非 `console`。

```ts
call.logger.log('xxxxx');
```

这是因为，一个 `Server` 总是并行处理多个请求，如此多个请求的日志就会被合并在一起，你很难区分。
`call.logger` 会给日志信息自动增加一些前缀，例如连接 ID、请求 ID，这让你在调试时，能更方便的筛选同一条请求的日志。

![](assets/log.png)

如果你希望修改这些前缀，例如在一个前置的 [Flow](../flow/flow) 中解析了登录态，希望在每一条请求日志的前缀中，都增加已登录的用户 ID。
可以通过 `call.logger.prefixs` 来修改，例如：
```ts
call.logger.prefixs.push('UserID=123456');
```

#### 获取请求参数

`call.req` 即为客户端发送来的请求参数，它对应协议中名为 `Req{接口名}` 的类型。
一个 `ApiCall` 被解析出来后，`Server` 会立即对其执行自动类型检测。
所以无论实现函数还是 [Flow](../flow/flow) 中，`call.req` **一定是类型安全**的。

:::note
事实上由于 TSRPC 是二进制序列化的（并非 `JSON.stringify`），错误的类型根本无法传输过来。
:::

#### 返回响应或错误

API 接口对客户端的返回也是通过 `call` 来实现的，分为成功和错误两种情况。

通过 `call.succ(res)` 来返回成功的响应，`res` 即对应协议中定义的 `Res{接口名}` 类型。

通过 `call.error(message, data?)` 来返回错误响应，
第 1 个参数 `message` 应当为人类可读的错误信息，例如 “余额不足”、“密码错误” 等。
第 2 个参数选填，为错误的额外信息，可以传入任意字段（例如错误码），这些信息都可以在客户端被获取到。

所有返回给客户端的错误，都被封装为一个 `TsrpcError` 对象。

#### 其它
- 通过 `call.conn` 可以获取到传输该请求的 `Connection`。
- 通过 `call.server` 可以获取到 `Server`。

### TsrpcError

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

    // 两种构造函数，跟 call.error() 一致
    constructor(data: TsrpcErrorData);
    constructor(message: string, data?: Partial<TsrpcErrorData>);
}
```

不难发现，它的构造函数参数和 `call.error` 一致。因为 `call.error` 其实就相当于构造了一个 `TsrpcError` 对象，然后返回给前端。

#### 错误类型

服务端主动 `call.error` 返回的错误我们称之为业务错误，但除此之外，客户端在调用 API 的过程中还可能遇到很多其它错误。
例如网络错误、服务端代码报错导致的异常、客户端代码报错导致的异常等。
所有这些错误，我们都将它们纳入 `TsrpcError`，通过 `type` 来区分它们，当你在使用 `call.error` 时，错误类型默认设置为 `TsrpcError.Type.ApiError`。

所有错误类型定义如下，你可以使用 `TsrpcError.Type` 或 `TsrpcErrorType` 来使用这个枚举。

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

#### 错误码

你可能还注意到，`TsrpcError` 有一个默认的错误码字段 `code`，但它是 **可选** 的。

这是因为在实际项目中我们发现，对于绝大多数没有多语言需求的项目，其实错误码并没有什么卵用。
相比之下，一个人类可读的错误信息无论是对于开发人员调试，还是直接显示在前端界面，都更佳友好。
所以 TSRPC 将 `message` 作为必填字段，`code` 作为选填字段，当你有特殊需要时可以使用。

例如，有一种常见的错误叫 “您还未登录”，但它在前端显示的错误文案却经常修改，所以不适合直接显示 `message`。
并且无论在何处，前端只要收到这个类型的错误，就应当跳转到登录界面。
在这个场景下，我们需要识别这个指定类型的错误，那么就可以通过特定的错误码 `code` 来实现，它可以是整数或者字符串。
个人更倾向于使用字符串，因为相比减少几个字节的传输，我更希望调试时错误数据明晰易读，例如：

```ts
call.error('您还未登录', {
    code: 'NEED_LOGIN'
})
```

### 组织代码

随着项目规模的增长，一个 API 接口的实现代码不太可能全部都在一个文件内完成。
同时，我们可能还会有多个接口复用同一段业务逻辑代码的需要。
总而言之，我们需要拆分代码，然后在 API 接口中调用他们。

那么问题来了，如果不在 API 实现函数内，要怎么处理上面提到的分级日志和错误响应呢？

#### 1. 将 `logger` 作为参数传递
将 `logger: Logger` 作为一个参数传递给外部的公共函数，即可方便的实现多 API 复用情况下的分级日志处理。

```ts
export static class SomeUtil {
    static someFunc(logger?: Logger){
        logger?.log('xxxx');
    }
}
```

:::note
这并不会影响它在非 TSRPC 项目的兼容性，毕竟你总是能传递 `console` 作为一个合法的 `Logger`。
:::

#### 2. `throw new TsrpcError()`
设想一下你在开发一个 “购买商品” 的 API 接口，业务流程是这样的：

![](assets/throw-new-error.svg)

可以看到，当你将业务逻辑拆分，然后经过层层调用后，最终有一个错误信息要返回给顶层的调用端。
实际业务中的链路可能比这更长！通常我们可能是按这 2 种方式处理：

1. 将错误信息层层返回，然后在客户端的每个调用处去做错误检测，发现业务错误则 `call.error`。
    - 非常繁琐，会显著增加代码量；你在每个地方都必须检测错误，忘记一处就可能引发问题。
2. 将 `call` 层层向后传递，在实际错误发生处拿传递来的 `call` 去 `call.error`。
    - 非常不优雅，相当于将单纯的业务逻辑和 TSRPC 框架耦合在了一起，不便于它们的跨项目使用。

**TSRPC 给出了一种新的解决方式：`throw new TsrpcError()`** 

```ts
import { TsrpcError } from 'tsrpc';

export class 扣费模块 {
    扣费(logger?: Logger){
        if(余额不够){
            throw new TsrpcError('余额不足', {
                code: 'NOT_ENOUGH_MONEY'
            })
        }
    }
}
```

TSRPC 约定，API 接口实现函数在调用任何方法时，如果通过 `throw` 抛出异常：
- 如果抛出的错误是 `TsrpcError`，则视为是**可以直接返回给客户端的错误**，则会自动通过 `call.error` 返回给客户端。
- 如果不是，则视为是服务端代码报错，会返回一个 `type` 为 `ServerError` 的错误给客户端，错误信息默认为 `"Server Internal Error"`。

相应的，因为通过 `throw` 抛出了异常，API 实现函数也会中止执行。
因此，在业务代码被拆分至 API 实现函数以外时，`throw new TsrpcError` 是一种优雅简洁的无视调用层级向客户端直接返回错误的方式。

### 注意事项
`call.succ()` 和 `call.error()` 是两个函数调用，在执行后会立即向客户端发送返回数据，但这**不等于**实现函数执行结束。
它和 `return` 和 `throw` 有本质的区别。

例如这是一个 “购买商品” 接口：
```ts
export async function ApiBuy(call: ApiCall<ReqBuy, ResBuy>) {
    if(余额不足){
        call.error('余额不足了哟~');
        // return;
    }

    发货();
    call.succ({
        result: '购买成功'
    })
}
```

假设命中了 “余额不足”，执行了 `call.error` 返回错误。
但由于在这之后没有 `return`，所以代码还是会继续向后执行，一路 `发货()` 直到 `call.succ`。
虽然框架提供了保护，只有第一次返回生效，但 `发货()` 还是执行了。
虽然余额不足，但是却发货了，代表广大白嫖党先谢过。

**所以，请谨记：**

在 `call.error` 或 `call.succ` 后，如果这不是最后一行代码，但流程到此结束，务必记得 `return`。

## 挂载到 Server

实现一个 API 接口后，需要将其挂载到 `Server` 方能对外提供服务，这里有两种方法可以实现。

### 自动挂载

如果你是使用 `npx create-tsrpc-app@latest` 创建的项目，默认是采用这种形式。
在 `backend/src/index.ts` 中可以看到这样一行代码：

```ts
await server.autoImplementApi(path.resolve(__dirname, 'api'));
```

`server.autoImplementApi` 即是将目标文件夹中的 API 实现自动挂载，规则是：
- 根据协议目录下（`protocols`）的目录结构，查找所有 `PtlXXX.ts` 文件，在指定的 API 目录下，查找对应的文件（`Ptl` 前缀改为 `Api`）。
    - 例如 `protocols/a/b/PtlCCC.ts` 对应 `api/a/b/ApiAAA.ts`。
- 然后在该文件下，查找与 `ApiXXX` 同名的导出函数，将该函数作为 `PtlXXX` 的实现对外提供服务，例如：
```ts
export async function ApiXXX(call: ApiXXX<ReqXXX, ResXXX>) {

}
```
- 如果在该文件下找不到 `ApiXXX` 的同名函数，则使用 `default` 作为实现函数，例如：
```ts
export default async function(call: ApiXXX<ReqXXX, ResXXX>){
    
}
```

### 手动挂载

除自动挂载外，也可以手动挂载，例如：

```ts
server.implementApi('a/b/c/XXX', call => {
    // API 实现部分
});
```

建议你先将所有 API 实现函数都挂载好，再调用 `server.start()` 启动服务。