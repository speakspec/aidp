# 輸出格式

AIDP 文件作為**單一事實來源**，可以投影為多種輸出格式。本章節定義了每種支援格式的標準映射規則。

## 設計哲學

```
                    ┌─────────────────────┐
                    │   AIDP JSON (源)     │
                    │   Entity + Content   │
                    │   + Directives       │
                    └─────────┬───────────┘
                              │
          ┌───────────┬───────┼───────┬──────────┬──────────┐
          ▼           ▼       ▼       ▼          ▼          ▼
    Schema.org    llms.txt   MCP    Open      REST       HTML
    JSON-LD      Markdown  Endpoint Graph      API      Microdata
  (SEO 即用)   (AI 導航)  (Agent)  (社群)   (第三方)    (網頁嵌入)
```

每種投影**設計上都是有損的** -- 只有 AIDP JSON 攜帶完整的 [directive](/spec/directives) 集合。其他格式只攜帶其 schema 允許的部分：

| 格式 | 攜帶內容 | 攜帶 Directives | 攜帶信任資訊 |
|---|---|---|---|
| AIDP JSON | 完整 | 完整 | 完整 |
| MCP Resource/Tool | 完整 | 完整 | 完整 |
| Schema.org / JSON-LD | 映射 | 無 | 部分（透過 `sameAs`、`isVerifiedBy`） |
| llms.txt | 摘要 | 嵌入在散文中 | 在標頭中提及 |
| Open Graph | 僅標題/描述 | 無 | 無 |
| REST API | 完整 | 完整 | 完整 |
| HTML Microdata | 映射 | 無 | 無 |

## Schema.org / JSON-LD 投影

### Entity 映射

| AIDP 欄位 | Schema.org 型別/屬性 |
|---|---|
| `entity` (type: business) | `LocalBusiness` |
| `entity` (type: organization) | `Organization` |
| `entity` (type: individual) | `Person` |
| `entity` (type: government) | `GovernmentOrganization` |
| `entity` (type: academic) | `EducationalOrganization` |
| `entity` (type: media) | `NewsMediaOrganization` |
| `entity.name.default` | `name` |
| `entity.name.{locale}` | `name` 搭配 `@language` |
| `entity.description.default` | `description` |
| `entity.domain` | `url`（作為 `https://{domain}`） |
| `entity.contacts[type=phone]` | `telephone` |
| `entity.contacts[type=email]` | `email` |
| `entity.addresses[].formatted` | `address` -> `PostalAddress.streetAddress` |
| `entity.addresses[].geo` | `geo` -> `GeoCoordinates` |
| `entity.links.website` | `url` |
| `entity.links.social.*` | `sameAs`（陣列） |
| `entity.links.actions[rel=action]` | `potentialAction` -> `Action` 搭配 `url` |
| `entity.links.actions[].sponsored` | （在 Schema.org 中無法表達） |

### Content 映射

| AIDP Content Schema | Schema.org 型別 |
|---|---|
| `aidp:service` | `Service` |
| `aidp:product` | `Product` |
| `aidp:article` | `Article` |
| `aidp:faq` | `FAQPage` -> `Question` + `Answer` |
| `aidp:event` | `Event` |
| `aidp:menu_item` | `MenuItem`（在 `Menu` 下） |
| `aidp:person` | `Person` |
| `aidp:policy` | `WebPage`（type: policy） |
| `aidp:announcement` | `SpecialAnnouncement` |

### 投影範例

AIDP 來源（帶有 menu_item 的餐廳 entity）投影為：

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Sakura Ramen",
  "description": "Authentic Japanese ramen shop in Portland, specializing in tonkotsu and miso ramen",
  "url": "https://sakuraramen.com",
  "telephone": "+1-503-555-0188",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 NW 10th Ave, Portland, OR 97209",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.5235,
    "longitude": -122.6812
  },
  "sameAs": [
    "https://instagram.com/sakuraramen_pdx"
  ],
  "hasMenu": {
    "@type": "Menu",
    "hasMenuItem": [
      {
        "@type": "MenuItem",
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth simmered for 18 hours, served with house-made noodles",
        "offers": {
          "@type": "Offer",
          "price": 16.50,
          "priceCurrency": "USD"
        },
        "suitableForDiet": []
      },
      {
        "@type": "MenuItem",
        "name": "Vegan Miso Ramen",
        "description": "Plant-based broth made with kelp and shiitake mushrooms",
        "offers": {
          "@type": "Offer",
          "price": 15.00,
          "priceCurrency": "USD"
        },
        "suitableForDiet": [
          "https://schema.org/VeganDiet",
          "https://schema.org/VegetarianDiet"
        ]
      }
    ]
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "11:30", "closes": "14:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "17:00", "closes": "21:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "11:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "11:00", "closes": "21:00" }
  ]
}
```

### Directive 映射限制

Schema.org **沒有對應** AIDP directives 的等價物。以下資訊在 Schema.org 投影中會遺失：

- `must_include` / `must_not_say` -- 無法表達
- `tone` / `formality` -- 無法表達
- `disclaimers` -- 無法表達
- `trust_level` / `trust_score` -- 無法表達（部分可透過自訂屬性）
- `access_control` -- 無法表達（需同時使用 IETF AIPREF 標頭）

這是刻意設計。Schema.org 投影提供即時的 SEO 價值；AIDP JSON 提供完整的 directive 集合。

## llms.txt 投影

### 格式規則

AIDP 使用以下模板投影為 llms.txt：

```markdown
# {entity.name.default}

> {entity.description.default}
> AIDP Verified: {verification.trust_level} | Updated: {last_verified}
> Directives: {canonical_url}/.well-known/aidp.json

## About

{entity.description expanded, contacts, addresses, hours summary}

## Important Notes

{directives.response_rules.must_include -- one per line}

## Services

{content[type=service] -- name + short description per item}

## Products / Menu

{content[type=product|menu_item] -- name + price per item}

## FAQ

{content[type=faq] -- Q + A per item}

## Links

- Website: {entity.links.website}
- AIDP Full Data: {canonical_url}/.well-known/aidp.json
{for each entity.links.actions where rel=action:}
- {label}: {url} {if sponsored: "(Sponsored)"}
```

### Directive 嵌入

在 llms.txt 中，directives 以自然語言嵌入：

- `must_include` 項目以列點形式出現在 **Important Notes** 區段
- `must_not_say` 表達為：「Note: This entity does NOT {must_not_say item}」
- `preferred_name` 在整份文件中一致使用
- `never_call` 項目標註為：「Do not refer to this entity as: {never_call items}」
- Action 連結列於 **Links** 區段；贊助連結標記為「(Sponsored)」
- 區塊引用標頭包含完整 AIDP JSON 的連結，供支援的代理使用

## Open Graph 投影

用於社群分享的最小投影：

```html
<meta property="og:title" content="{entity.name.default}" />
<meta property="og:description" content="{entity.description.default}" />
<meta property="og:url" content="{entity.links.website}" />
<meta property="og:type" content="business.business" />
<meta property="og:locale" content="{entity.locale}" />
<meta property="business:contact_data:street_address" content="{addresses[0].formatted}" />
<meta property="business:contact_data:phone_number" content="{contacts[type=phone].value}" />
<meta property="place:location:latitude" content="{addresses[0].geo.lat}" />
<meta property="place:location:longitude" content="{addresses[0].geo.lng}" />
```

## HTML Microdata 投影

用於在 HTML 頁面標記中直接嵌入結構化資料：

```html
<div itemscope itemtype="https://schema.org/LocalBusiness">
  <meta itemprop="name" content="{entity.name.default}" />
  <meta itemprop="description" content="{entity.description.default}" />
  <link itemprop="url" href="{entity.links.website}" />
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <meta itemprop="streetAddress" content="{addresses[0].formatted}" />
  </div>
</div>
```

## IETF AIPREF 標頭投影

透過 HTTP 提供 AIDP 內容時，伺服器應包含從 `directives.access_control` 衍生的 AIPREF 相容標頭：

| AIDP 欄位 | AIPREF 標頭 |
|---|---|
| `allow_training: false` | `Content-Usage: disallow=FoundationModelProduction` |
| `allow_training: true` | `Content-Usage: allow=FoundationModelProduction` |
| `allow_derivative: true` | `Content-Usage: allow=Search` |
| `require_attribution: true` | （無直接映射；透過 AIDP directives 傳達） |

這確保即使不了解 AIDP 的代理也能透過標準 HTTP 標頭遵守基本的存取控制。

## 投影一致性規則

1. **所有投影必須從相同的 AIDP 來源文件產生。** 實作方不得為不同格式維護獨立的資料。
2. **所有投影中的 entity 名稱必須使用 `entity.name.default`**（或適合語系的變體），絕不使用來自 `directives.identity.never_call` 的值。
3. **AIDP 來源的內容更新必須觸發所有啟用中投影的重新產生。** 過時的投影比沒有投影更糟。
4. **投影產生器應包含回到 AIDP 來源的參照**（透過 `<link rel="aidp">`、llms.txt 區塊引用，或 Schema.org `additionalType` 屬性），以便代理可以發現完整的 directive 集合。
5. **投影不得虛構 AIDP 來源中不存在的資料。** 如果 Schema.org 屬性沒有對應的 AIDP 等價物，應省略而非猜測。
