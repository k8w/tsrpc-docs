---
sidebar_position: 4
---

# 文件上传

文件上传对于 TSRPC 来说简直太容易了！

因为 TSRPC 的协议本身支持 `ArrayBuffer`、`Uint8Array` 等二进制类型，所以你可以在浏览器中使用 [File API](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer) 读取文件二进制内容，然后按正常 `callApi` 的方式发送即可。

完整的例子：https://github.com/k8w/tsrpc-examples/file-upload

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
  fileData: ArrayBuffer
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
    url: 'https://xxx.com/uploads/' + call.req.fileName
  });
}
```

  </TabItem>

  <TabItem value="client">

```ts
async function onBtnUpload(){

}
```

  </TabItem>
</Tabs>