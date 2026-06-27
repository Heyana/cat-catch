# Module: Catch Engine

> 注入页面的资源嗅探引擎。通过 `catch-script/` 目录下的自执行脚本在目标页面中运行，负责实时捕获所有媒体资源的 URL、类型、请求头信息，并通过 `window.__catcatch__` 事件桥接给内容脚本。

**Path:** `catch-script/`
**Language:** JavaScript (ES6+)
**Tree hash:** `f7d39f067202eec3988300be2cbfcc6bfc8e6595`
**Mapped at:** 5ae4f61 (2026-06-27)

---

## 1. Scope & Purpose

页面级捕获引擎，由 content-script 注入到每一个访问的网页中。负责：
- 拦截 `XMLHttpRequest` / `fetch` 请求，提取媒体 URL
- 正则表达式深度搜索页面 DOM/JS 源码中的隐藏资源链接
- MediaRecorder API 实现 WebRTC/屏幕录制
- 实时将捕获结果推送到扩展 popup 面板

此模块是所有资源嗅探能力的核心，独立于 Chrome Extension API 环境运行在网页上下文中。

## 2. Folder Architecture

```
catch-script/
├── catch.js       ← 主捕获入口，实例化 CatCatcher 类
├── search.js      ← 正则深搜：DOM 遍历 + 内联脚本提取隐藏媒体链接
├── recorder.js    ← MediaRecorder 封装：屏幕/标签页录制（旧版）
├── recorder2.js   ← MediaRecorder 封装 v2：getDisplayMedia 录制
├── webrtc.js      ← WebRTC 流捕获
└── i18n.js        ← 页面级国际化字符串（UI 面板文本）
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `catch-script/catch.js` — CatCatcher 类，整个捕获引擎的入口和调度中心

### On-demand (read only when the task touches these areas)

- `catch-script/search.js` → 当修改深搜逻辑或正则匹配模式时
- `catch-script/recorder.js` / `recorder2.js` → 当修改录制功能时
- `catch-script/webrtc.js` → 当处理 WebRTC 流捕获时
- `catch-script/i18n.js` → 当修改页面内 UI 文本时

## 4. Rules & Boundaries

- 所有脚本以 IIFE `(function() { ... })()` 形式运行，避免污染全局作用域
- 通过 `window.__catcatch__` 自定义事件与 content-script 通信
- `CatCatcher` 类实例化时自动挂载事件监听器（XHR/fetch 拦截）
- 捕获数据存储在 `this.catchMedia[]` 数组，定期清理去重
- 深搜性能敏感，需 `requestIdleCallback` 或分帧处理
- 页面脚本无权访问 Chrome Extension API，必须通过 content-script 中转

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 捕获入口 | `catch-script/catch.js` | CatCatcher 构造函数即入口 |
| 深搜逻辑 | `catch-script/search.js` | 正则匹配模式定义 |
| 数据格式 | `catch-script/catch.js` | catchMedia 数组结构定义 |
| UI 文本 | `catch-script/i18n.js` | 页面内嵌面板的翻译字符串 |

---

## Dependencies

### Depends on

- [core](core.md) — 通过 `js/content-script.js` 接收控制指令和发送捕获结果
- [i18n](i18n.md) — `catch-script/i18n.js` 需要与 `_locales/` 保持翻译一致

### Depended on by

- [core](core.md) — content-script 依赖此模块提供资源数据
- [pages](pages.md) — popup 面板展示此模块捕获的资源列表

---

## Key Entry Points

| Entry point | File | Description |
|-------------|------|-------------|
| CatCatcher 实例化 | `catch-script/catch.js` | 页面注入后自动执行 |
| 深搜触发 | `catch-script/search.js` | 用户点击"深度搜索"按钮触发 |
| 录制开始 | `catch-script/recorder.js` | 用户触发录制功能 |
