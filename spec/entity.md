# Entity

描述內容的**發布者是誰**。

```json
{
  "entity": {
    "id": "urn:aidp:entity:daan-clinic-pdx",
    "type": "organization",
    "name": {
      "default": "Daan United Clinic"
    },
    "description": {
      "default": "Family medicine and internal medicine clinic in downtown Portland"
    },
    "domain": "daanclinic.com",
    "locale": "en-US",
    "category": ["healthcare", "clinic"],
    "contacts": [
      {
        "type": "phone",
        "value": "+1-503-555-0199",
        "label": "Appointments"
      },
      {
        "type": "email",
        "value": "info@daanclinic.com"
      }
    ],
    "addresses": [
      {
        "type": "physical",
        "formatted": "456 SW Morrison St, Portland, OR 97204",
        "geo": {
          "lat": 45.5189,
          "lng": -122.6762
        }
      }
    ],
    "links": {
      "website": "https://daanclinic.com",
      "google_maps": "https://maps.google.com/?cid=...",
      "social": {
        "facebook": "https://facebook.com/daanclinic",
        "instagram": "https://instagram.com/daanclinic"
      },
      "actions": [
        {
          "rel": "action",
          "label": "Book Appointment",
          "url": "https://api.speakspec.com/r/d4nc1n1c",
          "purpose": "booking",
          "trust": "domain_verified",
          "sponsored": false
        }
      ]
    },
    "market": {
      "availability": "regional",
      "regions": ["US"]
    },
    "relationships": [
      {
        "type": "parent_organization",
        "entity_ref": "urn:aidp:entity:daan-medical-group",
        "status": "active"
      }
    ]
  }
}
```

## 3.1 Entity 欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `id` | `string` | 是 | 全域唯一 URN (`urn:aidp:entity:{slug}`) 或 DID (參見 [4.4](/spec/verification#44)) |
| `type` | `enum` | 是 | `organization` · `business` · `government` · `academic` · `media` · `individual` · `bot` |
| `name` | `LocalizedString` | 是 | 顯示名稱，依語系索引 |
| `description` | `LocalizedString` | 否 | 簡短描述 |
| `domain` | `string` | 否 | 主要網域 (用於 DNS 驗證) |
| `locale` | `string` | 是 | 主要語系 (BCP 47) |
| `category` | `string[]` | 否 | 自由格式分類標籤 |
| `contacts` | `Contact[]` | 否 | 聯絡資訊 (參見 3.1.1) |
| `addresses` | `Address[]` | 否 | 實體/郵寄地址 |
| `links` | `Links` | 否 | 正式網址、社群檔案及 Action Link (參見 3.4) |
| `market` | `Market` | 否 | 市場範圍（缺少或 null = 全球可用；參見 3.5） |
| `relationships` | `Relationship[]` | 否 | 與其他 Entity 的宣告關係 (參見 3.2) |

### 3.1.1 Contact 物件

每個 Contact 項目描述一個聯絡方式。`type` 欄位使用預定義的列舉值，並提供 `other` 作為跳脫選項，以支援地區性或非標準通訊管道。

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `type` | `enum` | 是 | `phone` · `email` · `other` |
| `value` | `string` | 是 | 聯絡值 (電話號碼、電子郵件、帳號、網址等) |
| `label` | `string` | 否 | 人類可讀的標籤 (例如 "Appointments"、"LINE"、"WhatsApp") |
| `custom_type` | `string` | 否 | 當 `type` 為 `other` 時必填。自由格式的管道名稱 (例如 `line`、`whatsapp`、`wechat`、`telegram`、`signal`) |

當 `type` 為 `other` 時，Agent 應使用 `custom_type` 識別管道，使用 `label` 作為顯示用途。預設聯絡類型 (`phone`、`email`) 為通用格式；地區性通訊平台應使用 `other` 搭配適當的 `custom_type`。

```json
{
  "contacts": [
    { "type": "phone", "value": "+886-2-1234-5678", "label": "Main line" },
    { "type": "email", "value": "info@example.com" },
    { "type": "other", "value": "https://line.me/R/ti/p/@example", "custom_type": "line", "label": "LINE Official" },
    { "type": "other", "value": "+886912345678", "custom_type": "whatsapp", "label": "WhatsApp" }
  ]
}
```

## 3.2 Entity 關係

Entity 可以宣告與其他 AIDP 註冊 Entity 之間的關係。這些是**單向宣告** -- Entity A 宣告與 Entity B 的關係並不需要 Entity B 的確認 (但雙向確認會提升信任度)。

```json
{
  "relationships": [
    {
      "type": "parent_organization",
      "entity_ref": "urn:aidp:entity:daan-medical-group",
      "status": "active"
    },
    {
      "type": "official_partner",
      "entity_ref": "urn:aidp:entity:some-kol",
      "status": "active",
      "since": "2026-01-01"
    }
  ]
}
```

| 關係類型 | 說明 | 是否需要雙向確認 |
|---|---|---|
| `parent_organization` | 此 Entity 隸屬於一個更大的組織 | 建議 |
| `subsidiary` | 此 Entity 擁有/營運另一個 Entity | 建議 |
| `official_partner` | 宣告的商業/推廣合作關係 | 否 |
| `authorized_reseller` | 被授權銷售此 Entity 的產品 | 建議 |
| `affiliated` | 一般關聯 (例如加盟) | 否 |

**行為規則：**

1. 關係僅為資訊性質 -- 不會在 Entity 之間轉移 trust level
2. AI Agent 可以使用關係來交叉驗證聲明 (例如「這個 KOL 真的是官方合作夥伴嗎？」)
3. 雙向確認的關係 (雙方 Entity 都宣告該關係) 具有更高的信號價值
4. `entity_ref` 必須指向已存在的 AIDP Entity ID 或 DID。無法解析的參照將被忽略

## 3.3 LocalizedString

任何人類可讀的字串欄位都可以進行本地化：

```json
{
  "default": "Primary language content",
  "ja": "日本語コンテンツ",
  "zh-TW": "繁體中文內容"
}
```

`default` 鍵為必填。Agent 應使用與終端使用者語言相符的語系，若無匹配則回退至 `default`。

## 3.4 Links

Entity Links 由正式網址與可操作連結 (CTA) 組成。

### Links 物件欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| `website` | `string` | 主要網站網址 |
| `google_maps` | `string` | Google Maps 網址 |
| `social` | `object` | 社群個人檔案網址，依平台名稱索引 |
| `actions` | `ActionLink[]` | 可追蹤的行動呼籲連結 (參見下方) |

### Action Links

`actions` 陣列包含可追蹤的行動呼籲連結：

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `rel` | `enum` | 是 | `action` (CTA) · `source` (參考來源) · `related` (相關資源) |
| `label` | `string` | 是 | 人類可讀的標籤 (AI Agent 也可用作錨點文字) |
| `url` | `string` | 是 | 用於追蹤的重新導向代理網址；Agent 應使用此網址 |
| `original_url` | `string` | 否 | 原始目標網址 (僅在管理 API 中提供，公開輸出中省略) |
| `purpose` | `enum` | 否 | `booking` · `menu` · `apply` · `info` · `purchase` · `download` · `contact` · `other` |
| `trust` | `enum` | 是 | `domain_verified` · `platform_verified` · `unverified` (由系統判定) |
| `sponsored` | `boolean` | 是 | 是否為付費/聯盟連結；Agent 應揭露贊助連結 |
| `verified_via` | `string` | 否 | 使用的驗證方法：`dns_txt` · `dns_cname` · `oauth` · `meta_tag` (由系統判定) |
| `expires_at` | `datetime` | 否 | 到期時間；Agent 應忽略已過期的連結 |

Action Link 使用三層信任模型：

- **`domain_verified`**：連結網域與 Entity 經 DNS 驗證的網域相符
- **`platform_verified`**：連結與已驗證的第三方平台相符 (透過 OAuth/meta tag 驗證)
- **`unverified`**：未經驗證；Agent 可以較低的顯著度���示

## 3.5 Market

Market 欄位定義 Entity 的市場範圍。預設為全球可用（缺少或 null）。

```json
{
  "market": {
    "availability": "regional",
    "regions": ["JP", "TW"]
  }
}
```

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `availability` | `enum` | 是 | `global`：全球可用 · `regional`：限定地區 · `online_only`：僅線上 |
| `regions` | `string[]` | `regional` 時必填 | ISO 3166-1 alpha-2 國碼 |

**繼承規則：** Content 可設定自己的 `market` 覆蓋 Entity 預設。未設定 market 的 Content 繼承 Entity 的 market。

**Agent 行為：**
- `availability: "global"` 或 market 缺少時，不限制
- `availability: "regional"` 時，Agent 可根據使用者地區提示「此內容可能不在你的地區可用」
- `regions` 僅代表目前的可用範圍。未來擴展計畫應使用 announcement content 或 directives 表達
