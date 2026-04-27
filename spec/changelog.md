---
description: AIDP 協議各版本的詳細變更紀錄
---

# Changelog

所有協議版本的變更紀錄。遵循 [Semantic Versioning](https://semver.org/)。

## v0.2.0 (2026-04-28)

### Changed

- **`LocalizedString` 欄位（`name`、`description`）現可接受 bare string 或既有 `{default, [locale]: ...}` object 形式。** Bare string 等同 `{default: <string>}` 的 shorthand。詳見 §3.3。
- 實作 MUST 處理兩種形式（§9 agent behavior）。
- Projection 透過 `value[locale] ?? value.default` 解析 LocalizedString（§11）。

### Fixed

- Search trigger 現在 index `name` 的所有 locale 值，不只 `default` — 多語 entity 現在在非 default locale 也搜得到。

### Migration

既有 v0.1.0 entity（全為 object 形式）不受影響。新 entity 可使用任一形式。Aggregator endpoint（`.well-known/aidp-directory.json`、`/public/search`）持續輸出 object 形式以保持向後相容。

## v0.1.0 (2026-04-23)

AIDP 協議首次公開發布。

### 核心架構

- **Document Structure** — 7 個頂層欄位的 JSON 格式（`$aidp`, `entity`, `verification`, `content`, `directives`, `community`, `extensions`）
- **Core-strict, Edge-open** 設計原則
- URN 格式的 Entity ID（`urn:aidp:entity:{slug}`）

### Entity

- 完整 Entity 欄位定義（`id`, `type`, `name`, `locale`, `contacts`, `addresses`, `links`, `relationships`）
- Contact 支援 `phone` / `email` / `other`（含 `custom_type` 支援 LINE、WhatsApp 等）
- Action Links 三層信任模型：`domain_verified` / `platform_verified` / `unverified`
- Entity Relationships（`parent_organization`、`subsidiary`、`official_partner` 等）
- **Market 欄位** — Entity 和 Content 層級的 `market` 物件，定義地理 / 市場可用範圍

### Verification

- **路徑式信任模型（path-based，非加成）**：三個獨立路徑為門檻，平台取達成的最高值
  - `email_domain`（role address）→ `claimed` (0.40)
  - `dns_txt` / `dns_cname` → `verified_domain` (0.65)
  - DNS + `business_registration`（管理員審核通過）→ `verified_organization` (0.80)
- `business_registration` 需先有 DNS 驗證作為前置條件
- `meta_tag` 不納入信任分數計算（僅為顯示用途）
- **Stackable bonus**：`manual_review` 於任何路徑可疊加 +0.10，僅限管理員發起
- **Tier cap 0.89**：非特權實體類型上限為 0.89（僅 `government` / `institutional` 可超過）
- **Trust level override**：管理員可無條件覆寫 `trust_level` enum；需填寫原因並寫入審計日誌
- W3C Verifiable Credential 欄位已保留，v0.1 尚未啟用

### Content

- 10 種內建 schema + 自訂 schema 支援
- Media Schema（`aidp:media`）— 圖片、影片、文件的結構化中繼資料
- Content 層級 directives 可覆蓋全域 directives
- **Content Variants** — `variant_of` / `variant_delta` 機制，支援同一內容在不同地區的差異式變體
- **語言自由原則** — Content 可使用任何語言或混合語言撰寫，`locale` 僅為脈絡提示而非限制

### Directives

- 四大區塊：`identity`、`response_rules`、`attribution`、`freshness`
- `response_rules`：`must_include` / `must_not_say` / `tone` / `disclaimer`
- `access_control`：AI 訓練 / 衍生作品控制（對接 IETF AIPREF）

### Community

- 異議機制：`factual_error` / `outdated` / `impersonation` / `misleading`
- 異議生命週期：`pending` → `reviewing` → `resolved` / `rejected`
- 交叉參考驗證：多來源一致性分數

### Extensions

- 命名空間化的擴充機制
- 平台命名空間：`x-google`、`x-openai`、`x-anthropic` 等 9 個預留
- 產業命名空間：`x-industry:healthcare` 等

### Transport

- MCP（Mode A: Resource + Mode B: Tool）
- REST API
- 靜態檔案（`.well-known/aidp.json`）
- DNS TXT Discovery
- HTML Meta Tag

### Output Formats

- Schema.org JSON-LD
- llms.txt
- Open Graph HTML

### Agent Behavior

- 完整的 Agent 處理流程規範
- Trust Level 和行為對照
- Directive 優先順序與合併規則
- Market 地區匹配邏輯
- Variant 合併與選擇邏輯
