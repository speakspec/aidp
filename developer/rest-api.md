# REST API 串接

第三方開發者可透過 SpeakSpec 的 HTTP API 存取 AIDP 資料。所有端點皆以 `/api/` 或 `/public/` 為前綴，**不需要再加 `/v1`**，伺服器會自動處理版本相容。

Base URL: `https://api.speakspec.com`

## 端點分類

| 分類 | 路徑前綴 | 認證 |
|---|---|---|
| Public API | `/public/` | 不需要 |
| Authenticated API | `/api/` | API Key |

## 公開端點

公開端點不需要認證，任何人都可以存取。

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/public/entity/{aidpId}` | 取得 Entity 的完整 AIDP 文件 |
| GET | `/public/entity/{aidpId}/content` | 查詢 Entity 的公開內容 |
| GET | `/.well-known/aidp-directory.json` | 所有已驗證 Entity 的索引 |

### 取得 AIDP 文件

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx
```

透過 Accept header 指定回傳格式：

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx \
  -H "Accept: application/ld+json"
```

| Accept Header | 回傳格式 |
|---|---|
| `application/json`（預設） | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

### 查詢內容

支援按類型和標籤篩選：

```bash
curl "https://api.speakspec.com/public/entity/sakura-ramen-pdx/content?type=menu_item"
```

| 參數 | 說明 |
|---|---|
| `type` | 篩選內容類型（service, product, menu_item, faq 等） |
| `tags` | 篩選標籤（逗號分隔） |
| `variant_of` | 篩選指定 base content 的所有 variant |

### 探索所有 Entity

```bash
curl https://api.speakspec.com/.well-known/aidp-directory.json
```

回傳平台上所有已驗證 Entity 的列表，供 AI Agent 自動探索使用。

### AIPREF 標頭

公開端點的回應會自動包含 IETF AIPREF 標頭，告知 AI Agent 內容使用權限：

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

## 認證端點

`/api/` 開頭的端點用於管理 Entity、Content、Directives 等資源，需要認證。

### 認證方式

於 HTTP 標頭加入 API Key：

```
X-API-Key: aidp_xxxxxxxx
```

API Key 須在 SpeakSpec 管理後台建立，每組 API Key **僅綁定一個 Entity**，並擁有 `read` 或 `write` Scope。

### 取得 Entity 內容

```bash
curl https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx"
```

### 寫入操作（write scope）

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "menu_item",
    "data": { "name": "Classic Tonkotsu Ramen", "price": "$16" }
  }'
```

完整端點清單、Scope 規則、錯誤碼請見：[Authenticated API 參考](/api/authenticated)。

## Member 邀請端點

邀請端點以使用者 JWT 認證（不接受 API Key）。

### 取消邀請

`DELETE /api/v1/entities/:id/members/invitations/:inv_id`

僅 admin / owner 可呼叫。把指定的 pending 邀請狀態改為 `expired`。回應 `204 No Content`。

### 邀請預覽（公開）

`GET /api/v1/invitations/:token/preview`

不需認證。供未登入訪客判斷邀請是否有效以及對應 email 是否已註冊，據此導向 login 或 register。

回應：

```json
{
  "email": "alice@example.com",
  "entity_aidp_id": "urn:aidp:entity:bob-corp",
  "entity_name": "urn:aidp:entity:bob-corp",
  "role": "editor",
  "exists": true,
  "expired": false
}
```

### 列出我收到的邀請

`GET /api/v1/me/invitations`

回傳當前使用者 email 對應、`status=pending` 且未過期的邀請清單，含邀請者顯示名稱與 entity 資訊，供 dashboard 顯示。

### 拒絕邀請

`POST /api/v1/me/invitations/:token/decline`

把邀請狀態改為 `expired`。Server 端會檢查 `invitation.email` 必須等於當前使用者 email；不符回 `INVITE_EMAIL_MISMATCH`。

### 接受邀請

`POST /api/v1/invitations/:token/accept`

需登入。Email 必須匹配；接受後若使用者有處於 14 天 cooldown 的 dissolved entity，會被 hard-delete 並一併清除對應的 `aidp_id` / `domain` cooldown。回應：

```json
{
  "member": { "id": "...", "entity_id": "...", "role": "editor", "joined_at": "..." },
  "dissolved_purged": { "aidp_id": "urn:aidp:entity:alice-shop" }
}
```

`dissolved_purged` 僅在實際清除時出現。

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

常見錯誤碼：

| 錯誤碼 | HTTP | 說明 |
|---|---|---|
| `NOT_FOUND` | 404 | 資源不存在 |
| `RATE_LIMITED` | 429 | 超過頻率限制 |
| `INVALID_API_KEY` | 401 | API Key 格式錯誤或不存在 |
| `API_KEY_EXPIRED` | 401 | API Key 已過期 |
| `INSUFFICIENT_SCOPE` | 403 | API Key 無寫入權限 |
| `ENTITY_SCOPE_MISMATCH` | 403 | API Key 綁定其他 Entity |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |

完整錯誤碼清單見 [Authenticated API 參考](/api/authenticated#錯誤碼)。

## 完整 API 文件

- [Public API](/api/public) — 公開端點完整參考
- [Authenticated API](/api/authenticated) — 認證端點完整參考
- [MCP API](/api/mcp) — MCP JSON-RPC 端點
