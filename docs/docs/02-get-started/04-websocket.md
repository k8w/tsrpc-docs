---
id: websocket.html
description: TSRPC 一开始便设计为传输协议无关的架构，这使得它可以同时运行在 HTTP 和 WebSocket 上。TSRPC 的二进制序列化特性，还能显著减小包体，帮助实时服务提升传输效能。你可以通过 create-tsrpc-app 快速创建一个 WebSocket 实时聊天室项目。
keywords:
- tsrpc
- websocket
- ts websocket
- typescript websocket
- socketio
- protobuf
- grpc
- 实时游戏
- 实时服务
- nodejs websocket
---

# WebSocket 实时服务

TSRPC 一开始便设计为 [传输协议无关的架构](../inside/structure.html)，这使得它可以同时运行在 HTTP 和 WebSocket 上。
TSRPC 的二进制序列化特性，还能显著减小包体，帮助实时服务显著提升传输效能。

## WebSocket API
TSRPC 本身的设计架构是传输协议无关的，这意味着我们之前实现的 HTTP API 也可以无缝运行在 WebSocket 协议之上。
只需要将 `HttpServer` 替换为 `WsServer`，将 `HttpClient` 替换为 `WsClient` 即可。例如：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="server"
  values={[
    {label: '服务端', value: 'server'},
    {label: '客户端', value: 'client'}
  ]}>
  <TabItem value="server">

```ts
import { WsServer } from 'tsrpc';

const server = new WsServer(serviceProto, {
    port: 3000,
    json: true
});
```

  </TabItem>

  <TabItem value="client">

```ts
import { WsClient } from 'tsrpc-browser';

const client = new WsClient(serviceProto, {
    server: 'ws://127.0.0.1:3000',
    json: true
});

async function test(){
    // 由于是长连接，所以要先连接
    let resConnect = await client.connect();
    if(!resConnect.isSucc){
        console.error('连接失败', resConnect.errMsg);
    }

    let ret = await client.callApi('user/Login', { 
        username: 'admin',
        password: 'admin'
    });
    console.log(ret);
}
```

  </TabItem>
</Tabs>

:::info 重要
由于 WebSocket 是长连接，所以使用前需要先 `connect` 连接，你可以通过 `client.flows.postDisconnectFlow` 来监听连接断开事件。
:::

:::note
`Ws` 是 `WebSocket` 的简写。
:::

## 实时消息

在实时应用场景中，并非所有通讯都是 API 这样的 **请求/响应** 模型。
例如实时公告、聊天室等场景，客户端希望收到服务端的实时消息推送，而非发送请求轮询。

为此，TSRPC 提供了另一种基于 **发布/订阅** 的模型：消息服务 —— Message Service。

消息 `Message` 是 TSRPC 端到端通讯的最小单元。
我们可以使用 TypeScript 定义一种消息类型，它可以在服务端和客户端之间**双向传递**，也享有自动类型检测和二进制序列化特性。

### 定义消息

和 API 一样，**1 种消息对应 1 个定义文件**，存放在协议目录 `backend/src/shared/protocols` 下：

- 消息文件命名为 `Msg{消息名}.ts`
- 消息类型命名为 `Msg{消息名}`，可以是 `interface` 或 `type`

```ts title="MsgChat.ts"
export interface MsgChat {
  name: string,
  content: string
}
```

### 发送消息

消息可以双向传递，即可以从 Server 发给 Client，也可以从 Client 发给 Server。

#### Client 发送
```ts
client.sendMsg('Chat', {
  name: 'k8w',
  content: 'I love TSRPC.'
})
```

#### Server 发送
Server 同时可能连接着多个 Client，活跃中的所有连接都在 `server.connections`。
要给其中某个 Client 发送消息，可以使用 `connection.sendMsg` ，例如：
```ts
// 给第一个连接的 Client 发送消息
server.connections[0].sendMsg('Chat', {
  name: 'System',
  content: 'You are the first connection.'
})
```

#### Server 广播

要给所有 Client 发送消息，可以使用 `server.broadcastMsg()`，例如：
```ts
server.broadcastMsg('Chat', {
  name: 'System',
  content: 'This is a message to everyone.'
})
```

相比逐个连接去 `sendMsg()`，`broadcastMsg()` 的好处在于，只执行一次序列化编码过程，减少 CPU 开销。

### 监听消息

监听 / 解除监听消息在 Server 和 Client 类似，例子如下：

<Tabs
  defaultValue="server"
  values={[
    {label: 'Server', value: 'server'},
    {label: 'Client', value: 'client'}
  ]}>
  <TabItem value="server">

```ts
// 监听（会返回传入的处理函数）
let handler = server.listenMsg('Chat', call=>{
  server.broadcastMsg('Chat', call.msg);
});

// 取消监听
server.unlistenMsg('Chat', handler);
```

  </TabItem>

  <TabItem value="client">

```ts
// 监听（会返回传入的处理函数）
let handler = client.listenMsg('Chat', msg=>{
  console.log(msg.name, msg.content);
});

// 取消监听
client.unlistenMsg('Chat', handler);
```

  </TabItem>
</Tabs>

不同之处在于，由于 Server 同时可能连接着多个 Client，所以监听消息时收到的参数为 `call: MsgCall`。
其中除了消息内容（ `call.msg` ）外，还包含Client 连接（ `call.conn` ）等信息。

而 Client 由于只存在唯一的连接，故监听消息时，收到的参数即为消息本身：`msg: MsgXXXX`。

## 例子：实时聊天室

使用 [create-tsrpc-app](create-tsrpc-app.html) 创建一个带浏览器前端的 WebSocket 项目，里面已经自带了一个极简的聊天室的例子，你也可以在这里查看：

https://github.com/k8w/tsrpc-examples/tree/main/examples/chatroom