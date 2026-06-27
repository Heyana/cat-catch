/**
 * Offscreen Downloader — 后台无感下载引擎
 * 
 * 替代 downloader.html 页面跳转，在隐藏的 offscreen 上下文中处理：
 * 1. 直接下载（带请求头）
 * 2. M3U8 解析 + TS 分段下载 + 合并
 * 
 * 通过 chrome.runtime 消息与 background.js 通信，
 * 下载完成后自动关闭 offscreen 文档。
 */

let downloader = null;  // Downloader 实例
let activeDownloads = 0;

// M3U8 playlist parser — 用 HLS.js 提取分段 URL
async function parseM3U8(url, requestHeaders) {
    return new Promise((resolve, reject) => {
        const hls = new Hls({
            enableWorker: false,
            fetchSetup: (context, initParams) => {
                const headers = {};
                if (requestHeaders) {
                    try {
                        Object.assign(headers, typeof requestHeaders === 'string'
                            ? JSON.parse(requestHeaders) : requestHeaders);
                    } catch (e) { }
                }
                return new Request(context.url, { ...initParams, headers });
            }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                hls.destroy();
                reject(new Error(data.type + ': ' + (data.details || 'unknown')));
            }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            const fragments = [];
            for (const level of data.levels) {
                if (level.details && level.details.fragments) {
                    for (const frag of level.details.fragments) {
                        if (!frag.url) continue;
                        const segUrl = frag.url.startsWith('http')
                            ? frag.url
                            : new URL(frag.url, frag.baseurl || url).href;
                        fragments.push({
                            requestId: segUrl,
                            url: segUrl,
                            downFileName: '',
                            title: '',
                            requestHeaders: requestHeaders || {}
                        });
                    }
                }
            }
            hls.destroy();
            if (fragments.length === 0) {
                reject(new Error('No fragments found in M3U8 playlist'));
            } else {
                resolve(fragments);
            }
        });

        hls.loadSource(url);
    });
}

// 下载单个 M3U8 流
async function downloadM3U8(data) {
    const fragments = await parseM3U8(data.url, data.requestHeaders);
    if (fragments.length === 0) return;

    fragments.forEach((f, i) => {
        f.downFileName = `${data.filename || 'video'}_${String(i).padStart(5, '0')}.ts`;
        f.index = i;
    });

    downloader = new Downloader(fragments, data.thread || 6);
    activeDownloads = fragments.length;

    downloader.on('completed', (buffer, fragment) => {
        // 进度上报
        chrome.runtime.sendMessage({
            type: 'offscreen-progress',
            fragment: fragment.index,
            total: fragments.length,
            success: downloader.success
        }).catch(() => { });
    });

    downloader.on('allCompleted', async (buffers) => {
        // 合并 TS 分段为单一 MP4
        const merged = mergeSegments(buffers);
        const blob = new Blob([merged], { type: 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: blobUrl,
            filename: data.filename || 'download.mp4',
            saveAs: data.saveAs || false
        }, (downloadId) => {
            URL.revokeObjectURL(blobUrl);
            activeDownloads = 0;
            scheduleClose();
        });
    });

    downloader.on('downloadError', (fragment, error) => {
        activeDownloads--;
        if (activeDownloads <= 0) scheduleClose();
    });

    downloader.start();
}

// 直接下载（带请求头保护）
async function downloadDirect(items) {
    for (const item of items) {
        // 构建带请求头的 fetch
        const headers = item.requestHeaders || {};
        const response = await fetch(item.url, {
            headers: { ...headers, referer: headers.referer || '' },
            cache: 'no-cache'
        });

        if (!response.ok) {
            chrome.runtime.sendMessage({
                type: 'offscreen-error',
                url: item.url,
                status: response.status
            }).catch(() => { });
            continue;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: blobUrl,
            filename: item.downFileName || item.filename || undefined,
            saveAs: item.saveAs || false
        }, (downloadId) => {
            URL.revokeObjectURL(blobUrl);
        });
    }

    activeDownloads = 0;
    scheduleClose();
}

// 合并 TS buffer
function mergeSegments(buffers) {
    const totalLength = buffers.reduce((sum, buf) => sum + (buf ? buf.byteLength : 0), 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
        if (buf) {
            merged.set(new Uint8Array(buf), offset);
            offset += buf.byteLength;
        }
    }
    return merged.buffer;
}

// 延迟关闭 offscreen 文档（等 chrome.downloads 回调完成）
let closeTimer = null;
function scheduleClose() {
    if (activeDownloads > 0) return;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
        chrome.offscreen.closeDocument();
    }, 3000);
}

// 监听从 background 发来的下载请求
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'offscreen-download') {
        sendResponse({ status: 'ok' });

        if (msg.type === 'm3u8') {
            downloadM3U8(msg.data);
        } else if (msg.type === 'direct') {
            downloadDirect(msg.data);
        }
        return false;
    }

    if (msg.action === 'offscreen-ping') {
        sendResponse({ status: 'alive', activeDownloads });
        return true;
    }
});

// 告知 background 已就绪
chrome.runtime.sendMessage({ type: 'offscreen-ready' }).catch(() => { });
