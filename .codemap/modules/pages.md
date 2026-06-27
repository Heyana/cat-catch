# Module: Pages (HTML UI)

> 扩展所有 HTML 页面，包含弹窗、设置、安装向导、媒体预览、JSON 查看器、M3U8/MPD 播放面板和下载器界面。所有页面通过 `<script>` 标签加载 JS 模块，样式引用 CSS 模块。

**Path:** `*.html` (root level)
**Language:** HTML + JavaScript

---

## 1. Scope & Purpose

扩展的用户交互界面层。每个 HTML 页面对应一个独立功能入口：
- **popup.html**: 点击扩展图标的弹窗，资源列表主界面
- **options.html**: 设置页面，所有配置项
- **install.html**: 首次安装/更新后的欢迎引导页
- **preview.html**: 媒体文件预览（图片/视频/音频）
- **json.html**: JSON 结构化数据查看
- **m3u8.html**: M3U8 播放面板（HLS.js 播放器 + TS 下载）
- **mpd.html**: MPEG-DASH 播放面板（Shaka Player）
- **downloader.html**: 通用下载器命令生成面板

## 2. Folder Architecture

```
(root)/
├── popup.html          ← 弹窗入口（default_popup + side_panel）
├── options.html        ← 设置页面（options_ui page）
├── install.html        ← 安装/更新欢迎页
├── preview.html        ← 媒体文件预览页
├── json.html           ← JSON 数据查看器
├── m3u8.html           ← HLS 播放 + TS 下载面板
├── mpd.html            ← MPEG-DASH 播放面板
└── downloader.html     ← aria2/motrix/curl/wget 命令导出面板
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `popup.html` + `js/popup.js` — 主交互入口，用户最常接触的界面
- `js/templates.js` — 生成所有页面共享的 HTML 模板片段

### On-demand (read only when the task touches these areas)

- `options.html` + `js/options.js` → 当修改设置项时
- `install.html` + `js/install.js` → 当修改安装流程时
- `preview.html` + `js/preview.js` → 当修改预览功能时
- `json.html` + `js/json.js` → 当修改 JSON 查看器时
- `m3u8.html` + `js/m3u8.js` → 当修改 HLS 播放功能时
- `mpd.html` + `js/mpd.js` → 当修改 DASH 播放功能时
- `downloader.html` + `js/downloader.js` → 当修改下载命令生成时

## 4. Rules & Boundaries

- 页面间通过 `chrome.runtime.sendMessage` 与 Service Worker 通信
- `popup.html` 同时作为 `action.default_popup` 和 `side_panel.default_path`
- 所有页面引用 `css/public.css` 作为公共基础样式
- 深色模式通过 `popup-utils.js` 中的 CSS 变量切换实现
- 页面 JS 文件必须通过 `<script>` 标签引入（非 ES module），因为扩展环境限制

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 弹窗布局 | `popup.html` | 扩展主界面 |
| 设置项定义 | `js/options.js` | 所有配置键名与默认值 |
| 共享模板 | `js/templates.js` | 列表行/设置组/通知等 HTML 片段 |
| 深色模式 | `js/popup-utils.js` | CSS 变量切换逻辑 |

---

## Dependencies

### Depends on

- [core](core.md) — 所有页面 JS 通过 `importScripts` 或直接引用加载核心逻辑
- [assets](assets.md) — 所有页面引用 CSS 样式文件
- [i18n](i18n.md) — 所有页面使用 `__MSG_*` 或 `chrome.i18n.getMessage()` 做国际化

### Depended on by

- [core](core.md) — Service Worker 通过 `chrome.action.openPopup()` 触发弹窗
