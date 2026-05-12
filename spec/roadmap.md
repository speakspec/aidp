# Roadmap

AIDP 協議的版本規劃路線。

## 已釋出

- [x] **v0.4.0**（2026-05-12）-- Content 投放策略：per-entity per-type `inline` / `directory` 切換；新增 `content_index` 頂層欄位（指向 directory + 哪些 type 是 inline vs indexed 的 metadata）；新增 `pinned` envelope 旗標（強制 inline 個別 content，不受 type 策略影響）；`/.well-known/aidp/content/directory.json` 支援 `?pinned=true|false` 過濾。
- [x] **v0.3.0**（2026-05-12）-- 三層解耦設計（Transport / Verification / Consumption）；`_proof` 密碼學簽章（`ed25519-jws`）；Content Endpoint（§8.7）+ Content Directory（§8.8）+ Inline Embedding（§8.9）；Webhook cache invalidation（§8.10，HMAC + replay protection）；JWKS（§8.11）/ Verification（§8.12）/ Revocation（§8.13）端點；JSON Schema artifact `v0.3.0.json`。
- [x] **v0.2.0**（2026-04-28）-- 多型 LocalizedString：`name` / `description` 接受 bare string 或 `{default, [locale]: ...}` object 形式。Search trigger 改為索引 `name` 所有 locale 值（不只 `default`）。
- [x] **v0.1.0**（2026-04-23）-- 初次公開釋出：entity、verification、content、directives、transport、projection、community integrity。

## 規劃中

- [ ] **v0.4.x** -- Redirect proxy 追蹤參數標準化和 link_redirects/link_clicks 行為規範
- [ ] **v0.4.x** -- 平台驗證（OAuth 和 meta tag 驗證）用於第三方連結信任
- [ ] **v0.4.x** -- 即時內容推送（WebSocket / SSE 用於即時更新）
- [ ] **v0.4.x** -- Agent 回饋迴路（Agent 回報過期/不正確的內容給平台）
- [ ] **v0.5** -- C2PA provenance 欄位用於媒體驗證（補完 §3.7 placeholder）
- [ ] **v0.5** -- 市場層（付費 directives、內容提供者分析）
- [ ] **v0.5** -- Projection 外掛系統（第三方可註冊自訂輸出格式）
- [ ] **v0.6** -- 異議信譽系統（異議者的追蹤紀錄影響異議權重）
- [ ] **v0.6** -- 透過多來源共識的自動異議解決
- [ ] **v1.0** -- 穩定版釋出，附參考實作 + VC/DID 完全啟用
