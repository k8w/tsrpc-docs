---
sidebar_position: 4
---

# Message Service

## What is Message Service

Message Service is a service based on the publish/subscribe model, where messages can be sent in both directions between the server and the client.
It is more commonly used in scenarios such as real-time interaction over long connections (e.g. WebSocket) and server-side pushing.

:::note
Short connections (e.g. HTTP) can only send messages from the client to the server, but not push messages from the server to the client, so you can use long connections instead if needed.
:::

Unlike API Service, there is no response to the message.
That is, once a message is sent, it is considered complete and does not ensure that the other party has successfully received and processed the message.
You can also think of a message as the smallest transmission unit of TSRPC, and based on Message Service, you can freely implement various communication models.

:::tip
Whether a message arrives in an orderly fashion depends on the actual transport protocol. Currently with HTTP and WebSocket, messages arrive in an orderly fashion because the transport layer is based on the TCP protocol. In the future, if the UDP protocol is supported ...... In the future, say ......
:::

Using `listenMsg` and `unlistenMsg`, messages can be received and processed as if they were listening for events.

Like the API interface, messages are transmitted through runtime type detection and binary serialization.
So the message definition is also stored as part of the protocol in [ServiceProto](service-proto#serviceproto), so we need to define it first.

## Defining messages

Like the API Service, the definition of a message is identified by **name**.
The naming rules are described in [previous article](service-proto#definition rules), namely

- The file name is: `Msg{message name}.ts`, and the following items are defined within this file
- Message type name: `Msg{message name}`
- The additional configuration item is: `export const conf = { ... }`

## Sending messages

Messages can be sent in both directions between the server and the client.

### Client-side sending

Sending from client to server is very simple and requires only.

```ts
client.sendMsg('Msg name', {
  // the message body (i.e. the type definition of MsgXXX)
})
```

### Server-side sending

Multiple client connections will exist on the server side at the same time, so to send a message, you first have to decide to whom to send it.
A client, i.e. a Connection in TSRPC [three-layer architecture](structure#Protocol-independent three-layer architecture).
Sending a message to a Connection can be implemented in two ways.

#### sends to the specified client

First find the Connection you want to send to.

1. all current client connections are available in `server.conns`. 2.
2. Under each `ApiCall` or `MsgCall` object, you can get the current client connection from `call.conn`. 3.
3. other ways to implement by yourself.

Then send.

```ts
conn.sendMsg('Msg name', {
  // message body (i.e. type definition of MsgXXX)
})
```

#### Broadcast to multiple clients

You can also send the same message to multiple clients at the same time: the

```ts
server.broadcastMsg('message name', {
    // message body
}, [conn1, conn2, conn3, ...])
```

The third parameter is the array of target Connections to send to, which is optional and defaults to broadcasting to all active Connections on the current server if not passed.

The advantage of ``broadcastMsg()` is that it only performs the serialization process once, which reduces CPU overhead.

## Listening for messages

At the Server level, you can call `listenMsg` and `unlistenMsg` to receive and process messages.
Since the Server has multiple client connections at the same time, it listens to a `MsgCall` object.

- `call.msg` is `MsgXXX`
- `call.conn` is the client connection that sent the message
- `call.service` can get the configuration information of this `MsgService`

```ts
let handler = server.listenMsg('Chat', (call: MsgChat) => {
  // call.msg is MsgChat
  console.log(call.msg)
})

server.unlistenMsg('Chat', handler)
```

:::tip
The `listenMsg` method will return the 2nd parameter you passed in.
:::

## Example

So for the server, you need to know who you want to send the message to before you send it, so you need to find out the target Connection. There are generally two ways to do this.

1. filter from `server.conns`.
2. store and maintain the target Connection itself

Two examples are given to illustrate this.

### Sending private messages

If you create a WebSocket project using `npx create-tsrpc-app@latest`, it already comes with a simple chat room. It's a simple implementation that receives a message from the user and broadcasts it to everyone.

What if we need to add a private messaging feature? For example, if A specifies to send a message to B, only B can receive the message. The idea could be something like this.

1. add a login process before entering the chat room, where the user logs in and marks the current connection with a `userId`.
2. When sending a private message, look for a connection with `userId` as the target value in `server.conns` and send it

To do this, you first need to add a `userId` field to the Connection extension.
Typically, giving the base class `BaseConnection` an extension will do the trick. There are [two ways](... /flow/flow#%E7%B1%BB%E5%9E%8B%E6%89%A9%E5%B1%95), we'll start with the simple one.

```ts
declare module 'tsrpc' {
  export interface BaseConnection {
    // New custom field
    userId: string
  }
}
```

Then in your login interface, record the `userId` of the current Connection after a successful login.

```ts
export async function ApiLogin(call: ApiCall<ReqLogin, ResLogin>){
    if(login successful){
        // Record userId in connection information
        call.conn.userId = 'User ID of successful login';

        call.succ({
            // ...
        })
    }
}
```

Then, when you need to send a private message, you can.

```ts
let conn = server.conns.find((v) => v.userId === 'target User ID')
if (conn) {
  conn.sendMsg('message name', {
    // ...
  })
}
```

### Opening a room

Still with the chat room example above, suppose now there is a need to "open a room", i.e. a user can enter a "room" and the chat messages in the room can only be received by the user who is in the room.

You can encapsulate the room as a `Room` object as follows.
``ts
export class Room {
static maxRoomId: number = 0;
static rooms: { [roomId: number]: Room } = {};

    roomId: number;
    conns: BaseConnection[] = [];

    constructor(){
        // Generate a unique ID for each new room
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

````

When the user creates a room, `new Room()` creates a `Room` object, which generates a unique `roomId`.
You can use the method in the example above to extend a `roomId` field to BaseConnection to mark which room the current connection belongs to.

When the user sends a message in the room, you can find the corresponding `Room` object based on the `roomId` and call `room.sendRoomMsg` to send the message in the room.

```ts
server.listen('Chat', (call: MsgChat)=>{
    if(call.conn.roomId){
        let room = Room.rooms[call.conn.roomId];
        room.sendRoomMsg(call.msg);
    }
})
````

Compared to the previous method, this approach keeps the Connection in the business logic and avoids having to iterate through `server.conns` each time.
