# 🗺️ Codebase Map — cat-catch

> 猫抓 (cat-catch) 浏览器资源嗅探扩展 — 筛选列出当前页面媒体资源（视频/音频/图片），支持 Chrome/Edge/Firefox，MV3 架构。

| Generated | Commit | Tool |
|-----------|--------|------|
| 2026-06-27 06:38 UTC | 5ae4f61 | codebase-cartographer |

## Tech Stack

JavaScript (ES6+), Chrome Extension Manifest V3, Service Worker, Content Scripts, HLS.js, MPEG-DASH

## Module Index

| Module | Purpose | Manifest |
|--------|---------|----------|
| core | 扩展核心 JS：后台 SW、内容脚本、初始化、功能函数、Firefox 适配 | [→ modules/core.md](modules/core.md) |
| catch-engine | 页面注入抓取引擎：媒体嗅探、正则搜索、WebRTC 录制 | [→ modules/catch-engine.md](modules/catch-engine.md) |
| pages | 所有 HTML 页面：弹窗、设置、安装、预览、JSON 查看、M3U8/MPD 播放面板 | [→ modules/pages.md](modules/pages.md) |
| i18n | 国际化：中英日西葡土越繁 8 语言翻译 | [→ modules/i18n.md](modules/i18n.md) |
| assets | 样式表与图标资源：CSS 5 文件 + 34 个 SVG/PNG 图标 | [→ modules/assets.md](modules/assets.md) |
| libs | 第三方库：jQuery、HLS.js、MPD Parser、Mux.js、MQTT、StreamSaver、QRCode | [→ modules/libs.md](modules/libs.md) |
| devops | 构建与 CI：justfile、GitHub Actions、本地化同步工具、更新日志 | [→ modules/devops.md](modules/devops.md) |

## How to Use This Map

1. **Start here.** Scan the Module Index above to find the area relevant to your task.
2. **Load the manifest.** Open only the module manifest you need.
3. **Follow the Always-load guidance** in that manifest to pull in the minimum source files required.
4. **Check cross-cuts** if your task spans multiple modules.
5. **Follow inter-module links** if you need to understand dependencies.

## Quick Stats

- Total modules: 7
- Estimated source files: 105
- Map coverage: 100% of top-level dirs covered
