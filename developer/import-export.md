# 匯入匯出格式

SpeakSpec 匯入匯出使用 JSON 格式，版本 v1.1。

## 匯出格式

```json
{
  "aidp_export_version": "1.1",
  "exported_at": "2026-04-04T12:00:00Z",
  "entity": {
    "aidp_id": "sakura-ramen-pdx",
    "type": "business",
    "name": { "default": "Sakura Ramen" },
    "description": { "default": "Authentic Japanese ramen in Portland" },
    "market": {
      "availability": "regional",
      "regions": ["US"]
    }
  },
  "contents": [
    {
      "content_id": "tonkotsu-ramen",
      "type": "menu_item",
      "data": {
        "name": "Tonkotsu Ramen",
        "description": "Rich pork bone broth",
        "price": { "currency": "USD", "amount": 16 }
      },
      "tags": ["bestseller", "pork"]
    },
    {
      "content_id": "tonkotsu-ramen-jp",
      "type": "menu_item",
      "variant_of": "tonkotsu-ramen",
      "variant_delta": {
        "price": { "currency": "JPY", "amount": 980 },
        "name": "豚骨ラーメン"
      },
      "market": {
        "availability": "regional",
        "regions": ["JP"]
      },
      "tags": ["bestseller"]
    }
  ],
  "directives": {
    "identity": {},
    "response_rules": {},
    "attribution": {},
    "freshness": {},
    "access_control": {}
  }
}
```

## 欄位說明

### 頂層

| 欄位 | 類型 | 說明 |
|---|---|---|
| `aidp_export_version` | `string` | 格式版本（目前為 `"1.1"`） |
| `exported_at` | `datetime` | 匯出時間 |
| `entity` | `object` | Entity 基本資訊 |
| `contents` | `array` | Content 陣列 |
| `directives` | `object` | Directives 設定 |

### Entity

| 欄位 | 類型 | 說明 |
|---|---|---|
| `aidp_id` | `string` | Entity 的 AIDP ID |
| `type` | `string` | Entity 類型 |
| `name` | `object` | 多語系名稱 |
| `description` | `object` | 多語系描述 |
| `market` | `object` | 市場範圍（v1.1 新增） |

### Content

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `content_id` | `string` | 是 | 內容識別碼 |
| `type` | `string` | 是 | 內容類型 |
| `data` | `object` | 是 | 內容資料 |
| `tags` | `string[]` | 否 | 標籤 |
| `links` | `array` | 否 | 關聯的 Action Links |
| `variant_of` | `string` | 否 | base content 的 content_id（v1.1 新增） |
| `variant_delta` | `object` | variant 時必填 | 與 base 不同的欄位（v1.1 新增） |
| `market` | `object` | 否 | 覆蓋 Entity 的 market（v1.1 新增） |

### Link

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `original_url` | `string` | 是 | 目標網址 |
| `label` | `string` | 否 | 顯示標籤 |
| `rel` | `string` | 是 | 連結關係（`action`、`source`、`related`） |

## 匯入

### 端點

```
POST /entities/:entityId/import?dry_run=true
POST /entities/:entityId/import?dry_run=false
```

### 請求格式

匯入只需要 `contents` 陣列：

```json
{
  "contents": [
    {
      "content_id": "new-item",
      "type": "product",
      "data": { "name": "New Product" },
      "tags": ["new"]
    }
  ]
}
```

### Dry Run

設定 `dry_run=true` 時，系統不會實際寫入，僅回傳預覽結果：

```json
{
  "would_create": { "contents": 3, "links": 1 },
  "warnings": [],
  "errors": []
}
```

### Variant 匯入

包含 `variant_of` 的內容會自動排序處理。base content 必須已存在於系統中或在同一批匯入中：

```json
{
  "contents": [
    {
      "content_id": "product-base",
      "type": "product",
      "data": { "name": "Widget", "price": { "currency": "USD", "amount": 29 } }
    },
    {
      "content_id": "product-base-jp",
      "type": "product",
      "variant_of": "product-base",
      "variant_delta": { "price": { "currency": "JPY", "amount": 4500 } },
      "market": { "availability": "regional", "regions": ["JP"] }
    }
  ]
}
```

## 版本相容性

| 版本 | 新增欄位 | 向下相容 |
|---|---|---|
| v1.0 | 基本 content_id, type, data, tags, links | - |
| v1.1 | variant_of, variant_delta, market (content + entity) | v1.0 格式可正常匯入 |

匯入端點同時接受 v1.0 和 v1.1 格式。缺少的新欄位會被忽略（視為 null）。
