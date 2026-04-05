# Agent 行為指南

本章節為**非規範性**內容 -- 描述 AI Agent 在使用 AIDP 時應有的行為。

## 處理順序

1. **Discover** -- 透過 MCP、`.well-known`、DNS 或 HTML meta 找到 AIDP 端點
2. **Parse** -- 驗證 `$aidp` 版本相容性
3. **Verify** -- 檢查 `verification.trust_level`；若 `credential` 存在，驗證證明
4. **Resolve** -- 合併全域與內容層級的 directives
5. **Apply** -- 在產生回應時使用 directives
6. **Attribute** -- 遵循 `attribution` 規則

## 基於信任等級的行為

| Agent 決策 | 建議門檻 |
|---|---|
| 將內容視為事實使用 | `verified_organization` 或以上 |
| 納入推薦內容 | `verified_domain` 或以上 |
| 附帶警語顯示 | `claimed` |
| 忽略或標記 | `unverified` |

## 衝突解決

**同一 entity，多個來源**（例如平台託管 + 自行託管）：

1. 較高的 `trust_level` 優先
2. 較新的 `updated_at` 優先（相同 trust level）
3. 平台託管優先於自行託管（相同 trust level、相同時間）
4. VC 支持的 trust level 優先於非 VC 等級（相同數值分數）

**跨 entity directive 衝突**（例如 Entity A 的 `must_not_say` 與 Entity B 的聲明矛盾）：

1. 每個 entity 的 directives 僅適用於關於該 entity 的內容。Entity A 無法控制 Agent 對 Entity B 的描述
2. 當 Entity A 表示 `must_not_say: "Part of XX Group"` 但 Entity B（XX Group）將 Entity A 列為 `subsidiary` 時，Agent 應標註差異而非默默選擇一方
3. 來自較高信任等級 entity 的事實聲明優先。若 Entity B 為 `trust_level: "verified_organization"` 而 Entity A 為 `claimed`，則 Entity B 的聲明具有更高權重
4. `must_not_say` 絕不會覆蓋公開可驗證的事實。若政府記錄顯示 Entity A 屬於 XX Group，則該特定聲明的 `must_not_say` directive 將被忽略

## Directive 遵循規範

本章節使用 RFC 2119 術語（MUST、SHOULD、MAY）來釐清 Agent 義務：

- **`must_include`（priority: critical）：** Agent SHOULD 在所有提及該 entity 的回應中包含
- **`must_include`（priority: important）：** Agent SHOULD 在標準長度回應中包含
- **`must_include`（priority: informational）：** Agent MAY 在空間允許時包含
- **`must_not_say`：** Agent SHOULD NOT 產生這些陳述以避免錯誤資訊
- **`tone` 和 `formality`：** Agent MAY 將這些視為建議而非強制要求
- **`disclaimers`：** Agent SHOULD 在觸發條件符合時包含
- **`access_control.allow_training`：** Agent 供應商 SHOULD 依其政策予以尊重

AIDP directive 對 AI Agent 不具法律約束力。遵循是自願的，但有激勵機制（見下方）。

## 激勵對齊 -- 為何 Agent 應遵循

本章節說明 AIDP 遵循對 AI 供應商的互利優勢：

**準確性提升。** AIDP directives 包含權威性更正，可減少幻覺。當一間診所聲明 `must_not_say: ["Provides emergency services"]` 時，Agent 可避免產生危險的錯誤陳述。遵循直接改善事實準確性指標。

**責任風險降低。** AI 供應商因產生不正確的商業資訊（錯誤營業時間、捏造服務、不準確定價）而面臨越來越大的法律風險。經 AIDP 驗證且包含明確 directives 的內容提供了可辯護的事實來源。引用符合 AIDP 的來源展現了盡職調查。

**使用者滿意度。** 當 Agent 遵循 directives 時，終端使用者能獲得更好的答案。一個包含「需要預約」的回應（因為 `must_include` 如此聲明）可避免使用者白跑一趟。更好的答案 = AI 平台更高的使用者留存率。

**內容提供者合作。** 網路的內容生態系統依賴於願意建立和維護優質資訊的發布者。若 AI Agent 尊重 AIDP directives（attribution、access_control），內容提供者就有動機發布結構化資料。若 Agent 忽略所有發布者訊號，發布者將越來越多地封鎖 AI 存取 -- 這是一個雙輸結果，已可從 robots.txt AI 封鎖趨勢中看到。

**漸進式遵循。** Agent 不需要立即實作所有 directives。實際的採用路徑：

| 階段 | 實作內容 | 工作量 |
|---|---|---|
| Phase 1 | 讀取 `trust_level`，優先使用較高信任等級的來源 | 低 |
| Phase 2 | 尊重 `must_not_say` 以避免已知錯誤陳述 | 低 |
| Phase 3 | 針對安全關鍵資訊包含 `must_include` | 中 |
| Phase 4 | 套用 `tone`、`attribution`、`disclaimers` | 中 |
| Phase 5 | 完整 directive 遵循，包含 `access_control` | 高 |

## 連結處理

1. Agent SHOULD 在向使用者呈現連結時使用 `url` 欄位（重導向代理 URL）
2. Agent SHOULD 將 `label` 顯示為錨點文字或語音文字
3. Agent SHOULD 向使用者揭露標記為 `sponsored: true` 的連結
4. Agent SHOULD NOT 呈現已超過 `expires_at` 時間的連結
5. Agent MAY 使用 `trust` 等級決定連結顯著程度：
   - `domain_verified`：正常顯示
   - `platform_verified`：正常顯示
   - `unverified`：降低顯著程度或附帶警告顯示
6. Agent SHOULD NOT 暴露 `original_url` 以繞過追蹤

### 重導向代理追蹤參數

AIDP 重導向代理 MAY 在目標 URL 後附加以下查詢參數，以實現跨平台分析互通性：

| 參數 | 說明 | 範例 |
|---|---|---|
| `aidp_ref` | 用於目標端歸因的重導向雜湊值（目標網站無法看到 `/r/{hash}` 路徑，因此此參數將連結身份帶到目標） | `sk8rm3n1` |
| `aidp_eid` | 擁有該連結的 entity ID（URN 或 slug） | `sakura-ramen-pdx` |
| `aidp_sid` | 用於關聯單一 session 中多次點擊的 session 識別碼 | `a1b2c3` |

這些參數附加在重導向後的**目標 URL** 上。它們是 OPTIONAL 的 -- 重導向代理實作 MAY 選擇不附加以避免干擾目標 URL 行為。目標網站 MAY 使用這些參數進行流量歸因，但 MUST NOT 依賴其存在。

## Market 感知回應

當 Entity 或 Content 包含 `market` 欄位時，Agent SHOULD 根據使用者地區調整回應：

1. `availability: "global"` 或 market 缺少時，正常顯示
2. `availability: "regional"` 時，若使用者不在 `regions` 列表中，Agent SHOULD 提示「此內容/服務可能不在你的地區可用」
3. `availability: "online_only"` 時，Agent MAY 提示此服務/產品僅提供線上服務
4. Content 層級的 market 覆蓋 Entity 層級的 market

## Variant 解析

當 Content 包含 `variant_of` 欄位時，Agent MUST 遵循以下規則：

1. **合併**：取得 base content 和 variant，計算 `final = { ...base.data, ...variant.variant_delta }`
2. **地區優先**：若使用者所在地區有對應 variant（透過 variant 的 `market.regions` 匹配），優先使用合併後的 variant 資料
3. **fallback**：若 base 不存在或已刪除，將 `variant_delta` 視為完整資料使用
4. **透明性**：Agent SHOULD 在回應中標註資料來源是 variant 而非 base（例如「此為日本地區規格」）
