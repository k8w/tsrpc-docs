---
sidebar_position: 5
---

# 客户端 Mock

很多时候有这样一种情况，我们在开发前端页面时，有些功能需要调用后端接口才能测试完整流程。
虽然协议已经定义好，但接口尚未开发完成，不能使用。
此时，前端要怎么完成不依赖后端的独立测试呢？

当然，你可以临时把调用 API 接口的位置注释，换成一段假数据。但这种做法是侵入式的，不知不觉在你的业务逻辑中掺杂了很多测试代码。这给自己埋下了很多潜在的坑，如果忘记删除测试代码，则可能带来问题。

> 墨菲定律：可能出错的一定会出错。

所以，前端发展出一项叫 Mock 的技术，它能让你模拟后端的返回数据，但是是实现在业务逻辑之外，换句话说是**无侵入**的，你可以通过单一的开关去启用或禁用它。

## 实现方式

在 TSRPC 实现 Mock 特性，需要依赖 `client.flows.preCallApiFlow`。
这个 Flow 发生在实际调用 API 之前，它有一个名为 `return` 的参数，类型为 `callApi` 的返回即 `ApiReturn<Res>`。如果你在 `Flow` 函数内，给 `return` 字段赋值，即相当于提前返回了结果，则客户端实际不会去调用后端接口，而是直接使用该返回值，并且后续流程同真实调用了 API 完全一致。例如：

### 提前返回成功的响应
```ts
client.flows.preCallApiFlow.push(v => {
    v.return = {
        isSucc: true,
        res: {
            // ...
        }
    }
    return v;
})
```

### 10% 的概率模拟网络错误
```ts
client.flows.preCallApiFlow.push(v => {
    if(Math.random() < 0.1){
        v.return = {
            isSucc: false,
            err: new TsrpcError('模拟网络错误: ' + v.apiName, {
                type: TsrpcError.Type.NetworkError
            })
        }
    }
    return v;
})
```

## Mock API

对于 Mock 场景而言，我们可以定义一个对象，在前端实现一份测试的 API。
然后利用上面的方式，在 `callApi` 之前，如果发现有对应的 Mock API，则直接调用；否则才去真实请求后端接口。

模拟后端，Mock API 请求：
```ts title="mockApis.ts"
import { ApiReturn } from "tsrpc-browser";
import { ServiceType } from "../shared/protocols/serviceProto";

// 临时存储数据
const data: {
    content: string,
    time: Date
}[] = [];

export const mockApis: { [K in keyof ServiceType['api']]?: (req: ServiceType['api'][K]['req']) => ApiReturn<ServiceType['api'][K]['res']> } = {
    AddData: req => {
        let time = new Date();
        data.unshift({ content: req.content, time: time })
        return {
            isSucc: true,
            res: { time: time }
        }
    },

    GetData: req => {
        return {
            isSucc: true,
            res: {
                data: data
            }
        }
    }
};
```

客户端请求前判断有无 Mock API，若有则直接使用：
```ts
// Client Mock
client.flows.preCallApiFlow.push(v => {
    // 有对应的 MockAPI 则 Mock，否则请求真实后端
    let mockApi = mockApis[v.apiName];
    if (mockApi) {
        client.logger?.log('[MockReq]', v.apiName, v.req);
        v.return = mockApi!(v.req as any);
        client.logger?.log('[MockRes]', v.apiName, v.return);
    }

    return v;
})
```

当测试完成后，只需将 Mock 部分的 `Flow` 注释，或修改 `mockApis` 即可控制 Mock 开关。
如此可以确保测试代码是在业务逻辑之外的，并且聚集在一处，便于统一管理。

## 完整例子

参见：https://github.com/k8w/tsrpc-examples/tree/main/examples/client-mock