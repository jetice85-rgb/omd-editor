# OMD Editor v0.8.0

> **智慧生而共通。** 单文件 HTML 编辑器，零依赖，打开即用。

## 🚀 首次公开发布

OMD Editor 从一行 HTML 开始，经过 34 次提交、三 Agent 协作开发、Codex 强迫症审查，现在达到可发布状态。

---

## 💡 灵感流（默认模式）

- 块编辑器：图标前缀（💡📝✅📌🔖💬）+ Enter 新建同类块
- 底部 56px 圆形大按钮，移动端优先
- 块拖拽排序
- `# ` 自动格式化（Markdown 快捷输入）
- 5 种块底色（idea/todo/done/quote/pin）
- 选中文字 1.5s 后浮出格式条

## 📄 文稿模式

- A4 纸浮桌面，仿 Word 所见即所得
- 仿宋字体，符合公文排版习惯
- 纸阴影 4 层 + 块入场动画 + 按钮按压反馈
- Ctrl+滚轮缩放
- 双页并排

## 🎞 演讲模式

- PPT 风格，全屏播放（F5）
- 4 种版式模板（标题页/内容页/两栏/结束页）
- 幻灯片排序（Alt+↑↓）+ 切换动画
- 3 种配色主题

## 🔄 格式互转

- **导出**：docx / xlsx / pptx / pdf（4 端点全部 200 OK）
- **导入**：Word (.docx) 拖入即导入（mammoth.js）
- 拖拽文件到编辑器即导出

## 🛠 工具

- Ctrl+F 查找栏
- ? 快捷键面板
- 🖨 打印 CSS 优化
- Ctrl+\\ 侧边栏（大纲/Vault 文件管理）
- 表格右键菜单（增删行列）
- 图片粘贴（Base64）
- 自动保存（localStorage）

## 🔌 MCP 接口

- 标准 MCP 协议，外部 Agent 可读写 Vault
- omd_read / omd_write / omd_list / omd_search / omd_graph

## 🎨 设计

- 暗灰粉配色（#d4576b + #1b1e2b）
- 双主题（暗色/亮色）
- 52 项 UI 修复（Codex 强迫症审查）
- 零横向滚动条
- 移动端适配

---

## 📦 使用

```bash
npm install && node server.js
# → http://localhost:3456
```

或直接浏览器打开 `index.html`（部分功能需 server 端点）。

---

## 🔜 路线图

- v0.9.0：乔布斯灵魂改造（系统主题跟随/3s 色温过渡/纸纹理/呼吸光标）
- v0.10.0：代码拆分（CSS/JS 独立文件，index.html < 30KB）
- v1.0.0：GitHub Pages 静态部署 + 社区反馈迭代

---

OMD 全栈开源（MIT）。智慧生而共通。
