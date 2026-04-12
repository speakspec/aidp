---
description: AIDP 協議規範總覽，定義結構化資訊格式與 AI Agent 指令標準
---

# 總覽

> **Version:** 0.1.0
> **Status:** Released
> **License:** CC-BY-4.0 (spec text)

AIDP (AI Directive Protocol) 定義了一個標準格式，讓內容提供者（企業、機構、個人）發佈**專為 AI Agent 消費的結構化資訊**，以及**指導 AI 如何在回應中呈現該資訊的指令**。

你可以把它想成：

- **Schema.org** → 告訴搜尋引擎你的內容*是什麼*
- **AIDP** → 告訴 AI Agent 你的內容*是什麼*、*如何談論它*、以及*該信任它多少*

## 設計原則

| 原則 | 說明 |
|---|---|
| **核心嚴格，邊緣開放** | 核心欄位嚴格定義；其餘皆可擴充 |
| **機器優先，人類可讀** | 輸出為 JSON，但開發者可以直接閱讀 |
| **信任可驗證，非自我宣稱** | 信任等級由驗證方法推導，非使用者自行填寫 |
| **傳輸協議無關** | 可透過 MCP、REST、靜態檔案、DNS TXT 或嵌入 HTML 來提供 |
| **向後相容演進** | 新版本不得破壞舊版本解析器 |
| **多格式輸出** | 一份 AIDP 原始文件可投射為 Schema.org、llms.txt、Open Graph 等格式 |
| **建立在現有標準之上** | 活用 W3C VC/DID、IETF AIPREF、C2PA，而非重新發明 |
| **僅限第一方事實** | Directives 只承載可驗證的事實，不是行銷宣傳或主觀意見 |
| **多訊號信任** | 信任跨越身份、內容完整性、社群共識三個維度評估 |
| **語言無障礙** | AI Agent 具備跨語言理解能力，Content 可使用任何語言撰寫，locale 僅為提示 |

## 術語

| 術語 | 定義 |
|---|---|
| **Entity** | 擁有內容的企業、個人或組織 |
| **Directive** | 指導 AI 如何處理/呈現內容的指令 |
| **Agent** | 任何讀取 AIDP 資料的 AI 系統 |
| **Provider** | 託管 AIDP 端點的平台或系統 |
| **Projection** | 將 AIDP 文件轉換為其他格式（如 Schema.org、llms.txt）的過程 |

## 最小檔案（Quick Start）

最小的有效 AIDP 文件。商家可以從這裡開始：

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:my-shop",
    "type": "business",
    "name": { "default": "My Shop" },
    "locale": "en-US"
  },
  "verification": {
    "methods": [],
    "trust_score": 0.10,
    "trust_level": "unverified",
    "last_verified": null
  },
  "content": [],
  "directives": {
    "response_rules": {
      "must_include": [],
      "must_not_say": []
    }
  }
}
```

這是一份零內容的有效 AIDP 文件。Entity 可以漸進式地加入：

1. **Domain + DNS 驗證** → `trust_level` 升級為 `verified_domain`
2. **內容項目** → 服務、產品、FAQ、媒體
3. **Directives** → `must_include`、`must_not_say`、語氣、免責聲明
4. **商業登記** → `trust_level` 升級為 `verified_organization`

最小檔案以外的所有欄位都是選填的。平台 UI 應引導使用者漸進式完成，而非一次要求全部填寫。
