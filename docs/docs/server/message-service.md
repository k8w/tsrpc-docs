---
sidebar_position: 4
---

# Message Service

## Message Service 是什么
Message Service 是基于发布 / 订阅模型的服务，消息可以在服务端、客户端之间双向发送。
更多见于长连接（如 WebSocket）上的实时交互、服务端推送等场景。

:::note
短连接上（如 HTTP）只能从客户端向服务端发送消息，无法从服务端向客户端推送消息，如有需要可以改用长连接。
:::

区别于 API Service，消息不存在响应。
即消息发送出去之后，即视为完成，并不确保对方成功接收和处理了消息。
你也可以把消息理解为 TSRPC 的最小传输单元，基于 Message Service，你可以自由的实现各种通讯模型。

:::tip
消息是否有序到达，取决于实际的传输协议。目前的 HTTP 和 WebSocket，由于传输层是基于 TCP 协议的，所以消息的到达是有序的。未来如果支持了 UDP 协议…… 未来再说……
:::

使用 `listenMsg` 和 `unlistenMsg`，就可以像监听事件那样来接收和处理消息。

跟 API 接口一样，消息的传输也会经过运行时的类型检测和二进制序列化，
所以消息定义也会作为协议的一部分存储在 [ServiceProto](service-proto#serviceproto) 中, 所以我们要先定义它。

## 定义消息
跟 API Service 一样，消息的定义也是通过 **名称** 来识别的。
命名规则在 [之前的文章](service-proto#定义规则) 中已有介绍，即：

- 文件名为：`Msg{消息名}.ts`，下面的几项都定义于此文件内
- 消息类型名为：`Msg{消息名}`
- 额外配置项为：`export const conf = { ... }`

## 发送消息

消息可以在服务端和客户端之间双向发送。

### 客户端发送
客户端到服务端的发送非常简单，只需要：
```ts
client.sendMsg('Msg名称', {
  // 消息体（即 MsgXXX 的类型定义）
})
```

### 服务端发送

服务端同时会存在多个客户端连接，所以要发送消息，首先要决定发送给谁。
一个客户端，即指 TSRPC [三层结构](structure#协议无关的三层架构) 中的一个 Connection。
向 Connection 发送消息，有两种形式可以实现。

#### 向指定客户端发送
首先找到你要发送的 Connection：

1. 当前所有客户端连接可以在 `server.conns` 中获取。
2. 每个 `ApiCall` 或 `MsgCall` 对象下，可以通过 `call.conn` 获取当前客户端连接。
3. 自行实现的其它方式。

然后发送：
```ts
conn.sendMsg('Msg名称', {
  // 消息体（即 MsgXXX 的类型定义）
})
```

#### 向多个客户端广播

你也可以同时向多个客户端发送同样的消息：
```ts
server.broadcastMsg('消息名', {
    // 消息体
}, [conn1, conn2, conn3, ...])
```

第 3 个参数即为要发送给的目标 Connection 的数组，它是可选的，如果不传递则默认是向当前服务端下所有活跃的 Connection 广播。

相比按 Connection 去逐个发送，`broadcastMsg()` 的好处在于，只执行一次序列化过程，可以减少 CPU 开销。

## 监听消息

在 Server 级别可以调用 `listenMsg` 和 `unlistenMsg` 来接收和处理消息。
由于 Server 同时存在多个客户端连接，所以监听到的是一个 `MsgCall` 对象。

- `call.msg` 即为 `MsgXXX`
- `call.conn` 即为发送消息的客户端连接
- `call.service` 可以获取该 `MsgService` 的配置信息

```ts
let handler = server.listenMsg('Chat', (call: MsgChat)=>{
    // call.msg 即为 MsgChat
    console.log(call.msg);
});

server.unlistenMsg('Chat', handler);
```

:::tip
`listenMsg` 方法会返回你传入的第 2 个参数。
:::

## 例子

所以对于服务端而言，发送消息前首先得知道要发给谁，因此就需要将目标 Connection 给找出来。一般来说有两种方式：

1. 从 `server.connections` 中筛选
2. 自行存储维护目标 Connection

举两个例子来说明。

### 发送私信

如果你使用 `npx create-tsrpc-app@latest` 创建一个 WebSocket 项目，其中已经自带了一个简易聊天室。它的实现很简单，收到用户发送的消息，然后广播给所有人。

如果我们需要增加一个私信功能该怎么办呢？例如 A 指定将消息发送给 B，只有 B 能收到这条消息。思路可以是这样：

1. 在进入聊天室前增加登录流程，用户登录后会给当前连接标记一个 `userId`。
2. 发送私信时，从 `server.connections` 中查找 `userId` 为目标值的连接，然后发送

要实现这些，首先你需要给 Connection 扩展增加一个 `userId` 字段。
通常来说，给基类 `BaseConnection` 扩展就可以。有[两种方式](../flow/flow#%E7%B1%BB%E5%9E%8B%E6%89%A9%E5%B1%95)，我们先选择简单的一种：

```ts
declare module 'tsrpc' {
    export interface BaseConnection {
        // 自定义的新字段
        userId: string;
    }
}
```

然后在你的登录接口中，登录成功后将当前 Connection 的 `userId` 记录下来：
```ts
export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>){
    if(登录成功){
        // 记录 userId 到连接信息中
        call.conn.userId = '登录成功的 User ID';

        call.succ({
            // ...
        })
    }
}
```

则需要发送私信时，即可：
```ts
let conn = server.connections.find(v=>v.userId==='目标 User ID');
if(conn){
    conn.sendMsg('消息名', {
        // ...
    })
}
```

### 开房间

还是上面聊天室的例子，假设现在有了 “开房间” 的需求，即用户可以进入 “房间”，房间内的聊天消息只有在房间内的用户才能收到。

你可以将房间封装为一个 `Room` 对象：
```ts
export class Room {
    static maxRoomId: number = 0;
    static rooms: { [roomId: number]: Room } = {};

    roomId: number;
    conns: BaseConnection[] = [];

    constructor(){
        // 给每个新房间生成一个唯一的 ID
        this.roomId = ++Room.maxRoomId;
        Room.rooms[this.roomId] = this;
    }

    join(conn: BaseConnection){
        this.conns.push(conn);
    }

    sendRoomMsg(msg: MsgChat){
        server.broadcastMsg('Chat', msg, this.conns);
    }
}
```

当用户创建房间时，就 `new Room()` 创建一个 `Room` 对象，这会生成一个唯一的 `roomId`。
你可以使用上面例子的方法，给 BaseConnection 扩展一个 `roomId` 字段，以此来标记当前连接属于哪个房间。

当用户在房间内发送消息时，即可根据 `roomId` 找到对应的 `Room` 对象，然后调用 `room.sendRoomMsg` 来发送房间内消息。

```ts
server.listen('Chat', (call: MsgChat)=>{
    if(call.conn.roomId){
        let room = Room.rooms[call.conn.roomId];
        room.sendRoomMsg(call.msg);
    }
})
```

相比上一种方法，这种方式将 Connection 保存在业务逻辑中，避免了每次都去遍历 `server.connections`。