# Phase 2 编辑器增强 Spec

> 基于 V1 编辑器（E:\Hermes\projects\omd-editor\index.html）增强

## 目标

把 V1 从「技术验证 Demo」升级为「可用的桌面 MVP」。保持纯 HTML 零依赖。

## 增强清单

### 1. 修复 contentEditable 表格嵌套 Bug
- 当前：表格单元格内按 Enter 会创建嵌套 contentEditable，导致 wysiwygToMD 输出错乱
- 修复：在 wysiwygToMD 中处理嵌套 contentEditable，或阻止表格内创建块级元素

### 2. 剪贴板粘贴图片
- 当前：只支持拖拽和 URL 输入
- 增强：Ctrl+V 粘贴剪贴板图片 → Base64 内嵌

### 3. 暗色/亮色主题切换
- 顶部工具栏加一个 🌓 按钮
- 切换 CSS 变量（--bg, --tx, --tb 等）
- 亮色主题：白底黑字，仿 Apple Notes 风格

### 4. 键盘快捷键
- Ctrl+B 加粗
- Ctrl+I 斜体
- Ctrl+1/2/3 切换 H1/H2/H3
- Ctrl+S 保存
- Ctrl+Shift+L 无序列表
- Ctrl+Shift+Q 引用块

### 5. 文件系统存取
- 保存：使用 File System Access API（showSaveFilePicker），降级到 download
- 打开：使用 showOpenFilePicker，降级到 input[type=file]
- 文件名显示在标题栏

### 6. MCP 集成
- 侧边栏新增「Vault」标签，调用 omd_list 显示文件列表
- 点击文件 → omd_read → 加载到编辑器
- 保存时 → omd_write 写回 Vault
- 通过 fetch POST 到 /api/mcp 代理（server.js 新增端点）

### 7. 字数统计
- 状态栏显示字数（中文字 + 英文单词）

### 8. 表格编辑体验
- 插入表格时可选行列数（弹窗输入 3x3 等）
- 右键菜单：插入行/删除行/插入列/删除列

## 技术约束
- 纯 HTML/CSS/JS，零外部依赖
- 保持现有四模式（默认/文稿/演讲/源码）
- 保持现有导出功能
- 文件位置：直接修改 E:\Hermes\projects\omd-editor\index.html
- server.js 新增 /api/mcp 代理端点

## 验收标准
1. 粘贴截图 → 显示在编辑器中
2. 切换主题 → 界面颜色变化
3. Ctrl+B → 文字加粗
4. 保存 → 弹出系统保存对话框
5. Vault 侧边栏 → 显示文件列表，点击加载
