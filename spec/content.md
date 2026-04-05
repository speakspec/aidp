# Content

`content` 陣列儲存實際的結構化資料項目。

```json
{
  "content": [
    {
      "id": "svc-general-medicine",
      "type": "service",
      "schema": "aidp:service",
      "locale": "en-US",
      "data": {
        "name": "General Internal Medicine",
        "description": "General internal medicine services including cold/flu treatment, chronic disease management, and health checkups",
        "availability": {
          "schedule": [
            { "day": "mon", "hours": "09:00-12:00" },
            { "day": "mon", "hours": "14:00-17:00" },
            { "day": "tue", "hours": "09:00-12:00" }
          ],
          "exceptions": [
            { "date": "2026-07-04", "status": "closed", "reason": "Independence Day" }
          ]
        },
        "pricing": {
          "currency": "USD",
          "base": 30,
          "note": "Co-pay $30 with insurance"
        },
        "requirements": ["Appointments required by phone or online", "Please bring your insurance card"]
      },
      "directives": {
        "must_include": ["Reservations required"],
        "freshness": "2026-03-15T00:00:00Z"
      },
      "tags": ["healthcare", "general-medicine"],
      "updated_at": "2026-03-15T10:30:00Z"
    }
  ]
}
```

## Content 欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `id` | `string` | 是 | 在此 Entity 內唯一 |
| `type` | `string` | 是 | 語意類型：`service`、`product`、`article`、`faq`、`event`、`person`、`menu_item`、`policy`、`announcement`、`dataset`，或自訂類型 |
| `schema` | `string` | 否 | Schema 參考（內建使用 `aidp:{type}`，或自訂 URI） |
| `locale` | `string` | 否 | 覆寫此 content 項目的 Entity locale |
| `data` | `object` | 是 | 實際的內容酬載（依 schema 而定） |
| `directives` | `ContentDirectives` | 否 | Content 層級的 directives（覆寫全域設定） |
| `tags` | `string[]` | 否 | 可搜尋的標籤 |
| `updated_at` | `datetime` | 是 | 最後內容修改時間 |
| `expires_at` | `datetime` | 否 | 內容到期時間（Agent 應在到期後忽略） |
| `provenance` | `Provenance \| null` | 否 | 保留供 C2PA 整合使用（見 [Verification](/spec/verification)） |
| `variant_of` | `string` | 否 | 指向 base content 的 `id`（見 Content Variants） |
| `variant_delta` | `object` | variant 時必填 | 與 base 不同的欄位（見 Content Variants） |
| `market` | `Market` | 否 | 覆蓋 Entity 的 market 設定（見 [Entity 3.5](/spec/entity#_3-5-market)） |
| `media_refs` | `string[]` | 否 | 相關 `aidp:media` content 項目的 ID（見下方 Media Schema） |

Content `data` 物件可以包含一個 `links` 陣列，遵循 [Entity](/spec/entity) 中定義的 Action Links schema。這些連結的範圍限定於特定 content 項目，並獨立追蹤。

## Content Types（內建 Schemas）

協議定義了常用的 schemas。提供者也可以定義自訂 schemas。

| Schema | 關鍵欄位 | 使用情境 |
|---|---|---|
| `aidp:service` | name, description, availability, pricing, requirements | 服務項目 |
| `aidp:product` | name, description, price, variants, inventory_status | 電商 / 零售 |
| `aidp:article` | title, body, author, published_at, summary | 部落格 / 新聞 / 知識庫 |
| `aidp:faq` | question, answer | 問答配對 |
| `aidp:event` | title, start, end, location, registration_url | 活動 / 事件 |
| `aidp:menu_item` | name, description, price, allergens, available | 餐廳 / 餐飲 |
| `aidp:person` | name, role, bio, expertise | 團隊 / 人員檔案 |
| `aidp:policy` | title, body, effective_date | 條款、隱私權、政策 |
| `aidp:announcement` | title, body, priority, valid_until | 限時公告 |
| `aidp:dataset` | name, description, format, access_url | 資料目錄項目 |
| `aidp:media` | media_type, purpose, url, alt, format, dimensions | 圖片、影片、文件（見下方 Media Schema） |

自訂 schemas 使用 URI 格式：`https://example.com/schemas/my-type`

## 語言哲學

Content 可以使用任何語言或混合語言撰寫。AI Agent 具備跨語言理解能力，能正確處理任何語言的內容並以使用者的語言回覆。若某個詞彙有特定語言的專有用法，直接使用該語言書寫即可。

`entity.locale` 和 `content.locale` 僅作為語言脈絡提示，不構成強制限制。LocalizedString（如 `entity.name` 的多語系 map）為 optional convenience，不是必要條件。

## Content Variants

Content 可透過 `variant_of` 建立差異式變體，適用於同一內容在不同地區有不同規格的場景。

### 結構

```json
{
  "id": "iphone-16-jp",
  "type": "product",
  "variant_of": "iphone-16",
  "market": { "availability": "regional", "regions": ["JP"] },
  "variant_delta": {
    "price": { "currency": "JPY", "amount": 149800 },
    "voltage": "100V",
    "certifications": ["PSE", "TELEC"]
  }
}
```

### 合併規則

`final = { ...base.data, ...variant.variant_delta }`

- `variant_delta` 中的 key 覆蓋 base
- 值為 `null` 表示刪除 base 的該欄位
- base 不存在的 key 直接新增
- `variant_delta` 儲存完整值，不使用 diff patch

### 規則

1. `variant_of` 指向 base content 的 `id`
2. 若 `variant_of` 非空，`variant_delta` 必填
3. 不允許鏈式 variant（variant 的 variant）
4. variant 的 `type` 必須與 base 相同

### Agent 行為

1. Agent 取得 variant 時必須先取得 base content 並合併
2. 若 base 被刪除，variant 的 `variant_delta` 仍為有效完整資料（Agent 應 fallback 只用 delta）
3. 若使用者所在地區有對應 variant，優先使用 variant；否則使用 base

## Media Schema (`aidp:media`)

Media content 儲存的是**中繼資料與 URL**，而非檔案資料本身。AIDP 是一個協議，不是檔案代管服務。

### Media Types

| `media_type` | 格式 | AI 行為 |
|---|---|---|
| `image` | webp, png, jpg, svg | Agent 可以在回應中內嵌顯示 |
| `video` | youtube, vimeo, mp4 url | Agent 可以依平台支援程度提供連結或嵌入 |
| `document` | pdf, docx | Agent 可以解析內容以取得資訊，或提供下載連結 |

### Purpose Types

`purpose` 欄位告訴 AI Agent **何時**使用此媒體：

| `purpose` | 何時顯示 | 範例 |
|---|---|---|
| `logo` | 提及品牌/Entity 時 | 公司標誌 |
| `storefront` | 回答地點/外觀相關問題時 | 店面外觀照片 |
| `product` | 討論特定商品時（透過 `media_refs` 連結） | 產品照片 |
| `menu` | 討論餐飲/服務選項時 | 完整菜單掃描 |
| `document` | 需要詳細參考資料時 | 價格表 PDF |
| `certificate` | 驗證資格/認證時 | 營業執照 |
| `video_intro` | 對 Entity 進行概述時 | 介紹影片 |
| `gallery` | 一般視覺情境 | 室內照片 |

### Image 範例

```json
{
  "id": "photo-storefront",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "image",
    "purpose": "storefront",
    "url": "https://cdn.sakuraramen.com/storefront.webp",
    "alt": {
      "default": "Sakura Ramen storefront exterior"
    },
    "format": "webp",
    "width": 1200,
    "height": 800,
    "size_bytes": 245000,
    "thumbnails": {
      "sm": "https://cdn.sakuraramen.com/storefront-300.webp",
      "md": "https://cdn.sakuraramen.com/storefront-600.webp"
    }
  },
  "directives": {
    "display_rules": {
      "prefer_context": ["location_query", "entity_overview"],
      "never_display_with": ["competitor_comparison"],
      "must_preserve_aspect_ratio": true
    },
    "licensing": {
      "type": "proprietary",
      "attribution_required": true,
      "modification_allowed": false,
      "ai_training_allowed": false
    }
  },
  "updated_at": "2026-03-01T00:00:00Z"
}
```

### Document (PDF) 範例

Document 有一個特殊的 `behavior` 欄位：

```json
{
  "id": "doc-pricelist-2026",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "document",
    "purpose": "document",
    "url": "https://cdn.daanclinic.com/pricelist-2026.pdf",
    "format": "pdf",
    "behavior": "parseable",
    "summary": {
      "default": "2026 complete out-of-pocket pricing list"
    },
    "page_count": 3,
    "language": "en-US",
    "size_bytes": 520000
  },
  "updated_at": "2026-03-10T00:00:00Z"
}
```

| `behavior` | 說明 |
|---|---|
| `parseable` | Agent 應讀取/解析文件內容以回答問題，但不顯示原始文件 |
| `renderable` | Agent 可以直接向使用者顯示文件（例如菜單圖片、證書） |
| `link_only` | Agent 應僅提供下載連結，不解析或顯示 |

### Video 範例

```json
{
  "id": "video-intro",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "video",
    "purpose": "video_intro",
    "url": "https://youtube.com/watch?v=xxx",
    "platform": "youtube",
    "duration_seconds": 120,
    "summary": {
      "default": "Sakura Ramen behind-the-scenes documentary"
    },
    "thumbnail_url": "https://img.youtube.com/vi/xxx/hqdefault.jpg",
    "language": "en-US",
    "has_subtitles": ["en", "ja", "zh-TW"]
  },
  "updated_at": "2026-02-15T00:00:00Z"
}
```

### Content-Media 連結

Content 項目透過 `media_refs` 欄位參考 media：

```json
{
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "price": { "currency": "USD", "amount": 16.50 }
      },
      "media_refs": ["photo-tonkotsu", "video-intro"]
    },
    {
      "id": "photo-tonkotsu",
      "type": "media",
      "schema": "aidp:media",
      "data": {
        "media_type": "image",
        "purpose": "product",
        "url": "https://cdn.sakuraramen.com/tonkotsu.webp",
        "alt": { "default": "Classic Tonkotsu Ramen" },
        "format": "webp",
        "width": 800,
        "height": 600
      },
      "updated_at": "2026-03-10T00:00:00Z"
    }
  ]
}
```

**連結規則：**

1. `media_refs` 包含同一 Entity 內 `aidp:media` content 項目的 ID
2. 單一 media 項目可以被多個 content 項目參考
3. 當 Agent 回應關於特定 content 項目的問題時，應優先使用透過 `media_refs` 連結的 media，而非未連結的 media
4. `media_refs` 的順序代表顯示優先順序（第一個 = 最相關）

### Media Directives

Media 項目除了支援標準 content directives 外，還支援專用的 directives：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `display_rules.prefer_context` | `string[]` | 應顯示此 media 的情境：`brand_mention`、`entity_overview`、`location_query`、`product_query`、`faq_response` |
| `display_rules.never_display_with` | `string[]` | 應避免的情境：`competitor_comparison`、`negative_review`、`unrelated_topic` |
| `display_rules.must_preserve_aspect_ratio` | `boolean` | Agent 不得裁切或拉伸 |
| `display_rules.min_display_size` | `string` | 最小顯示尺寸（例如 `"64px"`） |
| `licensing.type` | `enum` | `proprietary`、`cc-by`、`cc-by-sa`、`cc-by-nc`、`cc0`、`custom` |
| `licensing.attribution_required` | `boolean` | 是否需要來源標註 |
| `licensing.modification_allowed` | `boolean` | AI 是否可以裁切、濾鏡或修改 |
| `licensing.ai_training_allowed` | `boolean` | AI 提供者是否可用於模型訓練 |
