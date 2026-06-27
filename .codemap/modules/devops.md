# Module: DevOps

> 项目构建、CI/CD 与维护工具。包含 justfile（任务运行器）、GitHub Actions 工作流、本地化同步脚本和更新日志。

**Path:** `tools/` + `.github/` + `justfile`
**Tree hashes:** tools: `3c812677` | .github: `a0d3577`
**Mapped at:** 5ae4f61 (2026-06-27)

---

## 1. Scope & Purpose

开发与维护基础设施：
- **justfile**: 打包、压缩、本地化提取等任务的命令入口（类似 Makefile）
- **tools/**: 本地化文件自动同步脚本
- **.github/**: GitHub 赞助配置 (`FUNDING.yml`) 和 Issue 模板
- **CHANGELOG.md**: 版本变更记录（`CHANGELOG.md` 位于根目录）

## 2. Folder Architecture

```
(root)/
├── justfile              ← 任务运行器（build/pack/locales 等命令）
├── CHANGELOG.md          ← 版本更新日志

.github/
└── ISSUE_TEMPLATE/       ← GitHub Issue 模板

tools/
└── sync-locales.js       ← 自动同步新增 i18n key 到所有语言文件
```

## 3. Always-load vs On-demand

### Always-load (read these first for any task in this module)

- `justfile` — 了解可用命令和构建流程
- `CHANGELOG.md` — 了解版本历史和变更范围

### On-demand (read only when the task touches these areas)

- `tools/sync-locales.js` → 当需要同步翻译文件时
- `.github/ISSUE_TEMPLATE/` → 当修改 Issue 模板时
- `.github/FUNDING.yml` → 当修改赞助配置时

## 4. Rules & Boundaries

- `justfile` 是开发入口，不应被浏览器扩展加载
- `tools/` 脚本仅在开发环境运行，不打包进扩展
- `.github/` 配置仅用于 GitHub 平台，不影响扩展功能
- CHANGELOG.md 按版本号倒序记录

## 5. Source of Truth

| Concept | Canonical file | Notes |
|---------|---------------|-------|
| 构建命令 | `justfile` | just 命令运行器 |
| 版本历史 | `CHANGELOG.md` | 从 v1.0 至今的完整变更 |
| 翻译同步 | `tools/sync-locales.js` | Node.js 脚本 |

---

## Dependencies

### Depends on

- N/A — 开发工具链，与扩展运行时无关

### Depended on by

- [i18n](i18n.md) — `tools/sync-locales.js` 操作 `_locales/` 目录
