---
title: cURL
description: cURL
homeFeed: true
createAt: 2026-02-01
sidebarGroupLabel: 网络调试
screen: images/curl.png
---

cURL 是一个在终端发送网络请求的工具。

## 高频指令

| 指令 | 记忆口诀 | 实际用途 |
| --- | --- | --- |
| `-d` | 发送数据 | `-d (data)`: 后面跟着要发送的具体 数据内容 |
| `-F` | 发送文件 | `-F (form)`: 后面跟着要发送的具体 文件内容 |
| `-H` | 添加 Header | `-H (header)`: 添加 HTTP 头信息 |
| `-i` | 看结果 | 显示响应头（Status Code, Cookie, Header） |
| `-I` | 只看头 | 仅获取 Header 信息，不下载具体内容。 |
| `-k` | 不管证书 | 跳过 SSL 检查，解决本地 HTTPS 证书报错。 |
| `-L` | 跟跳转 | 如果页面重定向了，自动跟过去。 |
| `-s` | 静默模式 | 不显示下载进度条 |
| `-v` | 看过程 | 全过程调试，显示握手、请求、响应的所有细节。 |
| `-X POST` | 指定请求方法 | 为 POST（默认是 GET） |
| `-o file` | 存文件 | 将返回的内容保存为本地文件（如：-o test.html）。 |
| `http://...` | 目标地址 | 其中的 $SID 是一个变量 |

## 常用场景

### 发送 JSON

```bash
curl -X POST http://api.com -H "Content-Type: application/json" -d '{"id": 1}'
```

### 发送表单

```bash
curl -F "username=xiaoming" -F "password=123456" http://api.com/login
```

### 携带 Cookie

```bash
curl -H "Cookie: session_id=abc123" http://api.com/user
```
