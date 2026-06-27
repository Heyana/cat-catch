# Module: Libraries (Third-party)

> 第三方 JavaScript 库集合。提供 HLS 播放、MPEG-DASH 解析、媒体封装(muxing)、流保存、JSON 可视化、二维码生成、MQTT 通信等能力。以 `.min.js` 编译产物形式引入，无需构建步骤。

**Path:** `lib/`
**Language:** JavaScript (compiled/minified)
**Tree hash:** `3f1e8609f5ada92fbb47bc67e78696f8738d55e3`
**Mapped at:** 5ae4f61 (2026-06-27)

---

## 1. Scope & Purpose

为扩展提供开箱即用的第三方能力，避免重复造轮子。所有库由 HTML 页面通过 `<script>` 标签直接引入，无模块系统。jQuery 为基础依赖，被所有面板页面引用。

## 2. Folder Architecture

```
lib/
├── jquery.min.js              ← jQuery 3.x（基础依赖，所有面板页面使用）
├── jquery.json-viewer.js      ← JSON 格式化展示插件
├── jquery.qrcode.min.js       ← 二维码生成插件
├── hls.min.js                 ← HLS.js 播放器（M3U8 播放）
├── mpd-parser.min.js          ← MPEG-DASH manifest 解析器
├── mux.min.js                 ← 媒体封装库（TS → MP4 转换用）
├── m3u8-decrypt.js            ← M3U8 AES-128 解密（非压缩源码）
├── StreamSaver.js             ← 流式文件保存（Service Worker 代理下载）
├── base64.js                  ← Base64 编解码
├── mqtt.min.js                ← MQTT 客户端
└── third-party-libraries.md   ← 第三方库清单与许可证说明
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `lib/third-party-libraries.md` — 库清单与版本信息

### On-demand (read only when the task touches these areas)

- `lib/hls.min.js` → 当修改 HLS 播放功能时
- `lib/mpd-parser.min.js` → 当修改 MPEG-DASH 解析时
- `lib/mux.min.js` → 当修改 TS → MP4 转换时
- `lib/StreamSaver.js` → 当修改流式下载时
- `lib/m3u8-decrypt.js` → 当修改 M3U8 加密流解密时
- `lib/mqtt.min.js` → 当修改 MQTT 抓取功能时

## 4. Rules & Boundaries

- 所有 `.min.js` 文件为第三方编译产物，不直接修改（升级时整体替换）
- `m3u8-decrypt.js` 和 `StreamSaver.js` 为非压缩源码，可修改
- jQuery 的 `$` 可能与其他库冲突，需确保加载顺序（jQuery 最先）
- 这些库在扩展页面的全局作用域中运行，非 Service Worker 上下文
- 许可证：MIT / Apache 2.0，详见 `third-party-libraries.md`

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 库清单 | `lib/third-party-libraries.md` | 版本号与许可证 |
| HLS 播放 | `lib/hls.min.js` | HLS.js |
| DASH 解析 | `lib/mpd-parser.min.js` | video.js mpd-parser |
| 媒体封装 | `lib/mux.min.js` | video.js mux.js |

---

## Dependencies

### Depends on

- N/A — 第三方库，无内部依赖

### Depended on by

- [core](core.md) — `js/m3u8.js`/`js/mpd.js`/`js/downloader.js` 等依赖此模块的库
- [pages](pages.md) — HTML 页面通过 `<script>` 加载这些库
