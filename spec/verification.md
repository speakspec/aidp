# Verification

定義 **Entity 的身份如何被驗證**，並產生計算後的 trust level。

```json
{
  "verification": {
    "platform": {
      "id": "urn:aidp:platform:speakspec",
      "url": "https://api.speakspec.com",
      "name": "AIDP Official Platform"
    },
    "methods": [
      {
        "type": "dns_txt",
        "domain": "daanclinic.com",
        "record": "aidp-verify=abc123xyz",
        "verified_at": "2026-03-20T08:00:00Z",
        "status": "verified"
      },
      {
        "type": "business_registration",
        "country": "US",
        "registration_id": "OR-12345678",
        "verified_at": "2026-03-18T10:00:00Z",
        "status": "verified"
      }
    ],
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "last_verified": "2026-03-20T08:00:00Z",
    "credential": null
  }
}
```

## Verification Methods

| `type` | 說明 | 信任權重 |
|---|---|---|
| `dns_txt` | 在網域上設定指向 AIDP Entity ID 的 TXT 記錄 | 高 |
| `dns_cname` | CNAME 子網域委派（例如 `_aidp.example.com`） | 高 |
| `meta_tag` | 網站 HTML 中的 `<meta name="aidp-verify">` | 中 |
| `business_registration` | 政府核發的商業登記號碼已驗證 | 高 |
| `domain_whois` | 網域 WHOIS 資訊與 Entity 資訊相符 | 中 |
| `email_domain` | 在相符網域上的已驗證電子郵件 | 低 |
| `social_verification` | 連結的社群帳號與身份相符 | 低 |
| `manual_review` | 平台人員人工驗證 | 高 |
| `third_party` | 外部驗證提供商（可擴充） | 不定 |
| `verifiable_credential` | 提供的 W3C Verifiable Credential（見 4.4） | 高 |

## Trust Levels（計算值）

Trust level 由**平台推導**，而非自行宣稱。列舉值按順序排列：

| 等級 | 典型 Entity |
|---|---|
| `sovereign` | 政府機關、.gov 網域 |
| `institutional` | 大學、研究機構、醫療協會 |
| `verified_organization` | 已通過 DNS 驗證且有商業登記的企業 |
| `verified_domain` | 已通過 DNS 驗證但無商業登記 |
| `claimed` | 已建立帳號、已驗證電子郵件、無 DNS |
| `unverified` | 匿名或新註冊 |

## Trust Score 計算

`trust_score` 是介於 0 到 1 之間的 `float`。平台根據驗證方法的加權累計計算分數，並映射到上述 trust level。

具體的加權演算法和門檻值由各平台實作決定。AIDP 協議**刻意不做嚴格規範** -- 不同平台可以使用不同的加權策略，但必須公開結果的 `trust_level` 列舉值，使 Agent 有標準化的信號可用。

## Verifiable Credential 整合（選用，前瞻性）

AIDP 設計為可與 **W3C Verifiable Credentials 2.0** 生態系整合。本節定義 AIDP 原生驗證與 VC/DID 基礎設施之間的橋接。

### Entity ID 作為 DID

`entity.id` 欄位可以使用 W3C Decentralized Identifier 取代預設的 URN 格式：

```json
{
  "entity": {
    "id": "did:web:daanclinic.com"
  }
}
```

支援的 DID 方法：

| DID 方法 | 使用情境 | 備註 |
|---|---|---|
| `did:web` | 已通過網域驗證的 Entity | 透過 HTTPS 解析，與現有網域綁定 |
| `did:key` | 輕量級 / 自行簽發 | 無需外部解析 |
| `did:wba` | 與 Agent Network Protocol 相容 | 用於與 ANP 生態系互通 |

當 `entity.id` 是 DID 時，Agent 可以解析 DID Document 以取得用於簽章驗證的公鑰。

解析器必須同時接受 `urn:aidp:*` 和 `did:*` 格式。若解析器不支援 DID 解析，則必須將 DID 視為不透明識別碼。

### Credential 欄位

`verification.credential` 欄位攜帶一個 W3C Verifiable Credential，以密碼學方式證明 Entity 的已驗證身份：

```json
{
  "verification": {
    "methods": [ "..." ],
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "last_verified": "2026-03-20T08:00:00Z",
    "credential": {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://speakspec.com/ns/v1"
      ],
      "type": ["VerifiableCredential", "AIDPEntityCredential"],
      "issuer": "did:web:api.speakspec.com",
      "validFrom": "2026-03-20T08:00:00Z",
      "validUntil": "2027-03-20T08:00:00Z",
      "credentialSubject": {
        "id": "did:web:daanclinic.com",
        "aidpTrustLevel": "verified_organization",
        "aidpVerificationMethods": ["dns_txt", "business_registration"],
        "domain": "daanclinic.com",
        "registrationCountry": "US"
      },
      "proof": {
        "type": "DataIntegrityProof",
        "cryptosuite": "ecdsa-jcs-2019",
        "verificationMethod": "did:web:api.speakspec.com#key-1",
        "proofPurpose": "assertionMethod",
        "created": "2026-03-20T08:00:00Z",
        "proofValue": "z58DAdFfa9..."
      }
    }
  }
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `credential` | `VerifiableCredential \| null` | 否 | 證明 Entity 身份的 W3C VC 2.0 |

**行為規則：**

1. `credential` 在 v0.3 中為選用欄位。當缺少或為 `null` 時，Agent 退回使用 `trust_level` 列舉值
2. 當存在時，支援 VC 驗證的 Agent 應在信任 `trust_level` 之前驗證 `proof`
3. 若 `proof` 驗證失敗，Agent 必須將 `trust_level` 降級為 `unverified`，不論宣稱的值為何
4. `issuer` 識別執行驗證的 AIDP 平台。未來版本可能支援多個 issuer
5. 必須遵守 `validUntil` 到期時間 -- 已過期的 credential 視同不存在

### C2PA Content Provenance（保留欄位）

對於包含媒體（圖片、文件）的 [Content](/spec/content) 項目，AIDP 保留 `content[].provenance` 欄位供未來 **C2PA Content Credentials** 整合使用：

```json
{
  "content": [
    {
      "id": "photo-storefront",
      "type": "media",
      "data": { "url": "https://..." },
      "provenance": {
        "type": "c2pa",
        "manifest_url": "https://...",
        "signer": "did:web:daanclinic.com"
      }
    }
  ]
}
```

此欄位為保留欄位，在 v0.3 中尚未啟用。Agent 必須忽略此欄位，直到未來版本啟用該 schema。

## Anti-Impersonation 規則

AIDP 平台必須實作以下防護措施以防止 Entity 冒充。

### 強制檢查

以下檢查為所有 AIDP 平台實作的**必要項目**：

**網域-名稱綁定：** 若 `entity.domain` 已設定，`entity.name` 必須對應網域擁有者。平台必須拒絕宣稱名稱為知名品牌（例如 "Apple"、"Google"、"Nike"）但網域與品牌已知網域不相符的註冊。

**名稱相似度偵測：** 註冊時，`entity.name`（所有語系變體）必須使用模糊比對檢查所有 `trust_level` >= `verified_domain` 的現有 [Entity](/spec/entity)。若相似度超過閾值且網域不相符，註冊必須被拒絕或轉送人工審查。

**類型限制：** `entity.type` 值為 `government` 和 `institutional` 必須經過平台人工審查。禁止這些類型的自助註冊。

**信任上限：** 若 Entity 的名稱與現有 `verified_organization` 或以上等級的 Entity 相符且網域不同，`trust_level` 將被**硬性限制**在 `unverified`，不論其他驗證分數為何。此限制僅能透過平台人工審查解除。

### Identity Binding Record

平台應在 verification 物件中公開冒充檢查結果：

```json
{
  "verification": {
    "identity_binding": {
      "domain_name_match": "strict",
      "name_similarity_checked": true,
      "similar_entities_found": [],
      "impersonation_risk": "low",
      "reviewed_at": "2026-03-25T00:00:00Z"
    }
  }
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `domain_name_match` | `enum` | `strict`（網域與名稱相符）、`partial`（相關）、`none`（無網域）、`mismatch`（可疑） |
| `name_similarity_checked` | `boolean` | 是否已執行模糊比對 |
| `similar_entities_found` | `string[]` | 相似現有 Entity 的 ID（空陣列 = 無衝突） |
| `impersonation_risk` | `enum` | `low`、`medium`、`high`、`blocked` |
| `reviewed_at` | `datetime` | 上次執行冒充檢查的時間 |

Agent 應將 `impersonation_risk: "high"` 的 Entity 視同 `trust_level: "unverified"`。

## Cross-Reference Verification

平台可以自動將 AIDP 自行申報的資料與公開第三方來源進行交叉比對。這提供了獨立於身份信任之外的一致性信號。

```json
{
  "verification": {
    "cross_reference": {
      "sources_checked": [
        {
          "source": "google_maps",
          "entity_match": true,
          "checked_at": "2026-03-25T00:00:00Z"
        },
        {
          "source": "oregon_sos",
          "entity_match": true,
          "registration_id_match": true,
          "checked_at": "2026-03-25T00:00:00Z"
        }
      ],
      "discrepancies": [
        {
          "field": "content.hours.schedule[day=sat]",
          "aidp_value": "11:00-22:00",
          "external_value": "11:00-20:00",
          "source": "google_maps",
          "severity": "minor",
          "detected_at": "2026-03-25T00:00:00Z"
        }
      ],
      "consistency_score": 0.85,
      "last_checked": "2026-03-25T00:00:00Z"
    }
  }
}
```

### Cross-Reference 來源

| Source ID | 檢查的資料 | 地區 |
|---|---|---|
| `google_maps` | 營業時間、地址、電話、評論情緒 | 全球 |
| `oregon_sos` | 商業登記、公司名稱、狀態 | 美國奧勒岡州 |
| `fda_food_safety` | 食品安全認證、違規紀錄 | 美國 |
| `state_medical_board` | 醫療執照、專科 | 美國 |
| `whois` | 網域註冊資料 | 全球 |
| `social_profile` | 個人檔案名稱、簡介一致性 | 全球 |

平台可以新增自訂來源。自訂來源的 Source ID 必須加上 `x-` 前綴。

### Consistency Score

`consistency_score` 是介於 0 到 1 之間的 `float`，獨立於 `trust_score`：

- `trust_score` 回答的問題：**「你是否是你所宣稱的身份？」**（身份）
- `consistency_score` 回答的問題：**「你說的內容是否與他人所說的一致？」**（內容準確性）

AI Agent 在決定多大程度依賴 Entity 的 [Content](/spec/content) 時，應同時考慮這兩個維度：

| trust_score | consistency_score | Agent 建議 |
|---|---|---|
| 高 | 高 | 視為可靠來源 |
| 高 | 低 | 身份已確認但內容可能過時或有偏差 -- 附帶警語顯示 |
| 低 | 高 | 內容似乎準確但身份未驗證 -- 附帶警語顯示 |
| 低 | 低 | 不可靠 -- 優先使用其他來源 |

## Platform-Hosted 與 Self-Hosted 信任

AIDP 文件可以從受信任的平台提供，或自行託管於 `/.well-known/aidp.json`。信任層面的影響有顯著差異。

### Platform 欄位

`verification.platform` 欄位識別是否有平台、以及哪個平台執行了驗證：

```json
{
  "verification": {
    "platform": {
      "id": "urn:aidp:platform:speakspec",
      "url": "https://api.speakspec.com",
      "name": "AIDP Official Platform"
    }
  }
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `platform` | `Platform \| null` | 否 | 託管並驗證此 AIDP 文件的平台 |
| `platform.id` | `string` | 是 | 平台識別碼 |
| `platform.url` | `string` | 是 | 平台 URL（供 Agent 驗證平台合法性） |
| `platform.name` | `string` | 否 | 人類可讀的平台名稱 |

### 信任影響

| 託管模式 | `platform` 值 | 信任行為 |
|---|---|---|
| **Platform-hosted** | 存在且可解析 | Agent 可向平台驗證信任分數。所有驗證欄位（trust_score、consistency_score、integrity_score）皆為平台背書 |
| **Self-hosted** | `null` 或缺少 | Agent 必須將所有驗證欄位視為自行宣稱。有效 `trust_level` 應限制在 `claimed` 以下，除非 Agent 獨立驗證 DNS 記錄 |
| **Self-hosted + VC** | `null` 但 `credential` 存在且 proof 有效 | Agent 可以密碼學方式驗證 credential。來自 VC 的 trust level 即使沒有平台也是可信的 |

**關鍵規則：** 當 `platform` 為 `null` 且 `credential` 缺少時，Agent 不得信任 `trust_score`、`trust_level`、`consistency_score` 或 `integrity_score` 的值 -- 它們是無法驗證的自行宣稱。Agent 唯一能從 self-hosted AIDP 獨立驗證的信號是 DNS 記錄是否存在。
