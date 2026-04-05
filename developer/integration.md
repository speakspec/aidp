---
description: AIDP 開發者整合指南，涵蓋 MCP、REST API 與靜態檔案三種整合方式
---

# 整合總覽

AIDP 協定提供三種整合方式，適用於不同的使用場景與技術需求。

## 三種整合方式

1. **MCP 整合** -- AI Agent 透過 MCP JSON-RPC 直接存取 AIDP 資料（推薦給 AI 應用開發者）
2. **REST API** -- 透過 HTTP API 管理 Entity、Content、Directives 並取得各種輸出格式
3. **靜態檔案** -- 將 AIDP JSON 放在 `/.well-known/aidp.json`，最簡單的部署方式

## 方式比較

| 方式 | 適用場景 | 認證 | 即時更新 | 完整 Directive 支援 |
|---|---|---|---|---|
| MCP | AI Agent 直接存取 | 不需要 | 是 | 是 |
| REST API | 第三方系統整合 | JWT Token | 是 | 是 |
| 靜態檔案 | 簡單部署、自託管 | 不需要 | 手動 | 是 |

## 如何選擇

如果你正在開發 AI Agent 或 AI 應用，**MCP 整合**是最推薦的方式。AI Agent 可以透過標準的 MCP 協定直接查詢 AIDP 資料，不需要額外的認證流程。

如果你需要在自己的系統中管理 Entity 和 Content，或是需要程式化地建立和更新資料，請使用 **REST API**。

如果你只需要讓 AI Agent 能夠讀取你的資料，且不需要透過平台管理內容，**靜態檔案**是最簡單的選擇。

## 詳細文件

- [MCP 整合](/developer/mcp-integration) -- MCP 端點、Resource 模式、Tool 模式
- [REST API 串接](/developer/rest-api) -- 認證、CRUD 操作、公開 API
- [靜態檔案部署](/developer/static-file) -- 檔案設定、Web Server 設定、DNS 驗證
