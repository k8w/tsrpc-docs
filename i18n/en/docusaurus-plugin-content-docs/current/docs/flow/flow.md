---
sidebar_position: 1
---

## Flow

## What is Flow?

Any framework that can be adapted to more business scenarios requires good extensibility.
`Flow` is a new concept designed by TSRPC for this purpose.

Similar to pipelines and middleware, `Flow` consists of a set of functions with the same type of input and output, either synchronous or asynchronous.
We call each of these functions a `FlowNode`.
A slight difference from a pipeline is that `FlowNode` can return `null | undefined` to represent a **broken flow**.

! [](assets/flow.svg)

Each `Flow` sum has a fixed data type `<T>`, the input and output types of its node functions, defined as follows.

```ts title="FlowNode Definition"
export type FlowNodeReturn<T> = T | null | undefined
export type FlowNode<T> = (
  item: T
) => FlowNodeReturn<T> | Promise<FlowNodeReturn<T>>
```

`Flow` is like an array of `FlowNode` that you can append a new node to with `flow.push(flowNode)`.
When `Flow` is executed, it starts with the first `FlowNode` (with the original input parameters), and then takes the output of the previous `FlowNode` as input to the next `FlowNode`, one by one, until it gets the last output or receives `null | undefined` and breaks early.

Next, let's look at how `Flow` is used in TSRPC.

## TSRPC Workflow

TSRPC establishes a unified workflow for the entire communication process.
On top of that, some nodes in the workflow are exposed for customization via `Flow`. `Flow` is common to both the server and the client, and you can use the same programming paradigm to extend the behavior on each side.
For example, on the server side, you can control any of the Flow's in the diagram below to implement custom processes such as transport encryption, authentication, and so on.

! [](assets/server-flows.png)

To control the workflow, just `push` your own `FlowNode` functions to these `Flow`s, e.g. one that implements simple login authentication.

```ts
server.flows.preApiCallFlow.push((call) => {
  if (isLogined(call.req.token)) {
    // Assuming you have an isLogined method to check if the login token is legitimate
    return call // returns normally, which means the process continues
  } else {
    call.error('You are not logged in')
    return null // returns null or undefined, which means the process is broken
  }
})
```

### Pre Flow and Post Flow

TSRPC's built-in `Flow`s are divided into two categories, `Pre Flow` and `Post Flow`, based on their name prefixes. When their `FlowNode` returns `null | undefined` in the middle, both will break the execution of the `Flow` successor node. However, the effect on TSRPC workflows is different.

- All interruptions of `Pre Flow` **will** interrupt subsequent TSRPC workflows, e.g. an interruption of Client `preCallApiFlow` will prevent `callApi`.
- All interrupts of `Post Flow` **will not** interrupt subsequent TSRPC workflows, e.g. a Server `postConnectFlow` interrupt **will not** prevent connection establishment and subsequent message reception.

### Server-side Flows

Obtained via `server.flows`, e.g.
``ts
server.flows.preApiCallFlow.push(call=>{
// ...
})

````

| name | role |
| - | - |
| postConnectFlow | after a client connects
| postDisconnectFlow | after the client disconnects |
| preRecvBufferFlow | before processing the received binary data |
| preSendBufferFlow | before sending binary data |
| preApiCallFlow | before executing the API interface implementation
| preApiReturnFlow | before the API interface returns results (`call.succ`, `call.error`) |
| postApiReturnFlow | after the API interface returns results (`call.succ`, `call.error`) |
| postApiCallFlow | after executing the API interface implementation |
| preMsgCallFlow | before triggering the Message listener event |
| postMsgCallFlow | after triggering the Message listener event |
| preSendMsgFlow |before sending a Message
| postSendMsgFlow | after sending a Message

### Client Flows

Get through `client.flows`, e.g.
```ts
client.flows.preCallApiFlow.push(v=>{
    // ...
})
````

| name               | role                                                   |
| ------------------ | ------------------------------------------------------ | ----- | ----------------- | ------------------------------------------------------ |
| preCallApiFlow     | before executing `callApi`                             |
| preApiReturnFlow   | before returning the result of `callApi` to the caller | - - - | postApiReturnFlow | before returning the result of `callApi` to the caller |
| postApiReturnFlow  | after returning the results of `callApi` to the caller |
| preSendMsgFlow     | before executing `sendMsg`                             |
| postSendMsgFlow    | after executing `sendMsg`                              |
| preSendBufferFlow  | before sending any binary data to the server           |
| preRecvBufferFlow  | before processing any binary data from the server      |
| preConnectFlow     | before connecting to the server (WebSocket only)       |
| postConnectFlow    | after connecting to the server (WebSocket only)        |
| postDisconnectFlow | after disconnecting from the server (WebSocket only)   |

## Type extensions

As you can see above, many `Flow`s are accompanied by a pass of `Connection` or `Call`.
In the process, we may want to add some additional data to them.
For example.

- Add a `call.currentUser` to `call` to pass back the user information parsed from the login state
- Add a `conn.connectedTime` to `conn` to record the connection establishment time

TSRPC itself does not contain these fields, and using them directly will result in errors, so you need to extend the existing types of TSRPC first.
TSRPC supports type extensions in the following way.

### Extending the `tsrpc` library types directly

Extend existing types directly in the ``declare module 'tsrpc'`.

```ts
declare module 'tsrpc' {
  export interface BaseConnection {
    // New custom field
    connectedTime: number
  }

  export interface ApiCall {
    currentUser: {
      userId: string
      nickname: string
    }
  }
}
```

After that, the above custom fields are already legal when you use these types.
They are type correct wherever they are used, e.g.

- **in Flow**

```ts
server.flows.postConnectFlow.push((conn) => {
  conn.connectedTime = Date.now()
})

server.flows.preApiCallFlow.push((call) => {
  call.currentUser = {
    userId: 'xxx',
    nickname: 'xxx',
  }
})
```

- **in the API implementation**

```ts
export async function ApiXXX(call: ApiCall<ReqXXX, ResXXX>) {
  // call.currentUser becomes a legal field
  call.logger.log(call.currentUser.nickname)
}
```

But if you want to start two different `Server`s in one application, each of them extending different fields, e.g.

- `server1` adds only `call.currentUser`
- `server2` only adds `call.loggedUser`

Then extending the `tsrpc` library types directly may lead to mixups, so you need to extend them by creating new types.

### Creating a new type

Create new types of `Connection` and `Call`, compatible with existing type definitions: ```tsrpc`

```ts
type MyConnection = WebSocketConnection & {
  connectedTime: number
}

type MyCall<Req = any, Res = any> = ApiCall<Req, Res> & {
  currentUser: {
    userId: string
    nickname: string
  }
}
```

Then, where you need to use it, manually replace it with your own type: the

- In the API implementation

```ts
export async function ApiXXX(call: MyCall<ReqXXX, ResXXX>) {
  // call.currentUser becomes a legal field
  call.logger.log(call.currentUser.nickname)
}
```

- In Flow

```ts
server.flows.preApiCallFlow.push((conn: MyConnection) => {
  conn.connectedTime = Date.now()
})

server.flows.preApiCallFlow.push((call: MyCall) => {
  call.currentUser = {
    userId: 'xxx',
    nickname: 'xxx',
  }
})
```

## Examples

With the flexible `Flow`, developers can implement many features, and we have compiled some common scenarios.

- [Implementing Session and Cookie Features](. /session-and-cookie.md)
- [User login and permission authentication](. /user-authentication.md)
- Binary-based transfer encryption](. /transfer-encryption.md)
- [Front-end Local Mock Testing](. /mock.md)
- Custom HTTP responses for GET interfaces, static pages, etc.](. /custom-http-response.md)

<! -- - Trigger events: e.g. listen for events when an API request is received to count access QPS.

- Convert data: e.g. encrypt binary data before sending it and decrypt it before receiving it.
- Pause to continue: e.g. if the front-end requests an interface that requires a login, it automatically pulls up the login pop-up box and continues sending the request after a successful login.
- Interrupt the process: e.g. intercept API requests in advance after detecting insufficient operational privileges. -->
