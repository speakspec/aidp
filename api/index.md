---
description: SpeakSpec 公開 API 參考文件，供 AI Agent 及第三方系統整合使用
---

# API 參考

SpeakSpec 平台提供公開 API，供 AI Agent 及第三方系統存取 AIDP 資料。

## Base URL

```
https://api.speakspec.com
```

所有回應為 JSON 格式。

## 公開端點

以下端點不需要認證，任何人都可以存取：

| 分類 | 說明 |
|------|------|
| [Public API](/api/public) | 透過 HTTP 存取 AIDP 文件，支援內容協商 |
| [MCP API](/api/mcp) | 透過 MCP JSON-RPC 協定存取 AIDP 資料 |

## 平台管理 API

SpeakSpec 平台另提供完整的管理 API，供已註冊用戶管理 Entity、Content、Directives、驗證及分析資料。管理 API 需要認證，文件請參閱平台內建的 API 說明。

## Rate Limiting

所有端點皆有請求頻率限制。超過限制時會回傳 HTTP 429 狀態碼。回應標頭包含：

- `X-RateLimit-Limit` - 每分鐘請求上限
- `X-RateLimit-Remaining` - 剩餘可用請求數
- `X-RateLimit-Reset` - 限制重置的 Unix 時間戳

## 錯誤格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

| 錯誤碼 | HTTP 狀態碼 | 說明 |
|--------|------------|------|
| `NOT_FOUND` | 404 | 請求的資源不存在 |
| `RATE_LIMITED` | 429 | 超過頻率限制 |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |
