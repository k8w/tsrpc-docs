---
sidebar_position: 3
---

# 登录和权限自动验证

## 思路

登录和权限验证，即上一节中 [Session](session-and-cookie.md) 的实际应用，指用户必须登录后或具有指定角色才能调用某些接口。

实现思路主要有以下几步：
1. 在登录后将用户的登录和角色权限信息写入 Session。
2. 协议配置：哪些协议需要登录验证，哪些协议需要什么角色或权限。
3. 在调用 API 前根据上述配置和 Session 自动验证，拦截非法调用，返回相应错误信息。

## 写入 Session

## 协议配置

诚如之前提到的，API 协议定义在 `Ptl{接口名}.ts` 中，规则是存在 `Req{接口名}` 和 `Res{接口名}` 两个类型定义。

在该文件中，其实还包含一个可定义项目：**协议配置**。

只需要在协议文件中加入：
```ts
export const conf = {
    // 协议的自定义配置，随便填
    xxx: 'xxx'
}
```

则 `npm run proto` 时会自动将 `conf` 里的内容加入生成的 ServiceProto 中，可以在服务端和客户端获得这些配置。

例如我们将接口是否需要登录验证，以及需要何种权限的信息放入协议配置：

```ts
export interface ReqXXXX {
    // ...
}

export interface ResXXXX {
    // ...
}

export const conf = {
    needLogin: true,    // 是否需要登录
    needRoles: ['管理员', '商务']   // 可访问的用户角色
}
```

## 自动验证

有了验证规则，以及验证所需的 Session 数据，使用 Flow 就可以实现接口的登录和权限的自动验证了。
你可以根据实际需要决定是仅在服务端验证，还是在服务端和客户端进行双重验证。

以下是服务端验证的例子：

```ts
server.flows.preApiCallFlow.push(v => {
    let conf = v.service.conf;
    // Do something with conf...

    return v;
})
```

```ts
client.flows.preCallApiFlow.push(v => {
    // Get conf
    let conf = client.serviceMap.apiName2Service[v.apiName]!.conf;
    // Do something with conf...

    return v;
})
```


:::danger WIP
此文档还在编写中…… 敬请期待。
:::