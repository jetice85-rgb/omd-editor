# OMD MCP Server 接口规范

> Phase 1.5 — AI Agent 标准入口

## 概述

基于 MCP (Model Context Protocol) 协议，为 OMD Vault 提供标准化的 AI Agent 读写接口。
底层调用 omd-core 引擎，Vault 路径可配置。

## 五个 Tool

### 1. omd_read — 读取文档

```
参数:
  path: string (必填) — 相对于 Vault 根目录的文件路径
  format: "full" | "body" | "meta" (可选，默认 "full")
    full: 返回完整 OMD（YAML 头部 + 正文 + <!--OMD--> 尾部）
    body: 仅返回正文 Markdown
    meta: 仅返回 YAML 头部元数据

返回:
  {
    path: string,
    title: string,
    meta: { title, author?, tags?, ... },
    body: string,        // format=full 或 body 时
    render: object|null, // format=full 时
    stats: { chars: number, lines: number }
  }
```

### 2. omd_search — 全文搜索

```
参数:
  query: string (必填) — 搜索关键词
  limit: number (可选，默认 10)

返回:
  {
    query: string,
    count: number,
    results: [
      {
        path: string,
        title: string,
        snippet: string,  // 匹配上下文（前后各 50 字）
        score: number     // 相关性分数
      }
    ]
  }
```

### 3. omd_write — 创建/更新文档

```
参数:
  path: string (必填) — 文件路径
  content: string (必填) — OMD 完整内容或 Markdown 正文
  mode: "omd" | "markdown" (可选，默认 "omd")
    omd: content 是完整 OMD（含头部尾部）
    markdown: content 是纯 Markdown，自动补充头部尾部

返回:
  {
    path: string,
    written: boolean,
    stats: { chars: number, lines: number }
  }
```

### 4. omd_list — 浏览目录

```
参数:
  dir: string (可选，默认 "") — 子目录路径
  pattern: string (可选，默认 "*.md") — 文件匹配模式

返回:
  {
    dir: string,
    files: [
      {
        path: string,
        title: string,    // 从 YAML 头部提取
        size: number,     // 字节
        modified: string  // ISO 时间
      }
    ],
    count: number
  }
```

### 5. omd_graph — 知识图谱

```
参数: 无

返回:
  {
    nodes: [
      { path: string, title: string, tags: string[] }
    ],
    edges: [
      { from: string, to: string, type: "link" | "tag" | "reference" }
    ]
  }
```

## 技术实现

- 语言: Node.js / TypeScript
- 协议: MCP stdio 传输
- 依赖: omd-core (parse, getOutline, validate)
- Vault 路径: 通过环境变量 `OMD_VAULT_PATH` 或启动参数配置
- 搜索: 简单全文匹配（不依赖外部搜索引擎），后续可升级为 Meilisearch

## 文件结构

```
omd-editor/
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # MCP Server 入口
│   │   ├── tools/
│   │   │   ├── omd_read.ts
│   │   │   ├── omd_search.ts
│   │   │   ├── omd_write.ts
│   │   │   ├── omd_list.ts
│   │   │   └── omd_graph.ts
│   │   └── utils.ts          # 文件遍历、搜索等工具函数
│   └── dist/                 # 编译输出
└── omd-core-dist/            # 已有引擎
```

## 验收标准

1. `omd_read("01-OMD-是什么.md")` → 返回完整文档内容
2. `omd_search("智慧生而共通")` → 返回匹配文档列表
3. `omd_list()` → 返回 Vault 文件列表
4. `omd_graph()` → 返回标签/双链关系图
5. 可通过 `node mcp-server/dist/index.js` 启动，stdio 通信
