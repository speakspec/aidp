---
description: AIDP 協議各版本的詳細變更紀錄
---

# Changelog

所有協議版本的變更紀錄。遵循 [Semantic Versioning](https://semver.org/)。

## v0.3.0 (2026-05-12 已釋出)

> **狀態：** 已釋出,tag `v0.3.0`。v0.3 系列規格文本凍結。

### Added

- **三層解耦設計原則**（§1.1）— Transport（內容在哪）、Verification（內容真不真）、Consumption（AI 怎麼用）三層獨立，agent 可任意組合。
- **加密簽章 `_proof`（§4.8）**— 由 trust provider 對 directive 內容簽章；可選用，不強制。支援 `ed25519-jws`，可同時帶多個簽章（`_proofs[]`）。
- **Content Endpoint Transport（§8.7）**— `/.well-known/aidp/content/{id}.json` 回傳完整 `Content` 物件（body + media + directives + 簽章），讓 AI 透過 AIDP 通道取得內容，無須 parse HTML body。
- **Content Directory（§8.8）**— `/.well-known/aidp/content/` 列出 entity 全部內容的分頁索引，AIDP 層的 `sitemap.xml`。
- **Inline Embedding（§8.9）**— `<script type="application/aidp+json">` 內嵌於 HTML。兩種模式：`ContentPointer`（預設，約 600 bytes）與完整 `Content`（opt-in，2–4 KB）。皆帶 `_proof`。
- **Webhook Cache Invalidation（§8.10）**— `POST {site}/api/_aidp/invalidate`，HMAC + replay 防護。單一規範 event `directive.updated`，靠 `scope: entity | content` 區分。
- **Public Key JWKS Endpoint（§8.11）**— `{trust_provider}/.well-known/aidp-keys` 提供簽章公鑰；標準 JWKS 格式，`OKP/Ed25519`。
- **Canonical Verification Endpoint（§8.12）**— `{trust_provider}/v/{eid}/{cid}` 回傳極小 `VerificationResponse`（`valid`、`revoked`、`current_version`），刻意不可 cache。
- **Revocation List（§8.13）**— `{trust_provider}/.well-known/aidp-revocation` 列出已撤銷的 entity / content / 簽章 key，cacheable 1 小時。
- **HTML link relations（§8.5）**— 新增 `aidp-content`（per-page 對應）與 `aidp-keys`（JWKS 指標）。
- **Endpoint Preference 行為（§9.1.1）**— 當 `<link rel="aidp-content">` 存在時，agent SHOULD 優先 fetch Content Endpoint，不該 parse HTML body。
- **Verification 行為（§9.10）**— 規範 JWKS fetch / 簽章驗證 / canonical lookup 流程；驗證失敗 degrade trust，不 reject payload。
- **Content Endpoint 到 Schema.org Projection（§11.8）**— 將 v0.3 Content endpoint 投影成 Schema.org `Article` 的 mapping 表，方便 SEO 重用。
- **JSON Schema artifact** `public/schema/v0.3.0.json`，含 `Proof`、`Content`、`ContentPointer`、`ContentDirectory`、`VerificationResponse`、`TrustProviderKeys`、`RevocationList`、`WebhookInvalidation` 的 `$defs`。

### Changed

- Transport priority list（§8.6）重排：新增的 Content Endpoint 插在第 3 位於 Static file 之前；Inline embedding 列入 discovery tier 底部；Verification endpoints（§8.11–8.13）與 priority list 正交。
- §9.1 Processing Order step 3 同時 reference `_proof` 與既有 `credential` 驗證。
- §4.7.1 platform field table 新增 optional `attestation_url`（entity 層驗證查詢，與 per-payload `_proof.canonical_url` 互補）。
- §8.7 Content Endpoint envelope 明確為 §5 Content 的 superset，新增 §8.7.1 field reference 列出 endpoint-specific 欄位（`url`、`title`、`language`、`published_at`、`version`、`author`、`media`、`links`、`verification`、`_proof`）。
- v0.3 timestamp 欄位名與 §5.1 對齊：endpoints / pointers / signed fields 統一用 `updated_at`（RFC 草案初版誤用 `modified_at`，release 前已修正）。

### Backward Compatibility

- v0.3 所有新增都是 **additive**。v0.2 payload 仍然是合法的 v0.3 文件。
- v0.2 client 看到 `_proof` 該按 §1.1（"Backwards-compatible evolution"）忽略未知欄位，不應 fail parsing。
- `verification.platform` 欄位於 v0.2 已存在（§4.7）；v0.3 增加 optional `attestation_url` 子欄位。

### Migration

無 breaking change。既有 v0.2 entity directive `/.well-known/aidp.json` 仍 valid。新可選欄位：

- 等 trust provider 簽章機制就緒後，將 `_proof` 加到 entity directive
- 準備好暴露 AI 通道時，按 `/.well-known/aidp/content/{id}.json` 發佈 per-content endpoint
- 在 article / product 頁加 `<link rel="aidp-content">` 與 `<link rel="aidp-keys">`

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
