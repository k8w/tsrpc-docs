---
sidebar_position: 4
---

# Server server

:::danger WIP
This document is still in progress ...... Stay tuned.
:::

## Three-tier architecture

- Server
- Connection
- Call

## Start-up process

- Prepare everything, then `server.start()`

## Return an error

- Business Error
- Server Internal Error

### Additional error messages

`call.error` also supports passing a second parameter to return additional error information (e.g. error codes, etc.), e.g.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="server"
values={[
{label: 'Server-side implementation', value: 'server'},
{label: 'client call', value: 'client'},
]}>

  <TabItem value="server">

```ts
export async function ApiXXXX(call: ApiCall<ReqXXXX, ResXXXX>) {
  call.error(
    'This is a special error that needs to be identified exactly by the error code.',
    {
      code: 'XXX_ERR',
      someThingElse: 'xxxxxxx',
    }
  )
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
