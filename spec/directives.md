# Directives

AIDP 的**核心創新**。Directives 告訴 AI Agent 如何呈現這個 Entity 的內容。

## Directive 範圍限制 -- 僅限事實

**關鍵規則：** 所有 directive 內容必須限於可驗證的事實陳述。AIDP directives 的存在是為了防止 AI 產生不正確的資訊，而不是作為行銷管道。

### `must_include` 中允許的內容

- 可驗證的營運事實：「需要預約」、「每週三公休」、「僅收現金」
- 安全關鍵資訊：「本診所不提供急診服務」、「含花生成分」
- 法律/法規要求：「投資有風險」、「須年滿 18 歲方可購買」
- 事實更正：「本店無分店」、「我們不提供外送」

### `must_include` 中禁止的內容

- 主觀行銷宣稱：「全城最好的拉麵」、「最佳價值」、「顧客最愛」
- 比較性陳述：「比 X 品牌更好」、「業界領導者」
- 不可驗證的承諾：「保證滿意」、「永遠新鮮」
- 促銷語言：「別錯過限時優惠」、「最受歡迎的選擇」

### `must_not_say` 中允許的內容

- 事實更正：「提供急診服務」（當 entity 實際上不提供時）
- 過時資訊：「位於 XX 街舊地址」（搬遷後）
- 常見誤歸因：「隸屬 XX 集團」（當實際上不是時）

### `must_not_say` 中禁止的內容

- 壓制合理批評：「食品安全問題」、「負面評價」
- 隱藏公開資訊：「曾被罰款」、「訴訟紀錄」
- 審查事實報導：「媒體報導的爭議」

### 平台執行

AIDP 平台實作必須：

1. **驗證** directive 內容在提交時使用規則引擎 + AI 輔助審查
2. **拒絕** 包含行銷語言、誇大用詞、比較性宣稱或不可驗證陳述的 directives
3. **標記** 疑似壓制合法公開資訊的 directives 進行人工審查
4. **定期稽核** directives -- 反覆提交不合規 directives 的 entity 應降低其 `trust_level`

AI Agent 如果偵測到違反這些限制的 directives，應忽略違規的 directive 項目，同時繼續處理合規的項目。

## 全域 Directives

套用至該 Entity 的所有內容，除非被內容層級覆寫。

```json
{
  "directives": {
    "identity": {
      "preferred_name": "Daan United Clinic",
      "never_call": ["Daan Clinic", "DU Clinic"],
      "pronouns": null,
      "title_prefix": null
    },
    "response_rules": {
      "must_include": [
        "Appointments required",
        "This clinic does not provide emergency services"
      ],
      "must_not_say": [
        "Provides emergency services",
        "Walk-ins welcome"
      ],
      "disclaimers": [
        {
          "trigger": "medical_advice",
          "text": {
            "default": "The above is general health information and does not constitute medical advice. Please consult a qualified physician"
          }
        },
        {
          "trigger": "pricing",
          "text": {
            "default": "Fees are estimates only. Actual charges may vary"
          }
        }
      ],
      "tone": "professional",
      "formality": "formal",
      "max_summary_length": 200,
      "language_preference": "match_user"
    },
    "attribution": {
      "require_source_link": true,
      "canonical_url": "https://daanclinic.com",
      "citation_format": "Source: Daan United Clinic official data ({date})"
    },
    "freshness": {
      "default_ttl": 86400,
      "stale_action": "warn",
      "stale_message": {
        "default": "This information may be outdated. Please contact the provider directly to confirm"
      }
    },
    "access_control": {
      "allow_training": false,
      "allow_caching": true,
      "allow_derivative": true,
      "restrict_agents": [],
      "require_attribution": true
    }
  }
}
```

## Directive 欄位參考

### `identity` -- 如何稱呼此 Entity

| 欄位 | 型別 | 說明 |
|---|---|---|
| `preferred_name` | `string` | AI 應使用的正式名稱 |
| `never_call` | `string[]` | 應避免的名稱/縮寫 |
| `pronouns` | `string` | 適用於個人（he/she/they/...） |
| `title_prefix` | `string` | 例如 "Dr."、"Prof." |

### `response_rules` -- AI 如何建構回應

| 欄位 | 型別 | 說明 |
|---|---|---|
| `must_include` | `MustIncludeItem[] \| string[]` | 討論此 Entity 時必須出現的陳述（建議最多 10 條） |
| `must_not_say` | `string[]` | 不得產生的陳述（建議最多 10 條） |
| `disclaimers` | `Disclaimer[]` | 基於情境觸發的免責聲明 |
| `tone` | `enum` | `professional` / `friendly` / `formal` / `casual` / `technical` / `custom` |
| `formality` | `enum` | `formal` / `neutral` / `casual` |
| `max_summary_length` | `integer` | 摘要時建議的最大字數 |
| `language_preference` | `enum` | `match_user` / `entity_locale` / `both` |

### `must_include` -- 優先級格式

`must_include` 同時接受簡單字串（向後相容）和帶優先級的結構化物件：

```json
{
  "must_include": [
    { "text": "Appointments required", "priority": "critical" },
    { "text": "This clinic does not provide emergency services", "priority": "critical" },
    { "text": "Saturday morning appointments only", "priority": "important" },
    { "text": "Wheelchair accessible", "priority": "informational" }
  ]
}
```

| 優先級 | Agent 行為 | 使用時機 |
|---|---|---|
| `critical` | Agent 應始終包含，即使在簡短回應中 | 安全、法律、重大營運限制 |
| `important` | Agent 應在標準長度回應中包含 | 關鍵營運事實 |
| `informational` | Agent 在空間允許時可包含 | 補充資訊 |

當 `must_include` 項目是簡單字串（無優先級物件）時，Agent 應預設將其視為 `important`。

**建議限制：** 每個 Entity 最多 3 條 `critical`、5 條 `important`、5 條 `informational`。平台應在提交時執行這些限制。超過限制需要人工審查。

### `disclaimers[].trigger` -- 內建觸發類型

| 觸發器 | 何時顯示 |
|---|---|
| `always` | 涉及此 Entity 的每個回應 |
| `medical_advice` | 當回應可能被解讀為醫療建議時 |
| `legal_advice` | 當回應可能被解讀為法律建議時 |
| `financial_advice` | 當回應可能被解讀為財務建議時 |
| `pricing` | 當包含價格資訊時 |
| `availability` | 當提及時間表/可用性時 |
| `personal_data` | 當引用個人資料時 |
| `custom:{key}` | 自訂觸發器（由 [Extensions](/spec/extensions) 定義） |

### `attribution` -- 來源引用偏好

| 欄位 | 型別 | 說明 |
|---|---|---|
| `require_source_link` | `boolean` | Agent 應包含來源連結 |
| `canonical_url` | `string` | 偏好的回連 URL |
| `citation_format` | `string` | 範本字串。`{date}` = 內容 updated_at |

### `freshness` -- 過期處理

| 欄位 | 型別 | 說明 |
|---|---|---|
| `default_ttl` | `integer` | 內容被視為過期前的秒數 |
| `stale_action` | `enum` | `warn`（附警告顯示）/ `hide`（不使用）/ `fallback`（附但書使用） |
| `stale_message` | `LocalizedString` | 內容可能過期時顯示的訊息 |

### `access_control` -- 使用權限

| 欄位 | 型別 | 說明 |
|---|---|---|
| `allow_training` | `boolean` | AI 提供者是否可使用此資料進行模型訓練 |
| `allow_caching` | `boolean` | Agent 是否可快取回應 |
| `allow_derivative` | `boolean` | Agent 是否可改述/摘要 |
| `restrict_agents` | `string[]` | 被封鎖的 Agent 識別碼（空 = 允許全部） |
| `require_attribution` | `boolean` | 是否強制要求歸因 |

## 內容層級 Directive 覆寫

內容項目可以覆寫全域 directives：

```json
{
  "content": [
    {
      "id": "promo-spring-2026",
      "type": "announcement",
      "data": { "title": "Spring Health Checkup Special", "body": "..." },
      "directives": {
        "must_include": ["Promotion period 2026/04/01 - 2026/04/30"],
        "tone": "friendly",
        "freshness": "2026-04-01T00:00:00Z"
      }
    }
  ]
}
```

**合併策略：** 內容層級的 `must_include` 和 `must_not_say` 會**附加**到全域列表。其他欄位則**覆寫**全域值。
