---
id: proto-change.html
---

# 协议变更和蓝绿发布

在开发新版本接口时，经常会出现协议的变更，这会重新生成 ServiceProto 然后同步到客户端项目。
这里牵扯出重要的一个问题：新生成的 ServiceProto 与旧的能保持兼容吗？
如果贸然更新服务端，是否会引发旧版协议客户端的异常？

通常有几种情况。

## 类型兼容的情况

新协议的在类型层面兼容旧协议，这种情况下新旧协议**是兼容的**，可以无缝切换，例如：

```ts title="旧协议"
export interface ReqSubmit {
    name: string
}

export interface ResSubmit {
    id: number
}
```

```ts title="新协议"
export interface ReqSubmit {
    name: string,
    age?: number
}

export interface ResSubmit {
    id: number,
    time: Date
}
```

- 新协议的请求虽然多了一个 `age` 字段，但由于是可选的，所以旧版协议的请求也能够兼容
- 新协议的响应虽然多了一个 `time` 字段，对于旧版协议它是一个多余字段，会被[自动剔除](../../get-started/type-system.html#字段剔除)

## 类型不兼容的情况

例如：

```ts title="旧协议"
export interface ReqSubmit {
    name: string
}

export interface ResSubmit {
    id: number
}
```

```ts title="新协议"
export interface ReqSubmit {
    name: string,
    age: number
}

export interface ResSubmit {
    newId: number
}
```

- 新协议的请求多了必需的 `age` 字段，如此旧协议的请求便会收到 “缺少必需字段 `age`” 的报错
- 新协议的响应缺少了旧协议必需的 `id` 字段，如此旧协议的响应便会收到 “缺少必需字段 `id` ”的报错

这种情况下新旧协议**类型不兼容**，如果贸然更新服务端版本，可能导致旧协议的客户端出现报错。

这种情况下，也有一些解决方案，例如：

- 旧接口不变，而是写一个新的接口 `Submit_1`，如此就变成了类型兼容的情况，可以无缝切换
- 蓝绿发布

## 蓝绿发布

无论哪种情况，你都可以使用蓝绿发布来避免因协议变更导致的问题。

1. 先发布服务端，发布到不同的 URL 下
    - 例如旧版 `/api/v1/`，新版 `/api/v2/`
2. 再发布客户端，客户端切换到新版 URL
3. 发布完成后，等待一段时间，再弃用旧版接口
    - 因为可能仍有部分用户停留在旧版应用中没有刷新