---
sidebar_position: 4
---

# Server 服务端

:::danger WIP
此文档还在编写中…… 敬请期待。
:::

## 三层结构
- Server
- Connection
- Call

## 启动流程
- 准备好一切，再 `server.start()`

## 返回错误

- 业务错误
- Server Internal Error

### 额外错误信息

`call.error` 也支持传入第二个参数，来返回额外错误信息（例如错误码等），例如：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="server"
  values={[
    {label: '服务端实现', value: 'server'},
    {label: '客户端调用', value: 'client'},
  ]}>

  <TabItem value="server">

```ts
export async function ApiXXXX(call: ApiCall<ReqXXXX, ResXXXX>) {
    call.error('这是一个特殊的错误，需要通过错误码精确识别。', {
        code: 'XXX_ERR',
        someThingElse: 'xxxxx'
    });
}
```

  </TabItem>

  <TabItem value="client">

```ts
let ret = await client.callApi('XXXX', { ... });
if(ret.err?.code === 'XXX_ERR'){
    // do some thing
    console.log(ret.err.someThingElse);
}
```

  </TabItem>
</Tabs>