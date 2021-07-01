---
sidebar_position: 2
---

# HttpClient

## HttpClientOptions

创建 `HttpClient` 时的配置选项。

| 字段名 | 类型 | 默认值 | 描述 |
| :-: | :-: | :-: | - |
| **server** | `string` | `"http://127.0.0.1:3000"` | Server URL, 以 `http://` 或 `https://` 开头。 |
| **json** | `boolean` | `false` | 是否启用 JSON 传输模式，启用后将使用 JSON 字符串替代二进制序列化传输。需要 Server 也开启 `jsonEnabled` 选项。 |
| **jsonPrune** | `boolean` | `true` | 使用 JSON 传输模式时，在运行时类型检测阶段，是否自动剔除协议中不存在的额外字段。出于安全性考虑，建议总是开启。|
| **logger** | `Logger` | `undefined` | API 请求/响应 等网络通讯情况，将被输出至指定的 `Logger` 中。如果需要将日志打印到控制台，可以设为 `console`；如果需要隐藏日志，可以设为 `undefined`。 |
| **timeout** | `number` | `undefined` | API 请求的超时时间（毫秒），`undefined` 或 `0` 意味不限时。 |
| **debugBuf** | `boolean` | `false` | 是否将二进制传输信息打印在日志中，当你开发二进制传输加密时，这些信息会便于你调试。 |

```ts
export interface HttpOptions {
    /** 
     * Server URL, 以 `http://` 或 `https://` 开头。
     * 默认："http://127.0.0.1:3000"
     */
    server: string;

    /** 
     * 是否启用 JSON 传输模式，启用后将使用 JSON 字符串替代二进制序列化传输。（也进行运行时类型检测）
     * 注意：需要 Server 也开启 `jsonEnabled` 选项。
     * 默认：false
     */
    json: boolean;

    /**
     * 使用 JSON 传输模式时，在运行时类型检测阶段，是否自动剔除协议中不存在的额外字段。
     * 出于安全性考虑，建议总是开启，需要动态字段的协议可以通过索引签名定义：
     * {
     *     aaa: string,
     *     bbb: number,
     *     // 通过索引签名允许额外字段
     *     [key: string]: any
     * }
     * 默认：true
     */
    jsonPrune: boolean;

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