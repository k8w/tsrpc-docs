---
sidebar_position: 3
---

## Login and permission auto-validation

## Ideas

Login and permission validation, the practical application of [Session](session-and-cookie.md) in the previous section, means that a user must be logged in or have a specified role to invoke certain interfaces.

The implementation idea has the following main steps.

1. login interface: login state (Token) is created after successful login, the identity credentials of the subsequent interface.
2. the client receives the login state from the server, and each subsequent request is automatically brought to the request parameters (the same as the [cookie](session-and-cookie.md) mechanism).
3. protocol configuration: which protocols require login authentication, which protocols require what roles or permissions. 4.
4. automatically verify the login state before calling the API based on the above configuration and the incoming login state, intercept illegal calls, and return the corresponding error message.

## Create login state

As with the Session mechanism, the login state should be maintained by the server and read-only by the client.

When the user logs in successfully, a temporary Token is created, which can be stored in, for example, Redis or a database, as needed.
Based on this Token, the logged-in user ID can be resolved and the user information can be queried.
The Token has an expiration time and will be automatically renewed for any operation within the expiration date.

## Protocol Configuration

As mentioned before, the API protocol is defined in `Ptl{interface name}.ts` and the rule is that there are two types of definitions, `Req{interface name}` and `Res{interface name}`.

In the protocol definition file, there is an additional definable item: **Protocol Configuration**.

Simply add to the protocol file.

```ts
export const conf = {
  // custom configuration of the protocol, fill in whatever you want
  xxx: 'xxx',
}
```

Then `npm run proto` will automatically add the contents of `conf` to the generated ServiceProto, so you can get these configurations on the server and client side.

For example, if we put information about whether the interface requires login authentication and what permissions are required into the protocol configuration.

```ts
export interface ReqXXXX {
  // ...
}

export interface ResXXXX {
  // ...
}

export const conf = {
  needLogin: true, // whether login is required
  needRoles: ['admin', 'business'], // user roles that can be accessed
}
```

## Automatic authentication

With the validation rules and the Session data needed for validation, you can use Flow to automate the login and permission validation of the interface.
You can decide whether you want to authenticate only on the server side, or do dual authentication on the server and client side, depending on your needs.

**Serverside:**

```ts
server.flows.preApiCallFlow.push((v) => {
  // parse the login state
  call.currentUser = await UserUtil.parseSSO(req.__ssoToken)
  // Get the protocol configuration
  let conf = v.service.conf
  // If the protocol is configured to require login, block requests that are not logged in
  if (conf?.needLogin && !call.currentUser) {
    call.error('You are not logged in', { code: 'NEED_LOGIN' })
    return undefined
  }

  return v
})
```

**Client:**

```ts
client.flows.preCallApiFlow.push((v) => {
  // Get the protocol configuration
  let conf = client.serviceMap.apiName2Service[v.apiName]!.conf
  // If the protocol configuration requires login, block requests that are not logged in
  if (conf?.needLogin && !isLogined()) {
    window.location = 'Jump to login page'
    return undefined
  }

  return v
})
```

## Full example

https://github.com/k8w/tsrpc-examples/tree/main/examples/user-authentication
