---
sidebar_position: 3
---

# WebSocket Real-Time Services

WebSocket Real-Time Service has been one of the major challenges for Web applications.
The binary serialization feature of TSRPC can significantly reduce the package size and help improve the performance of realtime services.
You can quickly create a WebSocket realtime chat room project with `npx create-tsrpc-app@latest`.

## Real-Time API

TSRPC itself is designed to be protocol-independent, which means that the API implemented in [the previous section](the-first-api.md) runs seamlessly on top of the WebSocket protocol.
Simply replace `HttpServer` with `WebSocketServer` and `HttpClient` with `WebSocketClient`. Example.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="server"
values={[
{label: 'Server', value: 'server'},
{label: 'Client', value: 'client'}
]}>
<TabItem value="server">

```ts
import { WsServer } from 'tsrpc'

const server = new WsServer(serviceProto, {
  port: 3000,
})
```

  </TabItem>

  <TabItem value="client">

```ts
import { WsClient } from 'tsrpc-browser'

const client = new WsClient(serviceProto, {
  server: 'ws://127.0.0.1:3000',
  logger: console,
})

let ret = await client.callApi('Hello', {
  name: 'World',
})
```

  </TabItem>
</Tabs>

## Real-time messaging

However, in real-time application scenarios, not all communication is a **request/response** model like `API`.
For example, scenarios such as real-time announcements, chat rooms, etc., expect to receive real-time pushes from the server rather than sending request polls.

For this reason, TSRPC provides another **publish/subscribe** model: messages (`Message`).

A message is the smallest unit of end-to-end communication for TSRPC.
We can use TypeScript to define a message type that can be passed **both ways** between the server and the client, and also enjoys automatic type detection and binary serialization features.

### Defining messages

Like the API, the definition of a message is stored in the protocols directory `backend/src/shared/protocols` with the file naming convention `Msg{message name}.ts`.
Then declare a type with the same name in it and mark it as `export`, e.g.

```ts title="MsgChat.ts"
export interface MsgChat {
  name: string
  content: string
}
```

As with the API protocol, after adding or modifying a message definition, the ServiceProto should be regenerated and then synced to the front-end project.

```shell
cd backend
npm run proto
npm run sync
```

### Sending messages

Messages can be passed in both directions, i.e. from Server to Client and from Client to Server.

#### Client sends

```ts
client.sendMsg('Chat', {
  name: 'k8w',
  content: 'I love TSRPC.',
})
```

#### Server sends

The Server may be connected to multiple Clients at the same time, and all the active connections are in `server.conns`.
To send a message to one of these Clients, you can use `conn.sendMsg`, e.g.

```ts
// Send a message to the first connected Client
server.conns[0].sendMsg('Chat', {
  name: 'System',
  content: 'You are the first connection.',
})
```

:::note
`conn` is short for `Connection`.
:::

#### Server Broadcast

To send a message to all Clients, you can use ``server.broadcastMsg()`, for example

```ts
server.broadcastMsg('Chat', {
  name: 'System',
  content: 'This is a message to everyone.',
})
```

The advantage of `broadcastMsg()` is that it only performs the serialization process once, reducing CPU overhead compared to going to `sendMsg()` connection by connection.

### Listening to messages

Listening / unlistening messages are similar in Server and Client, examples are as follows.

<Tabs
defaultValue="server"
values={[
{label: 'Server', value: 'server'},
{label: 'Client', value: 'client'}
]}>
<TabItem value="server">

```ts
// Listening (will return the handler function passed in)
let handler = server.listenMsg('Chat', (call) => {
  server.broadcastMsg('Chat', call.msg)
})

// unlisten
server.unlistenMsg('Chat', handler)
```

</TabItem>

  <TabItem value="client">

```ts
// Listening (will return the handler function passed in)
let handler = client.listenMsg('Chat', (msg) => {
  console.log(msg.name, msg.content)
})

// unlisten
client.unlistenMsg('Chat', handler)
```

  </TabItem>
</Tabs>

The difference is that since the Server may be connected to multiple Clients at the same time, the parameters received when listening for messages are `call: MsgCall`.
In addition to the message content (`call.msg`), it also contains information about the Client connection (`call.conn`).

Since the Client only has a unique connection, when listening to the message, the parameter received is the message itself: `msg: MsgXXXX`.

## Example: Live Chat Room

Use `npx create-tsrpc-app@latest` to create a WebSocket project with a browser frontend, which already comes with a minimalist chat room example, which you can also see here.

https://github.com/k8w/tsrpc-examples/tree/main/examples/chatroom
