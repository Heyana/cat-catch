# Module: Core (JS)

> 扩展核心 JavaScript 层，包含后台 Service Worker、内容脚本、初始化逻辑、Firefox 适配及共享工具函数。所有 HTML 页面通过 `importScripts` 或 `<script>` 引用此模块。v2.6.9，MV3 架构。

**Path:** `js/`
**Language:** JavaScript (ES6+)
**Tree hash:** `b1d175d6f7085717f166398e3300a72db8303e09`
**Mapped at:** 5ae4f61 (2026-06-27)

---

## 1. Scope & Purpose

扩展的运行时代码层。负责：
- **后台 Service Worker**: 管理 webRequest 监听、下载调度、定时清理、右键菜单、Badge 状态
- **内容脚本**: 注入页面捕获 `window.__catcatch__` 事件，桥接页面脚本与扩展后台
- **初始化**: 存储迁移、默认配置注入、m3u8/mpd/blob 捕获规则注册
- **工具函数**: 缓存存储、数据去重、URL 处理、深搜、媒体链接格式化
- **Firefox 适配**: 声明式网络请求兼容处理

此模块是各 HTML 页面的运行时依赖。所有页面 JS 通过 `importScripts("/js/function.js")` 加载共享逻辑。

## 2. Folder Architecture

```
js/
├── background.js          ← Service Worker 入口，imports function/init/templates
├── content-script.js      ← 注入页面，桥接 catch-script ↔ 扩展后台
├── init.js                ← 首次安装初始化、存储迁移、捕获规则注册
├── function.js            ← 全局工具函数库（缓存/去重/下载/通知/按钮控制）
├── firefox.js             ← Firefox 特有适配（declarativeNetRequest 降级）
├── popup.js               ← 弹窗主逻辑（资源列表渲染/操作/筛选）
├── popup-utils.js         ← 弹窗辅助函数（列顺序/dark mode/快捷键）
├── options.js             ← 设置页面逻辑（所有配置项的读写绑定）
├── install.js             ← 安装欢迎页（初始化向导）
├── preview.js             ← 媒体预览页（图片/视频/音频预览）
├── json.js                ← JSON 数据查看器
├── templates.js           ← 共享 HTML 模板生成（popup 列表行/options 布局）
├── m3u8.js                ← M3U8 解析与播放面板（HLS 流处理）
├── m3u8.downloader.js     ← M3U8 下载引擎（ts 分段下载→合并→转换）
├── mpd.js                 ← MPEG-DASH (.mpd) 解析与播放（Shaka/mpd-parser）
├── media-control.js       ← 媒体控制面板（画中画/全屏/倍速/截图）
├── downloader.js          ← 通用下载器（aria2/motrix/curl/wget 命令导出）
└── i18n.js                ← 国际化字符串获取（见 i18n 模块）
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `js/function.js` — 全局共享工具，几乎所有文件依赖
- `js/background.js` — 扩展生命周期入口，了解整体架构
- `js/manifest.json` (root) — 权限与入口声明

### On-demand (read only when the task touches these areas)

- `js/m3u8.js` → 当处理 HLS/m3u8 流时
- `js/mpd.js` → 当处理 MPEG-DASH 流时
- `js/downloader.js` → 当修改下载功能时
- `js/options.js` → 当修改设置项时
- `js/init.js` → 当修改安装流程或存储结构时
- `js/firefox.js` → 当处理 Firefox 兼容问题时

## 4. Rules & Boundaries

- `background.js` 通过 `importScripts` 加载 `function.js` / `templates.js` / `init.js`，禁止使用 ES `import`
- 所有 Chrome API 调用需检查 `chrome.runtime.lastError`
- Service Worker 会在 5 分钟后被强制终止，需用 `chrome.alarms` + Port 心跳维持活跃
- `content-script.js` 只在 `http://*/*` 和 `https://*/*` 注入，`all_frames: true`
- 数据持久化使用 `chrome.storage.local`（非 sync），键名前缀 `__catcatch__`
- MV3 下不允许 `eval()` 和远程代码加载

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 扩展入口 | `js/background.js` | 第1行 importScripts 声明依赖链 |
| 权限声明 | `manifest.json` | 根目录 |
| 存储结构 | `js/init.js` | `storageMigration()` 函数定义所有键 |
| 共享工具 | `js/function.js` | 约 2000 行，被所有页面 JS 引用 |
| 捕获规则 | `js/init.js` | `setCatcher()` 注册 m3u8/mpd/blob 捕获 |

---

## Dependencies

### Depends on

- [pages](pages.md) — 所有 HTML 页面通过 `<script>` 或 `importScripts` 引用 JS 文件
- [i18n](i18n.md) — `js/i18n.js` 读取 `_locales/` 提供界面字符串

### Depended on by

- [pages](pages.md) — 所有 HTML 页面依赖此模块的 JS 文件
- [catch-engine](catch-engine.md) — 通过 `content-script.js` 桥接消息

---

## Key Entry Points

| Entry point | File | Description |
|-------------|------|-------------|
| Service Worker | `js/background.js` | 扩展后台主进程 |
| Content Script | `js/content-script.js` | 页面注入入口 |
| 弹窗逻辑 | `js/popup.js` | 点击扩展图标弹出面板 |
| 设置页逻辑 | `js/options.js` | 右键→选项打开的设置页面 |
