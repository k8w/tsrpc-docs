---
sidebar_position: 4
---

# File Uploads

File uploads are simply too easy for TSRPC! Because the TSRPC protocol itself supports `ArrayBuffer`, `Uint8Array` and other binary types, you can use `ArrayBuffer`, `Uint8Array` and other binary types in your browser.

Since the TSRPC protocol itself supports binary types such as `ArrayBuffer`, `Uint8Array`, etc., you can use [File API](https://developer.mozilla.org/zh-CN/docs/Web/API/) in your browser FileReader/readAsArrayBuffer) in your browser to read the binary contents of the file and then send it as normal `callApi`.

Full example: https://github.com/k8w/tsrpc-examples/tree/main/examples/file-upload

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="protocols"
values={[
{label: 'protocols definition', value: 'protocols'},
{label: 'server-side implementation', value: 'server'},
{label: 'browser call', value: 'client'},
]}>
<TabItem value="protocols">

``ts
Output interface ReqUpload {
fileName: string,
fileData: Uint8Array
}

Output interface ResUpload {
url: string;
}

````

  </TabItem

  <TabItem value="server">

```ts
Import { ApiCall } from "tsrpc".
import fs from "fs/promises".

export async function ApiUpload(call: ApiCall<ReqUpload, ResUpload>) {
  // Write the file, aka push the remote file server or whatever.
  await fs.writeFile('uploads/' + call.req.fileName, call.req.fileData).

  call.succ({
      url: 'http://127.0.0.1:3000/uploads/' + call.req.fileName
  });
}
````

</TabItem>

  <TabItem value="client">

```ts
async function upload(fileData: Uint8Array, fileName: string) {
  // Upload
  let ret = await client.callApi('Upload', {
    fileData: fileData,
    fileName: fileName,
  })

  // Error
  if (!ret.isSucc) {
    alert(ret.err.message)
    return
  }

  // Succ
  return {
    url: ret.res.url,
  }
}
```

  </TabItem>
</Tabs>
```
