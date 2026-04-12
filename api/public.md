# Public API

供 AI Agent 及外部系統使用的公開端點。不需要認證。

Base URL: `https://api.speakspec.com`

## 端點總覽

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/public/entity/:aidpId` | 公開 AIDP 文件（支援內容協商） |
| GET | `/public/entity/:aidpId/content` | 公開內容查詢（支援篩選） |
| GET | `/public/entity/:aidpId/content/:contentId` | 取得單一內容項目 |
| GET | `/public/entity/:aidpId/history` | Entity 變更歷史 |
| GET | `/public/search` | 全文搜尋 Entity |
| GET | `/.well-known/aidp-directory.json` | Entity 索引（支援分頁與類型篩選） |
| GET | `/r/:hash` | 連結重導向 proxy |
| GET | `/preview/:token` | 預覽草稿內容 |

## GET /public/entity/:aidpId

回傳指定 Entity 的完整 AIDP 文件。

### 內容協商

透過 Accept 標頭指定回傳格式：

| Accept Header | 回傳格式 |
|---|---|
| `application/json`（預設） | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

### AIPREF 標頭

回應會包含由 Entity 的 access_control 指令衍生的 IETF AIPREF 標頭：

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

- 當 `allow_training=false` 時，回傳 `disallow=FoundationModelProduction`
- 當 `allow_derivative=true` 時，回傳 `allow=Search`

### 範例回應

```json
{
  "aidp_version": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:sakura-ramen-pdx",
    "name": "Sakura Ramen",
    "type": "business",
    "description": "Authentic Japanese ramen in Portland"
  },
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "name": "Classic Tonkotsu Ramen",
      "description": "Rich pork bone broth with chashu",
      "attributes": {
        "price": "$16"
      }
    }
  ],
  "access_control": {
    "allow_training": false,
    "allow_search": true,
    "allow_derivative": true
  },
  "verification": {
    "trust_level": "verified_domain"
  }
}
```

## GET /public/entity/:aidpId/content

查詢指定 Entity 的公開內容，支援篩選。

### Query 參數

| 參數 | 說明 |
|---|---|
| `type` | 篩選內容類型（例如 `menu_item`、`faq`） |
| `tags` | 篩選標籤（逗號分隔） |
| `variant_of` | 篩選指定 base content 的所有 variant（例如 `iphone-16`） |

### 範例

```
GET /public/entity/sakura-ramen-pdx/content?type=menu_item
```

```json
{
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "content_id": "menu-tonkotsu",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth with chashu",
        "price": "$16"
      }
    }
  ]
}
```

## GET /public/entity/:aidpId/content/:contentId

取得指定 Entity 的單一內容項目。

### 範例

```
GET /public/entity/sakura-ramen-pdx/content/menu-tonkotsu
```

```json
{
  "id": "menu-tonkotsu",
  "type": "menu_item",
  "content_id": "menu-tonkotsu",
  "data": {
    "name": "Classic Tonkotsu Ramen",
    "description": "Rich pork bone broth with chashu",
    "price": "$16"
  },
  "status": "published"
}
```

## GET /public/entity/:aidpId/history

取得 Entity 的公開變更歷史，支援分頁。

### Query 參數

| 參數 | 說明 |
|---|---|
| `page` | 頁碼（預設 1） |
| `per_page` | 每頁筆數（預設 20，最大 100） |
| `content_id` | 篩選特定內容的變更歷史 |

### 範例

```
GET /public/entity/sakura-ramen-pdx/history?per_page=5
```

```json
{
  "history": [
    {
      "action": "content.published",
      "content_id": "menu-tonkotsu",
      "created_at": "2026-03-20T08:00:00Z"
    },
    {
      "action": "entity.updated",
      "created_at": "2026-03-18T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "per_page": 5
}
```

## GET /public/search

全文搜尋已發佈的 Entity。

### Query 參數

| 參數 | 說明 |
|---|---|
| `q` | 搜尋關鍵字（必填） |
| `page` | 頁碼（預設 1） |
| `per_page` | 每頁筆數（預設 20，最大 100） |

### 範例

```
GET /public/search?q=ramen&per_page=5
```

```json
{
  "entities": [
    {
      "aidp_id": "sakura-ramen-pdx",
      "name": {"default": "Sakura Ramen"},
      "type": "business",
      "trust_level": "verified_domain"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 5
}
```

## GET /.well-known/aidp-directory.json

回傳平台上所有已發佈 Entity 的索引，支援分頁和類型篩選。

此端點遵循 `.well-known` URI 規範，供 AI Agent 自動探索使用。

### Query 參數

| 參數 | 說明 |
|---|---|
| `type` | 篩選 Entity 類型（例如 `business`） |
| `page` | 頁碼（預設 1） |
| `per_page` | 每頁筆數（預設 50，最大 100） |

### 範例回應

```json
{
  "entities": [
    {
      "aidp_id": "sakura-ramen-pdx",
      "name": {"default": "Sakura Ramen"},
      "type": "business",
      "category": ["restaurant", "japanese"],
      "domain": "sakura-ramen.com",
      "trust_level": "verified_domain"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 50
}
```

## GET /r/:hash

連結重導向 proxy。當使用者點擊 AIDP 文件中的追蹤連結時，會透過此端點重導向至原始 URL，同時記錄點擊事件。

重導向時會自動在目標 URL 附加 `aidp_ref`（連結 hash）和 `aidp_eid`（Entity AIDP ID）查詢參數。

回傳 HTTP 302 重導向，或 404 若連結不存在。

## GET /preview/:token

透過 preview token 預覽草稿內容。Token 由平台管理介面產生，有時效性。

### 範例回應

```json
{
  "entity_id": "sakura-ramen-pdx",
  "content": {
    "id": "menu-new-item",
    "type": "menu_item",
    "data": {
      "name": "New Special Ramen",
      "description": "Limited edition"
    },
    "status": "draft",
    "draft": true
  }
}
```
