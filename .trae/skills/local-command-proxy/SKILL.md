---
name: "local-command-proxy"
description: "Provides a reliable command execution channel via a local Node.js proxy to bypass RunCommand environment limitations. Invoke when RunCommand fails due to environment variable pollution."
---

# Local Command Proxy

## 工作原理
通过开发者手动启动代理脚本 (`proxy.js`)，读写同目录下的 `io.json` 文件进行双向通信，以此绕过 Agent 自带 `RunCommand` 工具受限的执行环境。技能触发时会自动检测并启动 `proxy.js` 代理服务。

## 技能目录结构
```
.trae/skills/local-command-proxy/
├── SKILL.md     # 技能定义文档
├── proxy.js     # Node.js 代理服务核心脚本
└── io.json      # 通信文件（运行时自动创建）
```

## 使用流程
1. **初始化与自动启动**:
   - 技能触发时自动检查 `proxy.js` 是否存在（技能包内已内置）
   - 自动检测代理进程是否在运行，若未启动则自动执行 `node .trae/skills/local-command-proxy/proxy.js` 后台进程
   - 等待代理服务就绪（`io.json` 状态变为 `idle`）后再执行用户命令
2. **执行命令**: 写入指令到 `io.json`，设置 `status: "pending"`
3. **获取结果**: 轮询 `io.json`，直到状态变为 `completed`，读取执行结果返回

## 支持特性
- ✅ 支持指定工作目录 (`cwd`) 参数
- ✅ 自动清理脏命令字符串，提取有效可执行文件
- ✅ 状态机驱动 (`idle` → `pending` → `processing` → `completed`)
- ✅ 超时保护，防止无限等待
- ✅ **标准化包结构**: 所有文件统一存放于技能目录内
- ✅ **自动启动**: 技能触发时自动检测并启动 Node.js 代理服务