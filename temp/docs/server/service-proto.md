---
sidebar_position: 2
description: 众所周知，TypeScript 的类型检测仅发生在编译时刻，这是因为类型信息（如 `type`、`interface`）会在编译时刻被抹除。而 TSRPC 竟然能在运行时刻也检测这些被抹除的类型信息？况且 TypeScript 编译器有大几 MB，而 TSRPC 才几十 KB。其实，这是因为...
---

# 协议和运行原理

## 运行时类型检测的实现原理

众所周知，TypeScript 的类型检测仅发生在编译时刻，这是因为类型信息（如 `type`、`interface`）会在编译时刻被抹除。而 TSRPC 竟然能在运行时刻也检测这些被抹除的类型信息？
况且 TypeScript 编译器有大几 MB，而 TSRPC 才几十 KB……

其实，这是因为我们遵循 TypeScript 类型系统，独立实现了一套轻量的类型系统，可以在运行时完成类型检测，甚至是二进制序列化。它支持了绝大多数常用的 TypeScript 类型。[支持的类型清单](../tsrpc-inside/supported-types)

:::note
这是另一个独立的开源项目 [TSBuffer](https://github.com/k8w/tsbuffer)，如果你有单独的 TypeScript 数据类型的运行时检测和序列化需求可以看看。文档暂时空缺，我们将在未来逐步完善，当然你也可以联系活着的作者（见页面底部）。
:::

## 定义协议

### ServiceProto
综上，TSRPC 在运行时有一套自己的协议和类型定义，这个定义格式被命名为 `ServiceProto`。
通常来说，你不需要去了解这个格式的细节，因为它是通过[命令行工具](../full-stack/tsrpc-cli)自动生成的。
如果你使用的是 `npx create-tsrpc-app@latest` 创建的项目，则生成命令已经内置在后端项目的 `npm run proto`。ServiceProto 会自动生成到 `protocols/serviceProto.ts`。

### 定义规则

`tsrpc-cli` 完全通过 **名称** 来识别协议，这包括了文件名、类型名等。
所以务必要严格按照 TSRPC 规定的名称前缀来命名，同你在[之前的文章](../get-started/the-first-api#编写协议文件)中看到过的，命名规则总结如下。

#### API Service
- 文件名为：`Ptl{接口名}.ts`，下面的几项都定义于此文件内
- 请求类型名为： `Req{接口名}` (必须 `export`)
- 响应类型名为：`Res{接口名}`（必须 `export`）
- 额外配置项为：`export const conf = { ... }`

#### Message Service
- 文件名为：`Msg{消息名}.ts`，下面的几项都定义于此文件内
- 消息类型名为：`Msg{消息名}`
- 额外配置项为：`export const conf = { ... }`

协议的信息及额外配置项，你可以在运行时通过 `call.service` 或 `server.serviceMap` 获得。

:::tip
虽然规定请求和响应必须定义在 `PtlXXX.ts` 文件内，但它们可以自由引用外部其它文件的类型。但由于协议目录是跨项目共享的，所以为了方便起见，应当保证所有协议的依赖项都位于 `shared` 目录内部，且不要引用自 `node_modules`，除非你确定这些依赖在前后端项目中都有安装。
:::

### 同步协议
ServiceProto 和协议目录在客户端也需要用到，你可以用自己喜欢的方式把它们同步到客户端项目。我们的项目模板里已经帮你内置了 `npm run sync` 命令。

如果你在创建项目时没有勾选 Symlink，则 `npm run sync` 被实现为删除目标文件夹，然后从后端复制过去，最后设为只读。设为只读的意义在于，防止前端修改后，被新的同步覆盖。

如果你希望在前后端都能同步修改，可以在创建项目时启用 Symlink。此时 `npm run sync` 只是在目标位置创建了一个快捷方式。此时两边其实是同一个目录，所以可以同步修改，也不需要每次都执行 `npm run sync`。

如果你在 Windows 下，又使用 Git，那么当你克隆一个带 Symlink 的项目到本地后，Symlink 可能会变成一个文件。
如果出现这种情况，你只需要在后端目录重新运行 `npm run sync` 生成 Symlink 即可。

## 协议变更

由于 TSRPC 运行时实际解析的是 `ServiceProto`，所以每当协议发生变更时，你都应该执行 `npm run proto` 来重新生成，然后 `npm run sync` 将它们同步出去。

这里牵扯出重要的一个问题，即重新生成的 `ServiceProto` 与旧的能保持兼容吗？

TSRPC 中的每个接口、类型定义，都有一个 ID，是一个自增的数字。
例如你有 3 个接口 `PtlA`、`PtlB`、`PtlC`，它们可能被编码为 `1`、`2`、`3`。
但设想一下这种情况，假设你删除了 `PtlB`，然后新增了一个 `PtlD`，新生成的协议，接口 ID 会如何编排？

这种情况不用担心！因为当你执行 `npm run proto` 时，`tsrpc-cli` 会检测目标位置是否有同名文件，如果有则会读取它，比较新旧协议然后做尽可能的兼容，确保一定不会出现 ID 的冲突。

当然，还是有另一种冲突可能，即类型本身发生了不相容的变动。
例如从 `a: string` 改为了 `a: number`，这种情况下，新旧协议就无法兼容。发布时，你可以采用蓝绿发布等方式来防止前后端版本不一致造成的协议冲突。