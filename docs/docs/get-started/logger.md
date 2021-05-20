---
sidebar_position: 7
---

# Logger 日志管理

## 概述

无论是前端还是后台，一个工程化良好的应用，必然少不了日志。
虽然可以使用 `console.log` 来打印日志，但当面对一些特殊场景时，就会比较麻烦了。
例如：

**服务端**
- 想让 API 日志按固定格式排版（例如增加 IP 地址、已登录的用户 ID 作为前缀）
- 输出日志到文件，甚至输出为不同格式（如 JSON）
- 上报日志到远程日志采集服务（如 LogTail、LogStash）

**客户端**
- 上报和统计异常日志
- 隐藏日志（防止破解），但对开发人员显示（便于调试）

为了便于扩展日志处理流程，TSRPC 抽象了统一的日志管理类型：`Logger`。

## Logger

`Logger` 是一个抽象的日志输出器，定义于 TSRPC 的公共依赖库 `tsrpc-proto` 中。

```ts
export interface Logger {
    debug(...args: any[]): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
```

跟 `console` 一样，我们定义了 4 种日志级别及其输出方法：`debug`、`log`、`warn`、`error`。
显然，`console` 就是一个合法的 `Logger`。

TSRPC 的所有 Server 和 Client 初始化时，都有一个 `logger` 参数，
`Server` 默认是 `TerminalColorLogger` （会将日志带颜色输出到控制台），`Client` 默认是 `console`。
TSRPC 使用 `logger` 来输出所有内部日志。你可以修改初始化时的 `logger` 配置，从而实现定制日志输出流程。

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="server"
  values={[
    {label: '服务端', value: 'server'},
    {label: '客户端', value: 'client'},
  ]}>
  
  <TabItem value="server">

```ts
let server = new HttpServer(serviceProto, {
    logger: myLogger
})
```

  </TabItem>

  <TabItem value="client">

```ts
let client = new HttpClient(serviceProto, {
    logger: myLogger
})
```

  </TabItem>
</Tabs>

## 服务端日志

在服务端，你应该尽量避免直接使用 `console`，而是使用 `Server`、`Connection`、`Call` 各自的 `logger`，例如：

```ts
server.logger.log('This is server-level log');
conn.logger.log('This is connection-level log');
call.logger.log('This is call-level log');  // call is ApiCall or MsgCall
```

其中，`conn.logger` 会在 `server.logger` 的基础上增加额外前缀，例如 IP地址；
`call.logger` 会在 `conn.logger` 的基础上增加额外前缀，例如 API 调用路径。

- **Server 级日志**
> 图
- **Connection 级日志**
> 图
- **Call 级日志**
> 图

基于父级 `Logger` 增加前缀，是通过 `tsrpc` 内置的 `PrefixLogger` 实现的。
你也可以自行添加或修改这些前缀，例如将用户 ID 加入 `call.logger` 的前缀中：

```ts
call.logger.prefixs.push('UserID=XXXX');
```

:::note
TSRPC Server 设计为 `Server` -> `Connection` -> `Call` 的三层结构，自上而下都是一对多的关系。
（HTTP 短连接例外，它的 1 个 `Connection` 仅对应 1 个 `Call`）
:::

即便有一些公共代码，它们不直接出现在 API 实现代码内，但可能被 API 间接调用，也推荐你将 `logger` 作为参数传递过去。
比如你有一个公共的支付方法 `PayUtil.pay`，有很多 API 会调用它进行支付，每次支付都会留下日志记录。
当出现账务问题时，你查阅这些日志，你一定想知道这些支付请求究竟是被哪个 API 发起的。
此时，将 `ApiCall` 的 `logger` 传入，可就大有用处了。

```ts
export class PayUtil {
    static pay(username: string, amount: number, productId: string, logger?: Logger){
        logger?.log(`${username} payed ${amount} for product ${productId}`)
    }
}
```

:::note
这并不会影响它在其它项目 的兼容性，毕竟你总是能传递 `console` 作为一个合法的 `Logger`。
:::

## 例子

例如我们想要上报异常日志，同时隐藏 DEBUG 级别的日志，则可以创建一个自定义 `Logger`：

```ts
let logger: Logger = {
    debug(...args: any[]): ()=>{
        // 什么也不做，相当于隐藏了日志
    };
    log(...args: any[]): ()=>{
        // 让日志仍然输出到控制台
        console.log(...args);
        // LOG 级别的日志就不上报了
    });
    warn(...args: any[]): ()=>{
        // 让日志仍然输出到控制台
        console.warn(...args);
        // WARN 日志，上报
        上报日志方法(...args);
    };
    error(...args: any[]): ()=>{
        // 让日志仍然输出到控制台
        console.error(...args);
        // ERROR 日志，上报
        上报日志方法(...args);
    };
}
```

又例如我们在客户端，希望对普通用户隐藏日志，但对开发人员可见：

```ts
// 设定一个隐蔽的触发机关（例如借助 localStorage）
let logger = localStorage.getItem('debug') === 'yes' ? console : null;

let client = new HttpClient(serviceProto, {
    server: 'xxx',
    logger: logger
})
```

:::tip
`logger` 对客户端来说可以为 `null` 或 `undefined`，此时所有日志将被隐藏。
:::