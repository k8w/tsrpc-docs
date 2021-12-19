---
slug: cocos-mutiplayer.html
title: TSRPC 3.1.4 和 tsrpc-cli 2.3.0 更新
author: k8w
author_url: https://github.com/k8w
author_image_url: https://avatars.githubusercontent.com/u/1681689?v=4
tags: [TSRPC, 版本更新]
---

# TSRPC 3.1.4 和命令行工具更新

## TSRPC 3.1.4
### 新特性
- `WsServer` 自动检测传输格式是 JSON 还是二进制，Server 端设置 `json: true` 将可以同时兼容二进制和 JSON 传输格式
### Bug 修复
- 修复 `index.d.ts` 类型定义错误（感谢 @慢吞吞 提交此问题）
- 修复淘宝云函数平台下，Header 为 `application/json; charset=utf-8` 时传输类型判断错误的 Bug（感谢 @董帅 提交此问题）
- 修复当 URL 中有 `?xxx=xxx` 参数时，解析调用路径错误的 Bug （感谢 @董帅 提交此问题）

## tsrpc-cli 2.3.0
### 新特性
- `tsrpc doc` 现在支持多级目录嵌套分组了（感谢 @喵喵 的建议）
- 在 `tsrpc doc` 生成的 Markdown 文档中加入 API 接口目录
### Bug 修复
- 当使用 `type` 别名定义请求、响应类型时，注释没有生效的 Bug（感谢 @喵喵 提交此问题）