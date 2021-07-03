---
sidebar_position: 6
---

# Custom HTTP response

:::tip
The content of this section applies only to `HttpServer`.
:::

With TSRPC, although there is a companion client, there is no need to go into the details of building HTTP requests.
But there are times when you may want the backend to support some specific common requests.
For example, server information pages, static file services, or some simple control class GET interface or something like that.

With `Flow`, you can do that too, or even graft TSRPC onto other frameworks.

## Implementation

In the node function of `server.flows.preRecvBufferFlow`, there is a parameter field `conn`.
It is the `Connection` of the actual transport protocol.
Since the TSRPC implementation is cross-transport, the `conn` you get directly is of type `BaseConnection`.

If you create an `HttpServer`, the corresponding `conn` is actually an `HttpConnection`.
At this point, with `conn.httpReq` and `conn.httpEnd` you can get the `req` and `res` objects of the NodeJS native `http` module, and then you're free to do what you want.

If you want to return your own response, you can do so with `conn.httpRes`.
But remember to break the Flow and subsequent processes by `return undefined` after that.
This way you don't get to the later parts of binary decoding, API parsing, etc.

For example

```ts
// Custom HTTP Reponse
server.flows.preRecvBufferFlow.push((v) => {
  let conn = v.conn as HttpConnection

  if (conn.httpReq.method === 'GET') {
    conn.httpRes.end('Hello World')
    return undefined
  }

  return v
})
```

Then open the backend service directly in the browser at `http://localhost:3000` and you can see our custom response

! [](assets/custom-get-res.png)

Further, you can implement a simple file service: !

```ts
// Custom HTTP Reponse
server.flows.preRecvBufferFlow.push(async (v) => {
  let conn = v.conn as HttpConnection

  if (conn.httpReq.method === 'GET') {
    // Static file service
    if (conn.httpReq.url) {
      // detect if the file exists
      let resFilePath = path.join('res', conn.httpReq.url)
      let isExisted = await fs
        .access(resFilePath)
        .then(() => true)
        .catch(() => false)
      if (isExisted) {
        // return the contents of the file
        let content = await fs.readFile(resFilePath)
        conn.httpRes.end(content)
        return undefined
      }
    }

    // Default GET response
    conn.httpRes.end('Hello World')
    return undefined
  }

  return v
})
```

! [](assets/custom-get-test.png)

## Full example

See: https://github.com/k8w/tsrpc-examples/tree/main/examples/custom-http-res

:::tip
TSRPC's API and Message communications are via the `POST` method, so make sure you don't affect them.
:::
