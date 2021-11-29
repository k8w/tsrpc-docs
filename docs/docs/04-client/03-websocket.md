---
id: websocket.html
---

# WebSocket

:::info 重要
实时消息服务（Message Service）仅限 WebSocket 等长连接使用。
:::

## 连接

WebSocket 客户端需要先手动连接后方可使用：
```ts
let result = await client.connect();

// 连接不一定成功（例如网络错误），所以要记得错误处理
if(!result.isSucc){
    console.log(result.errMsg);
}
```

相应的，断开连接是：
```ts
client.disconnect();
```

## 调用 API 接口

WebSocket 客户端调用 API 接口的方式与 HTTP 客户端完全一致，参考 [调用 API 接口](api.html) 。

## 发送消息

通过 `sendMsg` 向后端发送实时消息，常见于 WebSocket 客户端。
由于跨传输协议的实现，在 `HttpClient` 下也可以调用 `sendMsg`，但由于它是短连接的，只能单方向向服务端发送，无法收到服务器推送的消息。

```ts
client.sendMsg('Chat', {
  name: 'k8w',
  content: 'I love TSRPC.'
})
```

## 监听消息

通过 `listenMsg` 来监听和处理服务端发来的实时消息。

:::info 重要
与服务端不同，Client 由于只存在唯一的连接，故监听消息时，收到的参数即为消息本身：`msg: MsgXXXX`。
:::

### 监听单个消息

第 1 个参数传入消息名，可以监听指定的消息，例如监听 `MsgChat` 消息：

```ts
let handler = client.listenMsg('Chat', msg => {
    // msg 即为 MsgChat
    console.log(msg);
});

// 解除监听
client.unlistenMsg('Chat', handler);
```

### 监听多个消息

第 1 个参数传入正则表达式，可以监听消息名匹配该表达式的所有消息，此时第二个参数为消息名。假设我们有 5 种消息：

- `room/UserJoin` `room/UserLeave`
- `game/GameStart` `game/GameFrame` `game/GameOver`

如果你想用一个函数统一监听 `game/` 下的所有消息，则可以：

```ts
let handler = client.listenMsg(/^game\//, (msg, msgName) => {
    // ...
});

// 解除监听
client.unlistenMsg(/^game\//, handler);
```

:::tip
`listenMsg` 方法会返回你传入的监听函数。
:::

## 断线重连
网络的小状况，总是可能时有发生。让你的应用更健壮，你可以通过 [Flow](../flow/flow) 来实现断线重连机制。

在客户端，`postDisconnectFlow` 触发于从连接状态变为断开之后（仅 WebSocket），其类型为：
```ts
Flow<{
    /** Server 端 `conn.close(reason)` 时传来的关闭原因 */
    reason?: string,
    /**
     * 是否是通过 `client.disconnect()` 手动断开连接的的。
     * 如果为 `false`，说明连接非客户端主动断开（例如网络错误、服务端断开了连接等）。
     */
    isManual?: boolean
}>(),
```

通过 `isManual` 可以判断连接是否客户端主动断开，如果不是，则可以等待一小段时间后自动重连。例如：
```ts
client.flows.postDisconnectFlow.push(v=>{
    if(!v.isManual){
        // 等待 2 秒后自动重连
        setTimeout(async ()=>{
            let res = await client.connect();
            // 重连也错误，弹出错误提示
            if(!res.isSucc){
                alert('网络错误，连接已断开');
            }
        }, 2000)
    }

    return v;
})
```

:::tip
`postDisconnectFlow` 仅当客户端从连接状态变为断开状态时触发。在已断开状态下调用 `client.connect()` 连接失败时会返回错误，但不会触发该 Flow。所以 `client.connect()` 后也有必要进行必要的错误处理机制。
:::
