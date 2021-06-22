---
sidebar_position: 1
---

# [WIP] 服务端架构

<!-- :::danger WIP
此文档还在编写中…… 敬请期待。
::: -->

<!-- TSRPC 从一开始就设计为 **传输协议无关** 的 -->

- 服务端架构图
- Service
    - Server 对外提供的功能被描述为 Service，分为两类
    - API，基于请求/响应模型
    - Message，基于发布/订阅模型
- Connection
    - TSRPC 一开始就设计为传输协议无关
    - 所以 Connection 是抽象的概念，它可以是短连接，也可以是长连接
    - 基类是 BaseConnection，扩展此类型即可以扩展到所有 Connection
    - 目前已经支持 HTTPConnection 和 WsConnection
    - 未来考虑支持原生 TCP、QUIC、UDP 等
- Call
    - Client 对 Service 的一次调用被称为 Call，对应两种 Service，Call 也分为两种
    - 类图 BaseCall -> Api/Msg -> HTTP/Ws
    - 扩展基类可以扩展所有 Call
    - ApiCall，指客户端发来的请求，同样利用此对象对客户端发送返回
    - MsgCall，指客户端发来的 Message 消息，这个行为是单向的，无需发送响应
- 它们的关系
    - Service 是提供方，Connection 是使用方，Call 是具体的调用行为
    - 