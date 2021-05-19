---
sidebar_position: 7
---

# Logger 日志管理

## 概述

无论是前端还是后台，一个工程化良好的应用，必然少不了日志。
虽然可以使用 `console.log` 来打印日志，但当面对一些特殊场景时，就会比较麻烦了。

例如：
- **服务端**
    - 给日志自动增加前缀（例如 IP 地址、已登录的用户 ID 等）
    - 输出日志到文件，输出为不同格式等（例如输出为 JSON 格式）
    - 上报日志到远程日志采集服务（例如 LogTail 等）
- **客户端**
    - 上报和统计异常日志
    - 隐藏日志（防止用户调试破解），但同时对开发人员显示（便于调试）

为了便于扩展日志处理流程，TSRPC 抽象了统一的日志管理类型 `Logger`。

## Logger

`Logger` 定义于 TSRPC 服务端及所有客户端的公共依赖库 `tsrpc-proto` 中。

```ts
export interface Logger {
    debug(...args: any[]): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
```

其实就是我们日常所用的 4 种 LOG 方法的抽象，如 `console` 就是一个合法的 `Logger`。
TSRPC 的所有 Server 和 Client 初始化时，都有一个 `logger` 参数，
TSRPC 内部使用它来输出所有日志。

`Server` 的默认 `Logger` 是 `new TerminalColorLogger()`，`Client` 的默认是 `console`。

## 上报日志

例如我们想要上报日志信息，同时隐藏 DEBUG 级别的日志，则可以创建一个自定义 `Logger`。

```ts
let logger: Logger = {
    debug(...args: any[]): ()=>{};
    log(...args: any[]): ()=>{
        console.log(...args);
        上报日志方法(...args);
    });
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
```