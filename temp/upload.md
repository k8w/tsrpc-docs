---
sidebar_position: 4
description: 文件上传对于 TSRPC 来说简直太容易了！因为 TSRPC 的协议本身支持 ArrayBuffer、Uint8Array 等二进制类型，所以你可以在浏览器中使用 File API 读取文件二进制内容，然后按正常 callApi 的方式发送即可。
keywords:
  - TSRPC
  - TSRPC 上传
  - TSRPC 文件上传
  - TSRPC 上传文件
  - NodeJS 上传
  - TypeScript NodeJS
  - TypeScript RPC
  - express 上传
  - koa 上传
  - nestjs 上传
  - grpc 上传
  - 上传
  - 文件上传
  - 上传文件
hidden: true
---

# 文件上传

文件上传对于 TSRPC 来说简直太容易了！

因为 TSRPC 的协议本身支持 `ArrayBuffer`、`Uint8Array` 等二进制类型，所以你可以在浏览器中使用 [File API](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer) 读取文件二进制内容，然后按正常 `callApi` 的方式发送即可。

完整的例子：https://github.com/k8w/tsrpc-examples/tree/main/examples/file-upload

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="protocols"
  values={[
    {label: '协议定义', value: 'protocols'},
    {label: '服务端实现', value: 'server'},
    {label: '浏览器调用', value: 'client'}
  ]}>
  <TabItem value="protocols">

```ts
export interface ReqUpload {
    fileName: string,
    fileData: Uint8Array
}

export interface ResUpload {
    url: string;
}
```

  </TabItem>

  <TabItem value="server">

```ts
import { ApiCall } from "tsrpc";
import fs from 'fs/promises';

export async function ApiUpload(call: ApiCall<ReqUpload, ResUpload>) {
  // 写入文件，又或者推送远端文件服务器什么的
  await fs.writeFile('uploads/' + call.req.fileName, call.req.fileData);

  call.succ({
      url: 'http://127.0.0.1:3000/uploads/' + call.req.fileName
  });
}
```

  </TabItem>

  <TabItem value="client">

```ts
async function upload(fileData: Uint8Array, fileName: string) {
    // 像普通接口一样调用
    let ret = await client.callApi('Upload', {
        fileData: fileData,
        fileName: fileName
    });

    // 错误处理
    if (!ret.isSucc) {
        alert(ret.err.message);
        return;
    }

    // 成功
    return {
      url: ret.res.url
    };
}
```

  </TabItem>
</Tabs>