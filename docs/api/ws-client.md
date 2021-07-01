---
sidebar_position: 3
---

# WsClient

## WsClientOptions

创建 `WsClient` 时的配置选项。

| 字段名 | 类型 | 默认值 | 描述 |
| :-: | :-: | :-: | - |
| **server** | `string` | `"ws://127.0.0.1:3000"` | Server URL, 以 `ws://` 或 `wss://` 开头。 |
| **logger** | `Logger` | `undefined` | API 请求/响应 等网络通讯情况，将被输出至指定的 `Logger` 中。如果需要将日志打印到控制台，可以设为 `console`；如果需要隐藏日志，可以设为 `undefined`。 |
| **timeout** | `number` | `undefined` | API 请求的超时时间（毫秒），`undefined` 或 `0` 意味不限时。 |
| **debugBuf** | `boolean` | `false` | 是否将二进制传输信息打印在日志中，当你开发二进制传输加密时，这些信息会便于你调试。 |

```ts
export interface HttpOptions {
    /** 
     * Server URL, 以 `ws://` 或 `wss://` 开头。
     * 默认："ws://127.0.0.1:3000"
     */
    server: string;

    /**
     * API 请求/响应 等网络通讯情况，将被输出至指定的 `Logger` 中。
     * 如果需要将日志打印到控制台，可以设为 `console`；如果需要隐藏日志，可以设为 `undefined`。
     * 默认：`undefined` （这以为着如果你不设置 `logger`，则通讯细节会被隐藏，这有利于防止破解和提升安全性。）
     */
    logger?: Logger;

    /** 
     * API 请求的超时时间（毫秒），`undefined` 或 `0` 意味不限时。
     * 默认：`undefined`
     */
    timeout?: number;
    /**
     * 是否将二进制传输信息打印在日志中。
     * 当你开发二进制传输加密时，这些信息会便于你调试。
     * 默认：false
     */
    debugBuf?: boolean
}
```