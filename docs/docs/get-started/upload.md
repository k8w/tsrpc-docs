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
    {label: '服务端', value: 'server'},
    {label: '浏览器', value: 'client'}
  ]}>
  <TabItem value="protocols">

```ts
export interface ReqUploadFile {
  name: string,
  data: ArrayBuffer
}

export interface ResUploadFile {
  uri: string;
}
```

  </TabItem>

  <TabItem value="server">

```ts
import { ApiCall } from "tsrpc";

export async function ApiUploadFile(call: ApiCall<ReqUploadFile, ResUploadFile>) {
  call.succ({
    reply: 'Upload, ' + call.req.name
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