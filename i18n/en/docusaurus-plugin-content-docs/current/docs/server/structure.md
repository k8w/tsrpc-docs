---
sidebar_position: 1
---

## Server-side architecture

## Protocol-independent three-layer architecture

TSRPC was designed from the start to be **binary** and **transport protocol independent**, which means you can easily extend it to other transport protocols such as native TCP, UDP, etc.
To achieve this, TSRPC Server is designed as a three-layer architecture: !

! [](assets/structure.svg)

- **Server**: the provider of the `Service
  - The base class is `BaseServer`, which derives `HttpServer`, `WsServer`, etc. according to the actual transport protocol.
- **Connection**: transport layer connection between client and server, binary transport channel
  - The base class is `BaseConnection`, which derives `HttpConnection`, `WsConection`, etc. according to the actual transport protocol.
  - Under a long connection, you can call `sendMsg()` under this object to send a message directly to the client.
- **Call**: A single service call initiated by the client, containing all the information sent by the client
  - The base class `ApiCall` represents a call to `ApiService`, through which the request is fetched and the response is returned. Derived from `ApiCallHttp`, `ApiCallWs`, etc. according to the actual transport protocol.
  - The base class `MsgCall` represents a call to `MsgService`, through which the Message content is retrieved. Derived from the actual transport protocol are `MsgCallHttp`, `MsgCallWs`, etc.

Knowing their base classes helps you to implement [type extensions](... /flow/flow#type extensions), and all the types you extend to the base class will take effect for the subclasses as well.

Usually, we want to implement API interfaces and other features that are cross-protocol, i.e., run on both the HTTP protocol and the WebSocket protocol.
So instead of `ApiCallHttp` or `ApiCallWs`, the reference in the API implementation is to their protocol-independent base class `ApiCall`.
If you have an interface that only works on the WebSocket platform, then you can instead reference `ApiCallWs` so that you can get some control that is exclusive to WebSocket. Same for `MsgCall`, `Connection`.

:::tip
A `Connection` can have one or more `Call`s, depending on its transport protocol. For example, HTTP short connections can only carry a single `Call`, while WebSocket long connections can send and receive multiple `Calls` at the same time.
:::

## Service

TSRPC can provide services called `Service`, which are of two types.

- `ApiService`: i.e. API interface service, based on request/response model, can only be requested by the client and responded to by the server.
- `MsgService`: Message service, based on publish/subscribe model, can send messages in both directions between the client and the server.

:::note
The bidirectional sending of `MsgService` is limited to long connections (e.g. WebSocket).
:::

:::tip
The difference is that `ApiService` is guaranteed reachable and will return an explicit response or error whether or not the server has received and processed the message correctly.
In the case of `MsgService`, a single Message is sent in one direction and does not need to be returned, so there is no guarantee that the other side has received and processed it correctly (similar to UDP).
:::

## Summary

To summarize, TSRPC Server is mainly responsible for the implementation and external provisioning of the service, through a three-layer architecture to achieve a protocol-independent design.
The specific code-level usage will be described in the subsequent articles of this section.
