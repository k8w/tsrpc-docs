---
sidebar_position: 3
slug: /docs/flow/access.html
---

# 登录态和鉴权

## 思路

登录和权限验证，即上一节中 [Session](session-and-cookie.html) 的实际应用，指用户必须登录后或具有指定角色才能调用某些接口。

实现思路主要有以下几步：
1. 登录接口：登录成功后创建登录态（Token），后续接口的身份凭证。
2. 客户端收到服务端发来的登录态后，后续每次请求自动带到请求参数中（同 [Cookie](session-and-cookie.html) 机制）。
3. 协议配置：哪些协议需要登录验证，哪些协议需要什么角色或权限。
4. 在调用 API 前根据上述配置和传入的登录态自动验证，拦截非法调用，返回相应错误信息。

## 创建登录态

跟 Session 机制一样，登录态应当是由服务端维护，客户端只读的信息。

用户登录成功后，创建一个临时 Token，根据需要可以存储在例如 Redis 或数据库中。
根据该 Token，即可解析出已登录的用户ID，查询到用户信息。
Token 有过期时间，有效期内的任何操作将自动续期。

## 协议配置

如之前提到的，API 协议定义在 `Ptl{接口名}.ts` 中，规则是存在 `Req{接口名}` 和 `Res{接口名}` 两个类型定义。

在协议定义文件中，还包含一个额外的可定义项目：**协议配置**。

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

**服务端：**

```ts
server.flows.preApiCallFlow.push(call => {
    // 解析登录态
    call.currentUser = await UserUtil.parseSSO(req.__ssoToken);
    // 获取协议配置
    let conf = v.service.conf;
    // 若协议配置为需要登录，则阻止未登录的请求
    if (conf?.needLogin && !call.currentUser) {
        call.error('您还未登录', { code: 'NEED_LOGIN' });
        return undefined;
    }

    return v;
})
```

**客户端：**
```ts
client.flows.preCallApiFlow.push(v => {
    // 获取协议配置
    let conf = client.serviceMap.apiName2Service[v.apiName]!.conf;
    // 若协议配置为需要登录，则阻止未登录的请求
    if (conf?.needLogin && !isLogined()) {
        window.location = '跳转到登录页面';
        return undefined;
    }

    return v;
})
```

## 完整例子
https://github.com/k8w/tsrpc-examples/tree/main/examples/user-authentication