---
description: AIDP 協議各版本的詳細變更紀錄
---

# Changelog

所有協議版本的變更紀錄。遵循 [Semantic Versioning](https://semver.org/)。

## v0.4.0-draft (2026-04-04)

### 新增

- **Market 欄位** -- Entity 和 Content 層級新增 `market` 物件，定義地理/市場可用範圍
  - `availability`: `global` / `regional` / `online_only`
  - `regions`: ISO 3166-1 alpha-2 國碼陣列
  - Content 的 market 可覆蓋 Entity 的 market，未設定則繼承
- **Content Variants** -- 新增 `variant_of` / `variant_delta` 機制，支援同一內容在不同地區的差異式變體
  - 合併規則：`final = { ...base.data, ...variant.variant_delta }`
  - 不允許鏈式 variant（variant 的 variant）
  - Agent 根據使用者地區自動選擇最適合的 variant
- **語言自由原則** -- 明確定義 Content 可使用任何語言或混合語言撰寫，`locale` 僅為脈絡提示而非限制

### 變更

- Roadmap 中標記 Market、Variant、語言自由原則為已完成
- 設計原則新增「多訊號信任」條目

### Agent 行為更新

- Agent 必須實作 Market 地區匹配邏輯
- Agent 必須實作 Variant 合併與選擇邏輯
- Agent 遇到 `regional` 內容且使用者不在對應地區時，應提示可用性限制

---

## v0.3.0-draft (2026-03-01)

### 新增

- **Entity 完整欄位** -- `contacts`、`addresses`、`links`、`relationships` 完整定義
  - Contact 支援 `phone` / `email` / `other`（含 `custom_type` 支援 LINE、WhatsApp 等）
  - Action Links 三層信任模型：`domain_verified` / `platform_verified` / `unverified`
  - Entity Relationships（`parent_organization`、`subsidiary`、`official_partner` 等）
- **Verification 完整架構** -- 三維信任模型
  - Identity（身份驗證）：DNS TXT/CNAME、商業登記、W3C VC
  - Consistency（內容一致性）：交叉參考驗證
  - Integrity（完整性）：社群異議機制
  - 信任分數加權公式：`score = (0.50 * identity) + (0.30 * consistency) + (0.20 * integrity)`
  - Trust Level：`unverified` / `self_declared` / `verified_domain` / `verified_organization`
- **Content 系統** -- 10 種內建 schema + 自訂 schema 支援
  - `aidp:service`、`aidp:product`、`aidp:article`、`aidp:faq`、`aidp:event`、`aidp:menu_item`、`aidp:person`、`aidp:policy`、`aidp:announcement`、`aidp:dataset`
  - Content 層級 directives 可覆蓋全域 directives
- **Media Schema** (`aidp:media`) -- 圖片、影片、文件的結構化中繼資料
  - `media_refs` 連結 content 與 media
  - Media directives：`display_rules`、`licensing`
  - Document `behavior`：`parseable` / `renderable` / `link_only`
- **Directives 系統** -- 四大區塊
  - `identity`：品牌呈現指令
  - `response_rules`：`must_include` / `must_not_say` / `tone` / `disclaimer`
  - `attribution`：引用來源規則
  - `freshness`：內容時效指令
  - `access_control`：AI 訓練/衍生作品控制（對接 IETF AIPREF）
- **Community 完整性** -- 異議機制 + 交叉參考
  - 異議類型：`factual_error` / `outdated` / `impersonation` / `misleading`
  - 異議生命週期：`pending` -> `reviewing` -> `resolved` / `rejected`
  - 交叉參考驗證：多來源一致性分數
- **Extensions** -- 命名空間化的擴充機制
  - 平台命名空間：`x-google`、`x-openai`、`x-anthropic` 等 9 個預留
  - 產業命名空間：`x-industry:healthcare` 等
  - Agent 必須忽略未知 extension
- **Transport** -- 五種傳輸方式
  - MCP（Mode A: Resource + Mode B: Tool）
  - REST API
  - 靜態檔案（`.well-known/aidp.json`）
  - DNS TXT Discovery
  - HTML Meta Tag
- **輸出格式** -- 一份 AIDP 文件可投射為多種格式
  - Schema.org JSON-LD
  - llms.txt
  - Open Graph HTML
- **Agent 行為指南** -- 完整的 Agent 處理流程規範
  - Trust Level 和行為對照
  - Directive 優先順序與合併規則
  - 錯誤處理指引

---

## v0.2.0-draft (2025-12-15)

### 新增

- 初始 Entity 結構定義（`id`、`type`、`name`、`locale`）
- 基礎 Content 陣列設計
- 初步 Directives 概念（`must_include`、`must_not_say`）
- Verification 基礎框架（`trust_score`、`trust_level`）
- 基本 Document Structure（7 個頂層欄位）

### 設計決策

- 選擇 JSON 作為主要格式（而非 YAML 或 XML）
- 確立 `Core-strict, Edge-open` 設計原則
- 確立 URN 格式作為 Entity ID（`urn:aidp:entity:{slug}`）

---

## v0.1.0-draft (2025-09-01)

### 概念驗證

- AIDP 協議概念確立
- 核心問題定義：AI Agent 如何取得可信的結構化商業資訊
- 與現有標準的定位區隔：Schema.org（描述性）、robots.txt（阻擋性）vs AIDP（指令性 + 驗證性）
- 初步架構設計：Entity-Content-Directive 三層模型
