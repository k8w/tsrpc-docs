---
id: http-request.html
---

# HTTP 请求规范

在无法使用 TSRPC 客户端的环境下，你也可以手动发送 HTTP 请求，规则如下：
- 统一使用 `POST` 方法
- URL 为 `协议路径` + `接口名`
- 需要 Header `Content-type: application/json`，请求 body 为 JSON 字符串

例如 `user/Login` 接口，服务器为 `127.0.0.1:3000`，则请求 URL 为 `http://127.0.0.1:3000/user/Login`，完整请求如下：

```http
POST /user/Login HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: application/json

{ "username": "admin", "password": "admin" }
```

:::info 重要
如果你的协议中使用了 `ArrayBuffer` `Uint8Array` 等二进制类型，你需要在发送请求前把它们转为 `base64` 字符串。
:::