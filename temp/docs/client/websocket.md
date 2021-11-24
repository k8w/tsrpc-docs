---
sidebar_position: 3
---

# WebSocket

在 `callApi` 层面，`WsClient` 与 `HttpClient` 完全一致。
但除此之外 `WsClient` 还有一些其它操作。

## 连接

如果你创建的是 WebSocket 客户端 `WsClient`，那么在 `callApi` 和 `sendMsg` 前，需要先手动连接到服务端：
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

## sendMsg

通过 `sendMsg` 向后端发送实时消息，常见于 WebSocket 客户端。
由于跨传输协议的实现，在 `HttpClient` 下也可以调用 `sendMsg`，但由于它是短连接的，只能单方向向服务端发送，无法收到服务器推送的消息。

```ts
client.sendMsg('Chat', {
  name: 'k8w',
  content: 'I love TSRPC.'
})
```

## listenMsg

通过 `listenMsg` 来监听和处理服务端发来的实时消息。

:::tip
仅对 WebSocket 生效。
:::

```ts
// 监听（会返回传入的处理函数）
let handler = client.listenMsg('Chat', msg => {
  console.log(msg);
});

// 取消监听
client.unlistenMsg('Chat', handler);
```

Client 由于只存在唯一的连接，故监听消息时，收到的参数即为消息本身：`msg: MsgXXXX`。
