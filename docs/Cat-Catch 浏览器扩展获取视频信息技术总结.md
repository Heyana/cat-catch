# Cat-Catch 浏览器扩展获取视频信息技术总结

## 项目概述

Cat-Catch 是一个功能强大的浏览器扩展（版本 2.6.4），专门用于捕获和下载网页中的视频资源。该扩展支持多种视频格式，包括普通 MP4、HLS (M3U8) 流媒体等，并能精确获取视频的各种信息。

**项目地址**: https://github.com/xifangczy/cat-catch

## 核心架构

### 扩展组成
- **Content Script**: `js/content-script.js` - 注入到所有网页，负责视频元素检测
- **Background Script**: `js/background.js` - 后台服务工作器
- **Popup界面**: `popup.html` - 扩展弹窗界面
- **流媒体解析器**: `js/m3u8.js` - 专门处理HLS流媒体
- **视频控制器**: `js/media-control.js` - 视频播放控制

### 权限配置
```json
"permissions": [
  "tabs", "webRequest", "downloads", "storage", 
  "webNavigation", "alarms", "declarativeNetRequest", 
  "scripting", "sidePanel"
],
"host_permissions": ["*://*/*", "<all_urls>"]
```

## 视频信息获取技术实现

### 1. 获取视频长度（时长）

#### 1.1 通过 HTML5 Video API
```javascript
// 在 content-script.js 中
document.querySelectorAll("video, audio").forEach(function (video) {
    if (video.currentSrc != "" && video.currentSrc != undefined) {
        videoObj.push(video);
        videoSrc.push(video.currentSrc);
    }
});

// 获取时长信息
const video = videoObj[Message.index];
const timePCT = video.currentTime / video.duration * 100;
sendResponse({
    currentTime: video.currentTime,    // 当前播放时间（秒）
    duration: video.duration,          // 视频总时长（秒）
    time: timePCT,                     // 播放进度百分比
    // ... 其他属性
});
```

#### 1.2 时长格式转换
```javascript
// 秒数转换为时:分:秒格式
function secToTime(sec) {
    let time = "";
    let hour = Math.floor(sec / 3600);
    let min = Math.floor((sec % 3600) / 60);
    sec = Math.floor(sec % 60);
    if (hour > 0) { time = hour + "'"; }
    if (min < 10) { time += "0"; }
    time += min + "'";
    if (sec < 10) { time += "0"; }
    time += sec;
    return time;
}
```

#### 1.3 直播流处理
```javascript
// 对于HLS直播流，累计记录时长
if (recorder) {
    downDuration += fragment.duration;
    $fileDuration.html(i18n.recordingDuration + ":" + secToTime(downDuration));
}
```

### 2. 获取视频尺寸和宽高

#### 2.1 方法一：HTML5 Video 元素属性
```javascript
// 在截图功能中使用
if (Message.Message == "screenshot") {
    const video = _videoObj[Message.index];
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;      // 视频原始宽度
    canvas.height = video.videoHeight;    // 视频原始高度
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
}
```

#### 2.2 方法二：HLS.js 流媒体元数据
```javascript
// 在 m3u8.js 中，通过 HLS.js 获取
hls.on(Hls.Events.BUFFER_CREATED, function (event, data) {
    const info = $(".videoInfo #info");
    if (data.tracks && info.html() == "") {
        // 音视频合并轨道
        if (data.tracks.audiovideo?.metadata) {
            info.append(` ${i18n.resolution}:${data.tracks.audiovideo.metadata.width} x ${data.tracks.audiovideo.metadata.height}`);
        }
        // 纯视频轨道
        if (data.tracks.video?.metadata) {
            info.append(` ${i18n.resolution}:${data.tracks.video.metadata.width} x ${data.tracks.video.metadata.height}`);
        }
    }
});
```

#### 2.3 方法三：M3U8 Manifest 解析
```javascript
// 从 M3U8 播放列表中解析分辨率信息
hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
    if (data.levels.length) {
        for (let index in data.levels) {
            const item = data.levels[index];
            // 从 RESOLUTION 属性获取分辨率
            const resolution = item.attrs.RESOLUTION; // 例如: "1920x1080"
            const html = `${resolution ? i18n.resolution + ":" + resolution : ""}`;
        }
    }
});
```

### 3. 获取码率信息

#### 3.1 从 HLS Levels 获取
```javascript
// 当前播放级别的码率
if (hls.levels[currentLevel]?.bitrate) {
    info.append(` ${i18n.bitrate}:${parseInt(hls.levels[currentLevel].bitrate / 1000)} Kbps`);
}

// 所有可用码率级别
for (let index in data.levels) {
    const item = data.levels[index];
    const bandwidth = item.attrs.BANDWIDTH; // 比特率（bps）
    const bitrateKbps = parseInt(bandwidth / 1000); // 转换为 Kbps
}
```

#### 3.2 自动选择最高码率
```javascript
let maxBandwidth = 0;
for (let index in data.levels) {
    const item = data.levels[index];
    maxBandwidth = Math.max(maxBandwidth, item.attrs.BANDWIDTH);
    if (maxBandwidth == item.attrs.BANDWIDTH) { 
        dataMerge.video = item; // 默认选择码率最大的
    }
}
```

### 4. 其他视频属性获取

#### 4.1 播放状态信息
```javascript
sendResponse({
    paused: video.paused,              // 是否暂停
    loop: video.loop,                  // 是否循环
    speed: video.playbackRate,         // 播放速度
    muted: video.muted,                // 是否静音
    volume: video.volume,              // 音量 (0-1)
    type: video.tagName.toLowerCase()  // 元素类型 (video/audio)
});
```

#### 4.2 编码格式检测
```javascript
// 检测 HEVC (H.265) 编码
if (data.tracks.audiovideo.codec && data.tracks.audiovideo.codec.startsWith("hvc1")) {
    info.append(` <b>${i18n.hevcTip}</b>`);
}

// 检测音频/视频轨道
!data.tracks.audio && info.append(` (${i18n.noAudio})`);
!data.tracks.video && info.append(` (${i18n.noVideo})`);
```

## 跨框架支持

### iframe 视频检测
```javascript
// 检测 iframe 中的视频元素
const iframe = document.querySelectorAll("iframe");
if (iframe.length > 0) {
    iframe.forEach(function (iframe) {
        if (iframe.contentDocument == null) { return true; }
        iframe.contentDocument.querySelectorAll("video, audio").forEach(function (video) {
            if (video.currentSrc != "" && video.currentSrc != undefined) {
                videoObj.push(video);
                videoSrc.push(video.currentSrc);
            }
        });
    });
}
```

### 多框架消息传递
```javascript
// 获取所有框架中的密钥信息
chrome.webNavigation.getAllFrames({ tabId: tabId }, function (frames) {
    frames.forEach(function (frame) {
        chrome.tabs.sendMessage(tabId, { Message: "getKey" }, 
            { frameId: frame.frameId }, function (result) {
            // 处理结果
        });
    });
});
```

## 技术特点和优势

### 1. 多格式支持
- **普通视频**: 通过 HTML5 Video API 直接获取
- **HLS 流媒体**: 使用 HLS.js 库解析 M3U8
- **DASH 流媒体**: 支持 MPD 格式解析
- **直播流**: 实时获取和累计时长信息

### 2. 精确度保证
- 使用 `videoWidth/videoHeight` 获取原始分辨率
- 通过流媒体元数据获取精确编码信息
- 实时更新播放进度和状态

### 3. 性能优化
- 使用 DOM 缓存减少重复查询
- 异步处理避免阻塞主线程
- 智能检测避免无效操作

### 4. 兼容性处理
- 同时支持 Chrome 和 Firefox
- 处理各种网站的 CSP 限制
- 适配不同的流媒体协议

## 实施建议

### 1. 集成要点
- 确保 Content Script 在 `document_start` 时注入
- 监听页面 DOM 变化，动态检测新增视频元素
- 使用消息传递机制在不同脚本间通信

### 2. 错误处理
- 检查视频元素的有效性（`currentSrc` 不为空）
- 处理跨域 iframe 访问限制
- 捕获流媒体解析异常

### 3. 扩展功能
- 结合网络请求监听获取更多元数据
- 支持加密流媒体的密钥获取
- 实现多轨道音视频信息提取

## 总结

Cat-Catch 扩展通过综合使用 HTML5 Video API、HLS.js 流媒体库和浏览器扩展 API，实现了对各种视频格式的全面信息获取。其技术架构清晰、兼容性强，为视频信息提取提供了完整的解决方案。

该技术方案可以作为开发类似功能扩展的参考，特别适用于需要精确获取视频属性的应用场景。
