---
sidebar_position: 3
---

# WebSocket

At the `callApi` level, `WsClient` is exactly the same as `HttpClient`.
But in addition to that `WsClient` has some other operations.

## Connections

If you are creating a WebSocket client `WsClient`, then before `callApi` and `sendMsg`, you need to connect to the server manually: `

```ts
let result = await client.connect()

// The connection may not be successful (e.g. network errors), so remember to handle errors
if (!result.isSucc) {
  console.log(result.errMsg)
}
```

Correspondingly, the disconnection is.

```ts
client.disconnect()
```

## Disconnect and reconnect

Small network conditions can always happen from time to time. To make your application more robust, you can implement a disconnect reconnection mechanism via [Flow](... /flow/flow) to implement a disconnect and reconnect mechanism.

On the client side, `postDisconnectFlow` is triggered after changing from connected to disconnected state (WebSocket only) and is of type

```ts
Flow<{
    /* The reason for closure passed at `conn.close(reason)` on the Server side */
    reason?: string,
    /**
     * Whether the connection was manually disconnected by `client.disconnect()`.
     * If `false`, the connection was not initiated by the client (e.g. network error, the server disconnected, etc.).
     */
    isManual?: boolean
}>(),
```

With `isManual` you can determine if the connection is client-initiated or not, and if not, you can wait a short time and reconnect automatically. Example.

```ts
client.flows.postDisconnectFlow.push((v) => {
  if (!v.isManual) {
    // wait 2 seconds to reconnect automatically
    setTimeout(async () => {
      let res = await client.connect()
      // reconnect also error, popup error
      if (!res.isSucc) {
        alert('Network error, the connection has been disconnected')
      }
    }, 2000)
  }

  return v
})
```

:::tip
`postDisconnectFlow` is triggered only when the client changes from connected to disconnected state. Calling `client.connect()` in a disconnected state returns an error when the connection fails, but does not trigger the Flow, so the necessary error handling mechanism after `client.connect()` is also necessary.
:::

## sendMsg

Sending real-time messages to the backend via `sendMsg` is common for WebSocket clients.
Due to the cross-transport protocol implementation, `sendMsg` can also be called under `HttpClient`, but since it is short-connected, it can only be sent unidirectionally to the server and cannot receive messages pushed by the server.

```ts
client.sendMsg('Chat', {
  name: 'k8w',
  content: 'I love TSRPC.',
})
```

## listenMsg

Listen to and process live messages from the server with `listenMsg`.

:::tip
Only works for WebSocket.
:::

```ts
// Listening (will return the handler function passed in)
let handler = client.listenMsg('Chat', (msg) => {
  console.log(msg)
})

// unlisten
client.unlistenMsg('Chat', handler)
```

Client listens for messages because there is only a unique connection, so when listening for messages, the parameter received is the message itself: `msg: MsgXXXX`.
