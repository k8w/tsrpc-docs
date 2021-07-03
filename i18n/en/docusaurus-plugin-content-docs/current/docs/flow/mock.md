---
sidebar_position: 5
---

## Client Mock

## What is Mock

Many times there is a situation where we are developing a front-end page and some functions need to call the back-end interface in order to test the complete process.
Although the protocol has been defined, but the interface has not yet been developed and can not be used.
At this point, how to complete the front-end does not depend on the back-end independent testing it?

Of course, you can temporarily comment out the location of the API interface call and replace it with a piece of dummy data. But this approach is invasive and unknowingly mixes a lot of test code in your business logic. This lays a lot of potential potholes for yourself, and may bring problems if you forget to remove the test code.

> Murphy's Law: What can go wrong must go wrong.

So, the front-end developed a technology called Mock, which allows you to mock the returned data from the back-end, but is implemented outside of the business logic, in other words **non-intrusive**, and you can enable or disable it with a single switch.

## Implementation

Implementing the Mock feature in TSRPC requires a dependency on `client.flows.preCallApiFlow`.
This Flow occurs before the actual API call and has a parameter named `return` for the return type of `callApi` which is `ApiReturn<Res>`. If you assign a value to the `return` field within the `Flow` function, which is equivalent to returning the result in advance, the client will actually **not** call the back-end interface, but will return that value directly, in exactly the same flow as a real network request. Example.

#### returns a successful response ahead of time

```ts
client.flows.preCallApiFlow.push((v) => {
  v.return = {
    isSucc: true,
    res: {
      // ...
    },
  }
  return v
})
```

#### 10% probability of simulating network errors

```ts
client.flows.preCallApiFlow.push((v) => {
  if (Math.random() < 0.1) {
    v.return = {
      isSucc: false,
      err: new TsrpcError('Simulated network error: ' + v.apiName, {
        type: TsrpcError.Type.NetworkError,
      }),
    }
  }
  return v
})
```

## Mock API

For the Mock scenario, we can define an object that implements a test API on the front-end.
Then, using the above, before `callApi`, if a corresponding Mock API is found, it is called directly; otherwise it goes to the real request backend interface.

Mock back-end, Mock API request.

```ts
// Mock backend, Mock API request

import { ApiReturn } from 'tsrpc-browser'
import { ServiceType } from '. /shared/protocols/serviceProto'

// Temporary data storage
const data: {
  content: string
  time: Date
}[] = []

// { interface name: (req: request) => response }
export const mockApis: {
  [K in keyof ServiceType['api']]?: (
    req: ServiceType['api'][K]['req']
  ) =>
    | ApiReturn<ServiceType['api'][K]['res']>
    | Promise<ApiReturn<ServiceType['api'][K]['res']>>
} = {
  // simulate the backend interface
  AddData: (req) => {
    let time = new Date()
    data.unshift({ content: req.content, time: time })
    return {
      isSucc: true,
      res: { time: time },
    }
  },

  // Asynchronous is also possible
  GetData: async (req) => {
    // Simulate a 500ms delay
    await new Promise((rs) => {
      setTimeout(rs, 500)
    })

    return {
      isSucc: true,
      res: {
        data: data,
      },
    }
  },
}
```

:::note
The type definition of `mockApis` in the above example is a bit more complicated, using TypeScript's [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html). If you are not very familiar with TypeScript, you can just copy it and use it.
:::

Mock API before the client request, if there is, then directly use.

```ts
// Client Mock
client.flows.preCallApiFlow.push(async (v) => {
  // Mock if there is a corresponding MockAPI, otherwise request the real backend
  let mockApi = mockApis[v.apiName]
  if (mockApi) {
    client.logger?.log('[MockReq]', v.apiName, v.req)
    v.return = await mockApi!(v.req as any)
    client.logger?.log('[MockRes]', v.apiName, v.return)
  }

  return v
})
```

When the tests are done, simply comment out the `Flow` in the Mock section or modify `mockApis` to control the Mock switch.
This ensures that the test code is outside of the business logic and gathered in one place for uniform management.

## Full example

See: https://github.com/k8w/tsrpc-examples/tree/main/examples/client-mock
