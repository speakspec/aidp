# 社群完整性

AIDP 認知到自我回報的資料存在固有偏差。本章節定義了透過社群參與進行外部驗證的機制，旨在抵抗操控的同時提供有意義的完整性訊號。

## 爭議機制

任何已驗證的 AIDP 使用者都可以對特定內容聲明提交 **爭議（dispute）**。爭議不是評分或評論，而是結構化、有證據支持的事實性質疑。

```json
{
  "community": {
    "disputes": {
      "total": 5,
      "resolved": 3,
      "pending": 1,
      "rejected": 1,
      "items": [
        {
          "id": "disp-001",
          "target_content_id": "hours",
          "target_field": "data.availability.schedule[day=sat]",
          "claim": "Saturday hours are actually until 8:00 PM, not 10:00 PM",
          "evidence": [
            {
              "type": "url",
              "value": "https://maps.google.com/...",
              "description": "Google Maps shows Saturday hours until 8:00 PM"
            },
            {
              "type": "url",
              "value": "https://www.instagram.com/.../posts/...",
              "description": "Business posted on social media 2026/03/15 about updated hours"
            }
          ],
          "submitted_by": {
            "entity_id": "urn:aidp:entity:some-user",
            "trust_level": "verified_domain"
          },
          "status": "pending_review",
          "submitted_at": "2026-03-20T15:00:00Z",
          "resolved_at": null,
          "resolution": null
        }
      ]
    },
    "integrity_score": 0.90
  }
}
```

### 爭議欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `id` | `string` | 是 | 唯一的爭議識別碼 |
| `target_content_id` | `string` | 是 | 被質疑的內容項目 |
| `target_field` | `string` | 否 | 指向特定欄位的 JSON 路徑（例如 `data.availability.schedule`） |
| `claim` | `string` | 是 | 爭議者認為不正確的內容（最多 500 字元） |
| `evidence` | `Evidence[]` | 是 | 至少一項支持證據 |
| `submitted_by.entity_id` | `string` | 是 | 爭議者的 AIDP entity ID |
| `submitted_by.trust_level` | `string` | 是 | 爭議者提交時的 trust level |
| `status` | `enum` | 是 | `pending_review` / `confirmed` / `rejected` / `resolved` |
| `resolution` | `string \| null` | 否 | 爭議如何被解決 |

### 爭議提交要求

為防止機器人垃圾訊息和無意義的爭議：

1. **需要身份：** 爭議者必須擁有至少 `claimed` trust level（已驗證 email）的 AIDP 帳號
2. **需要證據：** 至少一項包含 URL 或可驗證參考的證據項目
3. **需要具體性：** 必須針對特定的 `content_id` 並提供具體的反向主張
4. **頻率限制：** 每個帳號有合理的爭議提交次數限制
5. **不可自我爭議：** Entity 不能對自己的內容提出爭議（請使用編輯功能）
6. **去重複：** 來自同一 entity 針對相同內容欄位的爭議會自動合併

### 反濫用措施

平台採用多層防護機制來防止爭議系統被濫用，包括：

- **驗證成本** -- 爭議提交者必須完成身份驗證
- **證據驗證** -- 證據中的 URL 會被驗證有效性
- **行為分析** -- 異常提交模式會被偵測並標記
- **信任加權** -- 較高信任等級的 entity 提出的爭議權重較高
- **跨爭議關聯** -- 多個獨立來源對同一主張提出爭議時，將觸發平台審查

### 爭議解決

| 解決類型 | 說明 |
|---|---|
| `entity_updated` | Entity 確認並更新其內容 |
| `evidence_insufficient` | 爭議證據不具說服力 |
| `third_party_confirmed` | 交叉參照（[驗證](/spec/verification) 4.6）確認了該爭議 |
| `dispute_withdrawn` | 爭議者撤回主張 |
| `platform_ruling` | 平台做出裁決 |

### Entity 回應流程

被爭議內容的 Entity 必須有明確的回應途徑。爭議過程是雙向交流，不是單方面的指控。

**Entity 收到通知：** 當其內容被提出爭議時會收到通知。通知包含爭議主張、證據和回應期限。

**Entity 回應選項：**

| 回應 | 效果 |
|---|---|
| **接受並更新** | Entity 編輯被爭議的內容。爭議狀態變為 `entity_updated`。不影響 integrity_score |
| **以證據反駁** | Entity 提供反向證據（URL、文件）。爭議進入平台審查 |
| **要求釐清** | Entity 要求爭議者提供更具體的證據。爭議時鐘暫停 |
| **未回應** | 期限過後，爭議升級至平台審查。反覆未回應會降低 integrity_score |

**防範惡意爭議的保護措施：**

1. Entity 可以舉報爭議為濫用（垃圾訊息、競爭破壞、騷擾）
2. 累積多次被駁回或濫用的爭議者，其未來爭議權重會降低
3. 可能存在利益衝突的爭議會被自動標記進行加強審查
4. 較高信任等級的 Entity 在被爭議時享有優先審查

## Integrity Score

`integrity_score` 提供內容可靠性的綜合訊號：

```
integrity_score = f(consistency_score, dispute_ratio, response_rate, content_freshness)
```

其中：

- `consistency_score` -- 來自交叉參照驗證（[驗證](/spec/verification) 第 4.6 節）
- `dispute_ratio` -- 已確認爭議 / 總內容項目數（越低越好）
- `response_rate` -- Entity 解決爭議的速度（越快越好）
- `content_freshness` -- 在 TTL 內更新的內容比例

分數為 0 到 1 之間的 `float`。實作方可使用不同的加權公式，但必須公開 `integrity_score` 值。

## 三維信任模型

AIDP 向 AI 代理揭露三個獨立的信任維度：

| 維度 | 欄位 | 回答的問題 | 機制 |
|---|---|---|---|
| **身份** | `trust_score` + `trust_level` | 「你是你所聲稱的人嗎？」 | DNS、商業登記、VC |
| **內容準確性** | `consistency_score` | 「你的資料與外部來源一致嗎？」 | 交叉參照（4.6） |
| **社群完整性** | `integrity_score` | 「其他人同意你所說的嗎？」 | 爭議（10.1） |

AI 代理接收所有三個訊號並做出自己的判斷。沒有任何單一維度可以覆蓋其他維度。

```json
{
  "verification": {
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "cross_reference": {
      "consistency_score": 0.90
    }
  },
  "community": {
    "integrity_score": 0.95
  }
}
```
