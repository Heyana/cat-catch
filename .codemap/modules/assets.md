# Module: Assets (CSS + Icons)

> 样式表与图标资源。包含 5 个 CSS 文件（公共/弹窗/设置/安装/预览/移动端）和 34 个 SVG/PNG 图标，覆盖 light/dark 两种主题。

**Path:** `css/` + `img/`
**Language:** CSS, SVG, PNG
**Tree hashes:** css: `3fe8850f` | img: `cd37e66d`
**Mapped at:** 5ae4f61 (2026-06-27)

---

## 1. Scope & Purpose

扩展的视觉呈现层。CSS 控制所有 HTML 页面的布局和样式，img/ 提供工具栏图标和功能按钮图标。支持深色/浅色模式切换。无 JavaScript 逻辑。

## 2. Folder Architecture

```
css/
├── public.css       ← 公共基础样式（所有页面共享）
├── popup.css        ← 弹窗面板样式
├── options.css      ← 设置页面样式
├── install.css      ← 安装欢迎页样式
├── preview.css      ← 媒体预览页样式
└── mobile.css       ← 移动端适配样式（Edge Android）

img/
├── icon.png / icon128.png / icon-disable.png  ← 扩展图标（三尺寸）
├── *.dark.(png|svg) / *.svg / *.png            ← 功能按钮图标（34 个，light+dark 双主题）
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `css/public.css` — 被所有 HTML 页面引用，修改影响全局

### On-demand (read only when the task touches these areas)

- `css/popup.css` → 当修改弹窗样式时
- `css/options.css` → 当修改设置页样式时
- `css/mobile.css` → 当修改移动端适配时
- `img/` → 当替换图标或新增功能按钮时

## 4. Rules & Boundaries

- 所有 CSS 均为静态文件，无预处理器/构建步骤
- 深色模式通过 CSS 变量 (`:root` / `[data-theme="dark"]`) 实现，非独立 CSS 文件
- 图标命名约定：`{功能名}-dark.{扩展名}` 对应深色主题版本
- 扩展图标尺寸：64px (icon.png) 和 128px (icon128.png)
- 无 JavaScript 依赖，纯粹静态资源

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 全局样式 | `css/public.css` | 所有页面 `<link>` 的第一个样式文件 |
| 弹窗样式 | `css/popup.css` | 资源列表 UI 核心样式 |
| 扩展图标 | `img/icon.png` | manifest 中 `action.default_icon` |
| 图标集合 | `img/` | 34 个文件，覆盖所有工具栏功能按钮 |

---

## Dependencies

### Depends on

- N/A — 纯静态资源，无依赖

### Depended on by

- [pages](pages.md) — 所有 HTML 页面引用此模块的 CSS 和图标
