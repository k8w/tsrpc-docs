---
sidebar_position: 1
---

# Flow

## Flow 是什么？

任何一种框架，想要适应更多的业务场景，就离不开良好的可扩展性。
`Flow` 就是 TSRPC 为此设计的一种全新概念。

> 图 Flow 执行流程

`Flow` 与管线类似，它由一组输入输出类型都相同的函数组成。
我们把其中的每个函数称为 `FlowNode`，同步或异步皆可。与管线有一点区别的是，`FlowNode` 可以返回 `null` 或 `undefined` 来代表**中断流程**。
每一个 `Flow` 和都有一个固定的数据类型 `<T>`，即它节点函数的输入和输出类型，定义如下：

```ts title="FlowNode 定义"
export type FlowNodeReturn<T> = T | null | undefined;
export type FlowNode<T> = (item: T) => FlowNodeReturn<T> | Promise<FlowNodeReturn<T>>;
```

`Flow` 就像一个 `FlowNode` 的数组，你可以通过 `flow.push(flowNode)` 来追加一个新节点。
`Flow` 在执行时，将从第一个 `FlowNode` 开始执行（参数为原始输入参数），然后将上一个 `FlowNode` 的输出作为下一个 `FlowNode` 的输入，逐个执行；直到得到最后的输出或收到 `null` 或 `undefined` 而提前中断。

接下来就来看一下 `Flow` 在 TSRPC 中的具体使用方式。

## TSRPC 工作流

TSRPC 为整个通讯过程制定了统一的工作流。
在此基础之上，将工作流中的一些节点，通过 `Flow` 曝露出来供开发者定制。
完整的 TSRPC 工作流如下：

**服务端**
> 图

**客户端**
> 图

由图可见，TSRPC 中所有可供定制的 `Flow` 清单如下：

### Server Flows
| 名称 | 作用 |
| - | - |
| asd | gdg |

### Client Flows
| 名称 | 作用 |
| - | - |
| asd | gdg |

想要控制工作流，向这些 `Flow` 中 `push` 你自己的 `FlowNode` 函数即可，例如一个实现简单的登录验证：

```ts
server.flows.preApiCallFlow.push(call => {
    if(isLogined(call)){    // 假设你有一个 isLogined 方法来检测是否已登录
        return call;    // 正常返回，代表流程继续
    }
    else{
        call.error('您还未登录');
        return null;    // 返回 null 或 undefined，代表流程中断
    }
});
```

### 特别说明
根据名称可以看出，TSRPC 的内置 `Flow` 分为两类，`Pre Flow` 和 `Post Flow`。当它们的 `FlowNode` 中途返回了 `null` 或 `undefined` 时，都会中断 `Flow` 后续节点的执行。但对于 TSRPC 工作流的影响，有所区别：
- 所有 `Pre Flow` 的中断，**会**中断后续的 TSRPC 工作流，例如 Client `preCallApiFlow` 中断，则会阻止 `callApi`。
- 所有 `Post Flow` 的中断，**不会**中断后续的 TSRPC 工作流，例如 Server `postConnectFlow` 中断，**不会**阻止连接建立和后续的消息接收。

## 类型扩展

如上面所见，很多 `Flow` 中伴随着 `Connection` 或 `Call` 的传递。
在这个过程中，我们可能会希望给它们增加一些额外的数据。
例如：
- 希望增加一个 `conn.connectedTime` 来记录连接建立时间
- 在统一的 `Flow` 中解析登录态，然后将登录用户信息放在 `call.currentUser` 向后传递。

显然 TSRPC 本身不具备这些字段，直接使用它们会报错，所以需要先对 TSRPC 的已有类型进行扩展。
TSRPC 支持以如下的方式进行类型扩展：

### 直接扩展 `tsrpc` 库的类型

在 `declare module 'tsrpc'` 中直接扩展现有的类型：

```ts
declare module 'tsrpc' {
    export interface HttpConnection {
        // 自定义的新字段
        connectedTime: number;
    }

    export interface ApiCall {
        currentUser: {
            userId: string,
            nickname: string
        }
    }
}
```

之后，你在使用这些类型时，上述自定义的字段已经合法。
在任何地方使用它们都是类型正确的，例如：

- **在 Flow 中**
```ts
server.flows.postConnectFlow.push(conn => {
    conn.connectedTime = Date.now();
});

server.flows.preApiCallFlow.push(call => {
    call.currentUser = {
        userId: 'xxx',
        nickname: 'xxx'
    }
})
```

- **在 API 实现中**
```ts
export async function ApiXXX(call: ApiCall<ReqXXX, ResXXX>){
    // call.currentUser 变成合法字段
    call.logger.log(call.currentUser.nickname);
}
```

但如果你希望在一个程序中启动两个不同的 `Server`，它们各自扩展不同的字段，例如：
- `server1` 仅增加 `call.currentUser`
- `server2` 仅增加 `call.loginedUser`

那么直接扩展 `tsrpc` 库的类型就可能导致混用的可能，此时就需要通过创建新类型的方式实现扩展。

### 创建新类型

创建新的 `Connection` 和 `Call` 的类型，同时兼容已有的类型定义：

```ts
type MyConnection = WebSocketConnection & {
    connectedTime: number
}

type MyCall<Req=any, Res=any> = ApiCall<Req, Res> & {
    currentUser: {
        userId: string,
        nickname: string
    }
}
```

然后在需要使用的地方，手动替换为自己的类型：

- 在 Flow 中
```ts
server.flows.preApiCallFlow.push((conn: MyConnection) => {
    conn.connectedTime = Date.now();
});

server.flows.preApiCallFlow.push((call: MyCall) => {
    call.currentUser = {
        userId: 'xxx',
        nickname: 'xxx'
    }
})
```

- 在 API 实现中
```ts
export async function ApiXXX(call: MyCall<ReqXXX, ResXXX>){
    // call.currentUser 变成合法字段
    call.logger.log(call.currentUser.nickname);
}
```

## 例子
通过灵活的 `Flow`，开发者可以实现很多特性，我们整理了一些常见的场景：
- [实现 Session 和 Cookie 特性](xxx.md)
- [用户登录和权限验证](xxx.md)
- [基于二进制的传输加密](xxx.md)
- [前端本地 Mock 测试](xxx.md)
- [结合 Prometheus 进行 QPS 统计](xxx.md)

<!-- - 触发事件：例如监听接收到 API 请求的事件，以便统计访问 QPS。
- 转换数据：例如在发送二进制数据前加密，接收数据前解密。
- 暂停继续：例如前端请求了一个需要登录的接口，则自动拉起登录弹框，登录成功后再继续发送请求。
- 中断流程：例如在检测到操作权限不足后，提前拦截 API 请求。 -->

:::danger WIP
此文档还在编写中…… 敬请期待。
:::