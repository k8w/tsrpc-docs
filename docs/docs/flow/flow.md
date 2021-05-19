---
sidebar_position: 1
---

# Flow

## Flow 是什么？

任何一种框架，想要适应更多的业务场景，就离不开良好的可扩展性。
`Flow` 就是 TSRPC 为此设计的一种全新概念。

`Flow` 相当于工作流中的一个环节，与管线类似，它由一组输入输出类型都相同的函数组成。
我们把其中的每个函数称为 `FlowNode`，同步或异步皆可。与管线有一点区别的是，`FlowNode` 可以返回 `null` 或 `undefined` 来代表**中断流程**。
每一个 `Flow` 和都有一个固定的数据类型 `<T>`，即它节点函数的输入和输出类型，定义如下：

```ts title="FlowNode 定义"
export type FlowNodeReturn<T> = T | null | undefined;
export type FlowNode<T> = (item: T) => FlowNodeReturn<T> | Promise<FlowNodeReturn<T>>;
```

`Flow` 就像一个 `FlowNode` 的数组，你可以通过 `flow.push(flowNode)` 来追加一个新节点。
`Flow` 在执行时，将从第一个 `FlowNode` 开始执行（参数为原始输入参数），然后将上一个 `FlowNode` 的输出作为下一个 `FlowNode` 的输入，逐个执行；直到得到最后的输出或收到 `null` 或 `undefined` 而提前中断。

> 图 Flow 执行流程

接下来就来看一下 `Flow` 在 TSRPC 中的具体使用方式。

## TSRPC 工作流

TSRPC 为整个通讯过程制定了统一的工作流。
在此基础之上，将工作流中的一些节点，通过 `Flow` 曝露出来供开发者定制。
完整的 TSRPC 工作流如下：

**服务端**
> 图

**客户端**
> 图

由图可见，TSRPC 中所有可供定制的 `Flow` 清单如下：

### Server Flows
| 名称 | 作用 |
| - | - |
| asd | gdg |

### Client Flows
| 名称 | 作用 |
| - | - |
| asd | gdg |

### 特别说明
根据名称可以看出，TSRPC 的内置 `Flow` 分为两类，`Pre Flow` 和 `Post Flow`。当它们的 `FlowNode` 中途返回了 `null` 或 `undefined` 时，都会中断 `Flow` 后续节点的执行。但对于 TSRPC 工作流的影响，有所区别：
- 所有 `Pre Flow` 的中断，**会**中断后续的 TSRPC 工作流。
- 所有 `Post Flow` 的中断，**不会**中断后续的 TSRPC 工作流。

## 类型扩展
- 扩展 Call 和 Connection 类型

## 例子
通过灵活的 `Flow`，开发者可以实现：
- [实现 Session 和 Cookie 特性](xxx.md)
- [用户登录和权限验证](xxx.md)
- [基于二进制的传输加密](xxx.md)
- [前端本地 Mock 测试](xxx.md)
- [结合 Prometheus 进行 QPS 统计](xxx.md)

<!-- - 触发事件：例如监听接收到 API 请求的事件，以便统计访问 QPS。
- 转换数据：例如在发送二进制数据前加密，接收数据前解密。
- 暂停继续：例如前端请求了一个需要登录的接口，则自动拉起登录弹框，登录成功后再继续发送请求。
- 中断流程：例如在检测到操作权限不足后，提前拦截 API 请求。 -->

:::danger WIP
此文档还在编写中…… 敬请期待。
:::