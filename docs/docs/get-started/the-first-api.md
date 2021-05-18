---
sidebar_position: 2
---

# 实现第一个 API

在这一节中，我们将体验使用 TSRPC 快速实现一个 API 服务，并在浏览器中调用它。

本节内容的完整例子在：https://github.com/k8w/tsrpc-examples/my-first-api/

## 初始化项目

如[上一节](create-tsrpc-app.md)中讲到的，我们先初始化一个 Web 全栈项目：
```
npx create-tsrpc-app my-first-api --template web
```

创建好的项目里，已经包含了一个演示的 API 接口 `Test`，你可以先大概看看，然后我们从头开始实现一个全新的 API。

## 定义协议
### 编写协议文件
协议目录默认位于 `backend/src/shared/protocols` 目录下，协议文件的命名规则为 `Ptl${协议名}.ts`。

例如我们想要实现一个名为 `HelloWorld` 的协议，则在该目录下创建文件 `PtlHelloWorld.ts`，然后分别定义请求类型 `ReqHelloWorld` 和 响应类型 `ResHelloWorld`，记得要加上 `export` 标记导出它们。

```ts title="backend/src/shared/protocols/PtlHelloWorld.ts"
// 请求
export interface ReqHelloWorld {
    name: string
}

// 响应
export interface ResHelloWorld {
    reply: string,
    time: Date
}
```

:::note
- `Ptl` 代表 `Protocol` 的缩写。
- `Req` 代表 `Request` 的缩写。
- `Res` 代表 `Response` 的缩写。
:::

### 生成 ServiceProto
[`ServiceProto`](asdg) 是 TSRPC 框架运行时实际使用的协议数据格式，执行以下命令来自动生成：
```shell
cd backend
npm run proto
```

:::tip
每当协议文件修改后，都应该执行此命令重新生成。
:::

## 实现 API
API 实现目录位于 `backend/src/api`，该目录下的文件与协议目录下的协议定义一一对应，只是将文件名前缀 `Ptl` 修改为 `Api`。项目模板里已经提供了便捷的命令行工具来自动生成，只需在协议定义完后执行：
```shell
cd backend
npm run api
```

如此，空白的 API 文件就自动生成了。对于我们刚刚定义的协议 `PtlHelloWorld.ts`，对应生成的实现文件名为 `ApiHelloWorld.ts`，目录结构如下：
```
|- backend/src
    |- shared/protocols         协议目录
        |- PtlHelloWorld.ts     协议 HelloWorld 定义
    |- api                      API 实现目录
        |- ApiHelloWorld.ts     API HelloWorld 实现
    |- index.ts                 后端程序入口
```

API 的实现就是一个异步函数，输入输出是通过传入的 `call` 来实现的。
- 通过 `call.req` 来获取请求参数（即协议中定义的 `ReqHelloWorld`，框架会确保此处类型一定合法）。
- 通过 `call.succ(res)` 来返回响应（即协议中定义的 `ResHelloWorld`）。
- 通过 `call.error('错误信息')` 来返回错误。

例如：

```ts title="backend/src/api/ApiHelloWorld.ts"
import { ApiCall } from "tsrpc";

export async function ApiHelloWorld(call: ApiCall<ReqHelloWorld, ResHelloWorld>) {
    if(call.req.name === 'World'){
        call.succ({
            reply: 'Hello, ' + call.req.name,
            time: new Date()
        });
    }
    else{
        call.error('Invalid name');
    }
}
```

## 调用 API

### 共享代码

要调用 客户端必须要有相同的协议定义文件，除此之外可能还有其它公共逻辑代码可以在前后端复用。
为此，我们设计了 `src/shared` 这个目录。该目录下的内容总是在 `backend` 中编辑，然后同步到 `frontend` 中（只读）。

执行以下命令，来完成同步：

```shell
cd backend
npm run sync
```

### 创建客户端

使用 TSRPC 客户端，即可像调用本地异步函数那样调用远端 API，并享有全过程的代码提示和类型检测。
它支持许多平台，由于我们创建的是浏览器 Web 项目，所以引用的是来自 `tsrpc-browser` 的浏览器版客户端。
例如：

```ts title="frontend/src/index.ts"
import { HttpClient } from 'tsrpc-browser';

// 创建一个 TSRPC Client
let client = new HttpClient(serviceProto, {
    server: 'http://127.0.0.1:3000'
});
```

:::tip
除浏览器外，TSRPC 客户端还支持 NodeJS、小程序、React Native 等平台，见[客户端列表](xxx.md)。
:::

### client.callApi

不同平台的客户端用法几乎都是一致的：使用 `client.callApi()` 来调用远程 API。
TSRPC 对于前端接入的体验是极致的。整个过程都有代码提示，完全不需要协议文档，也不必担心拼写错误带来的低级错误。

> 图：代码编写体验

### 处理错误和响应

`callApi` 不总是顺利的，可能出现一些错误和异常，如网络错误、API 业务错误等。
在 TSRPC 中，不管是什么类型的错误，都在一处统一处理。
根据 `ret.isSucc` 来判断请求结果，成功则取响应 `ret.res`，失败则取错误 `ret.err`。

```ts title="frontend/src/index.ts"
async function onBtnClick(){
    // 像调用本地异步函数那样调用远端 API
    let ret = await client.callApi('HelloWorld', {
        name: 'World'
    });

    // 未检测错误，res 可能为空
    console.log(ret.res?.reply);

    // 检测错误，进入异常分支
    if(!ret.isSucc) {
        alert('Error: ' + ret.err.message);
        return;
    }

    // 已做错误保护，res 必定有值
    alert('Success: ' + ret.res.reply);
}

document.getElementById('btn').onclick = onBtnClick;
```

:::tip
TSRPC 的所有方法都不会抛出异常，因此总是无需 `promise.catch()`。
:::

## 测试一下

在 `frontend` 和 `backend` 目录下分别执行以下命令，启动本地开发服务器：
```shell
npm run dev
```

服务启动后，用浏览器打开 http://127.0.0.1:8080 看看效果吧~

## 自动类型检测

TSRPC 自动对请求和响应进行类型检测，同时在编译时刻和运行时刻，同时在客户端和服务端。
因此在编写 API 实现时，完全不需要关心类型安全问题。

**例子：请求类型不合法，在编译时刻报错**
```ts
callApi('HelloWorld', {
    name: 12345     // 类型错误
})
```

即便我们跳过了 TypeScript 的编译时刻检查，TSRPC 框架也会在运行时刻进行校验。
- 客户端先进行一次校验，将类型不合法的请求拦截在本地。
- 服务端在执行 API 前还会做二次校验，确保进入执行阶段的 API 请求一定是类型合法的。

**例子：请求类型不合法，被框架拦截**
```ts
callApi('HelloWorld', {
    name: 12345
} as any);  // as any 跳过 TypeScript 编译时刻检查

// 请求被拦截，返回类型错误信息 {isSucc: false, err: ... }
console.log(ret);   
```

## 二进制序列化

在 Chrome 中打开开发者工具，进入 Network 面板抓包后可以发现，传输内容看起来像乱码一般，这是因为框架自动将传输内容序列化成了二进制编码。它比 JSON 有着更小的传输体积和更好的安全性。
仍然看见一些明文是因为 TSRPC 并未对包体进行加密，开发者可以自行完成二进制编码的加密操作，我们在[后面的章节](sss.md)有所介绍。

二进制序列化能获得更好的传输效能，但考虑到兼容性，TSRPC 也支持第三方客户端及传统 JSON 方式的调用方法，例如：
```ts title="frontend/src/index.ts"
fetch('http://127.0.0.1:3000/HelloWorld', {
    ....
})
```

:::tip
Server 选项设置为 `jsonEnabled: false` 可禁用对 JSON 的兼容，对安全性要求高的系统，强烈建议禁用。
:::