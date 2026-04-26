---
description: SpeakSpec 認證 API 參考，介紹 API Key 認證、權限範圍、錯誤碼與端點清單
---

# Authenticated API

供第三方系統管理 Entity、Content、Directives、Verification 等資源使用。所有端點皆需以 API Key 認證。

Base URL: `https://api.speakspec.com`

## 認證方式

於 HTTP 標頭加入 API Key：

```
X-API-Key: aidp_xxxxxxxx
```

API Key 須在 SpeakSpec 管理後台建立。建立成功後系統僅顯示完整金鑰一次，請立即複製保存。詳見 [SpeakSpec 平台指南 — API Keys](/guide/speakspec-guide#api-keys)。

## URL 前綴

所有認證端點皆以 `/api/` 為前綴。伺服器內部會處理版本相容，未來版本升級不影響已上線的呼叫端。

```bash
curl https://api.speakspec.com/api/entities/{entityId} \
  -H "X-API-Key: aidp_xxxxxxxx"
```

## API Key 行為

### Entity 綁定

每組 API Key **僅綁定一個 Entity**。建立 API Key 時必須指定它能存取哪一個 Entity，建立後無法變更。嘗試以 API Key 存取其他 Entity 的資源 → `403 ENTITY_SCOPE_MISMATCH`。

### Scope

| Scope | 允許方法 |
|---|---|
| `read` | `GET` |
| `write` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

以 `read` Scope 嘗試寫入操作 → `403 INSUFFICIENT_SCOPE`。

### Key 格式

- 一律以 `aidp_` 為前綴
- 標頭格式不符或不存在 → `401 INVALID_API_KEY`
- Key 已撤銷 → `401 API_KEY_REVOKED`
- Key 已過期 → `401 API_KEY_EXPIRED`

## 錯誤格式

所有錯誤皆以下列 JSON 結構回傳：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### 錯誤碼

| 錯誤碼 | HTTP | 說明 |
|---|---|---|
| `INVALID_API_KEY` | 401 | API Key 格式錯誤或不存在 |
| `API_KEY_EXPIRED` | 401 | API Key 已過期 |
| `API_KEY_REVOKED` | 401 | API Key 已被撤銷 |
| `INSUFFICIENT_SCOPE` | 403 | API Key 為 `read`，無法執行寫入操作 |
| `ENTITY_SCOPE_MISMATCH` | 403 | API Key 綁定其他 Entity |
| `INVALID_ID` | 400 | Path 參數中的 Entity ID 不是合法 UUID |
| `NOT_FOUND` | 404 | 資源不存在 |
| `RATE_LIMITED` | 429 | 超過頻率限制 |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |

## 端點

### Entity

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}` | read |
| PUT | `/api/entities/{id}` | write |
| GET | `/api/entities/{id}/usage` | read |
| GET | `/api/entities/{id}/audit-logs` | read |

### Content

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/contents` | read |
| POST | `/api/entities/{id}/contents` | write |
| GET | `/api/entities/{id}/contents/{contentId}` | read |
| PUT | `/api/entities/{id}/contents/{contentId}` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}` | write |
| PUT | `/api/entities/{id}/contents/{contentId}/draft` | write |
| POST | `/api/entities/{id}/contents/{contentId}/publish` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}/draft` | write |
| GET | `/api/entities/{id}/contents/{contentId}/lock` | read |
| POST | `/api/entities/{id}/contents/{contentId}/lock` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}/lock` | write |
| POST | `/api/entities/{id}/contents/{contentId}/preview` | write |
| GET | `/api/entities/{id}/contents/{contentId}/versions` | read |
| GET | `/api/entities/{id}/contents/{contentId}/versions/{version}` | read |
| POST | `/api/entities/{id}/contents/{contentId}/versions/{version}/restore` | write |

### Directives

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/directives` | read |
| PUT | `/api/entities/{id}/directives` | write |
| PUT | `/api/entities/{id}/directives/evidence` | write |

### Verification

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/verify/status` | read |
| POST | `/api/entities/{id}/verify/dns/init` | write |
| POST | `/api/entities/{id}/verify/dns/check` | write |
| POST | `/api/entities/{id}/verify/email/init` | write |
| POST | `/api/entities/{id}/verify/business-registration/init` | write |

### Output

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/output/aidp` | read |
| GET | `/api/entities/{id}/output/schema-org` | read |
| GET | `/api/entities/{id}/output/llms-txt` | read |
| GET | `/api/entities/{id}/output/og-tags` | read |

### Links

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/links` | read |
| POST | `/api/entities/{id}/links` | write |
| GET | `/api/entities/{id}/links/{linkId}` | read |
| PUT | `/api/entities/{id}/links/{linkId}` | write |
| DELETE | `/api/entities/{id}/links/{linkId}` | write |

### Analytics

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/analytics/overview` | read |
| GET | `/api/entities/{id}/analytics/daily` | read |
| GET | `/api/entities/{id}/analytics/agents` | read |
| GET | `/api/entities/{id}/analytics/content` | read |
| GET | `/api/entities/{id}/analytics/links` | read |
| GET | `/api/entities/{id}/analytics/hourly` | read |
| GET | `/api/entities/{id}/analytics/sources` | read |
| GET | `/api/entities/{id}/analytics/countries` | read |
| GET | `/api/entities/{id}/analytics/performance` | read |
| GET | `/api/entities/{id}/analytics/mcp-tools` | read |
| GET | `/api/entities/{id}/analytics/bot-vs-human` | read |
| GET | `/api/entities/{id}/analytics/visitors` | read |
| GET | `/api/entities/{id}/analytics/referrers` | read |
| GET | `/api/entities/{id}/analytics/link-daily` | read |

### Import / Export

| 方法 | 路徑 | Scope |
|---|---|---|
| GET | `/api/entities/{id}/export` | read |
| POST | `/api/entities/{id}/import` | write |

## 範例

### 取得 Entity AIDP 文件

```bash
curl https://api.speakspec.com/api/entities/{entityId}/output/aidp \
  -H "X-API-Key: aidp_xxxxxxxx"
```

### 建立 Content

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "menu_item",
    "data": {
      "name": "Classic Tonkotsu Ramen",
      "price": "$16"
    }
  }'
```

### read scope 拒絕寫入

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_readonly_key" \
  -H "Content-Type: application/json" \
  -d '{ "type": "menu_item" }'
```

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "This API key has read-only access"
  }
}
```
