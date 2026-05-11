---
description: SpeakSpec SDK 快取機制與成本控管：理解 SSR cache、調整 TTL、評估 server 負載權衡
---

# SDK 快取與成本控管

當你的網站採用 `@speakspec/nuxt`（或同等 SDK），每次 SSR 渲染頁面時，SDK 會在伺服器端向 SpeakSpec 拉取 entity 與 content directive，再把簽章嵌入 HTML 回傳給訪客。

這個動作會打到 SpeakSpec 的 well-known endpoints；訪客越多、流量越高。SDK 內建快取機制大幅降低真實 fetch 次數，但**快取 TTL 是你在「即時性 vs 成本 / 負載」之間的旋鈕**。本頁說明如何調。

## SDK 快取結構

```
人類訪客 / AI bot 訪問 customer.com/articles/etf
        │
        ▼
你的 Nuxt 伺服器（SSR）
        │
        ├── SDK 看 Nitro cache（記憶體層）
        │     ├─ Hit (最近 X 分內已抓過): 直接回，不打 SpeakSpec
        │     └─ Miss: 往下走
        │
        ├── SDK fetch SpeakSpec well-known endpoint（含 ETag）
        │     ├─ 304 Not Modified（最常見）: 用快取資料、refresh expiry
        │     └─ 200 + 新內容: 寫進 Nitro cache
        │
        └── 把 directive + signed _proof inline 嵌入 HTML 回給訪客
```

兩個 fetch 觸發點：
1. **Entity directive**（`/.well-known/aidp.json`）— 每次首頁 / 任意頁面 SSR 都需要
2. **Content directive**（`/.well-known/aidp/content/{id}.json`）— 渲染特定文章時

兩者都用同一套 TTL 設定。**SpeakSpec 端會同時對 entity 簽 _proof + 算 canonical_verify 計數**——這是 0.3 的設計：發布與驗證在 SSR 那一刻一起做完。

## 預設值

`@speakspec/nuxt` 預設 Nitro cache TTL = **5 分鐘**。這個值的意思：

- 一篇文章被連續訪問 100 次（5 分內）→ SpeakSpec 收 **1 次** SDK fetch
- 5 分後 cache miss → 再打一次

對中等流量網站（萬-十萬 PV/day），預設值 OK。

## 你想省更多錢？拉長 TTL

`nuxt.config.ts` 範例：

```ts
export default defineNuxtConfig({
  speakspec: {
    cache: {
      ttl: 60 * 60, // 1 小時
    },
  },
})
```

| TTL 設定 | SpeakSpec fetch 次數估計 | 即時性影響 |
|---|---|---|
| 1 分鐘 | 高（每 entity 每分一次最壞情況）| 內容更新後最慢 1 分內生效 |
| 5 分鐘（預設）| 中等 | 內容更新後最慢 5 分內生效 |
| 1 小時 | 低 | 內容更新後最慢 1 小時內生效 |
| 24 小時 | 極低 | **不建議**——遇到 directive 緊急更新（撤回、合規）會延誤 |

> **提醒**：SpeakSpec 在 content 更新時會送 `aidp.cache.invalidate` webhook 給你的 SDK——SDK 收到後會主動清對應 cache key，所以**長 TTL + webhook invalidation = 兩者最好的折衷**（少 fetch、變更仍即時生效）。確保你的 SDK 有正確處理 webhook（預設行為，不需額外配置）。

## 但是太長會出問題：你的 server 負載

SDK 把抓到的 directive 寫入 Nitro cache 後，SSR 會把整段 directive **inline 嵌入 HTML**。這是 SSR 那一刻發生的——SpeakSpec server 負載低，但**你的 SSR server 負載照樣每次有頁面被訪問就要做一次模板渲染**。

Cache TTL 太長對 SpeakSpec 是好事，但**對你的 SSR server 沒有幫助**（你的渲染負載跟訪客數成正比，跟 cache TTL 無關）。

如果你的 server 已經滿載（CPU 高、回應變慢），不是調 cache 就能解——你要看：

- **CDN 設定**：對 SSR 過的頁面加 `Cache-Control: public, s-maxage=300`、讓 Cloudflare / Vercel Edge 把整個 HTML 也 cache 起來
- **ISR / SSG**：對更新不頻繁的內容，改用 `nuxt build --prerender` 或 ISR 而不是 SSR
- **降級回 client-side fetch**：只在 SPA 模式下才需要 SDK 簽章 inline；如果你不需要 SEO，可以延遲到 client 端

## SDK fetch 月硬上限（429 處理）

每個方案有一個 `sdk_fetch_max_monthly` 月硬上限（free=quota；paid=quota×10）。撞到上限後，SpeakSpec 的 well-known endpoints 回 **HTTP 429 + `Retry-After` header**（指向下個月初）。

**SDK 必須 graceful 處理，不能讓客戶網站破圖**：

1. 收到 429 → 不要視為錯誤；視為「本月上限到了」訊號
2. 優先使用最後一次成功的 cache（即使已過期）
3. 如果 cache 也沒有 → **不 inline AIDP 簽章**，但**正常渲染頁面 HTML**
4. 訪客不會察覺；AI 端會看到無 `_proof` 的頁面（視為未驗證內容）

預設 `@speakspec/nuxt` SDK 已實作此 fallback。自製 SDK 請參考。

> **為什麼擋而不是收費**：v3 簡化決策——traffic 真實成本相對訂閱費極低（< 0.5%），固定 tier + 硬上限比 metered overage billing 對客戶更友善（無 surprise bill），對工程也更省事（無 tier 同步、無 push pipeline）。客戶撞上限頻繁 → 升級到下一 tier。

## Canonical verify 配額（AI 端流量）

跟 SDK fetch（你網站訪客觸發）不同——`canonical_verify` 是 **AI vendor 端**的流量：當 AI 在引用內容時，會打 SpeakSpec 的 `/v/:aidpId/:contentId` 確認簽章與當下 directive 仍然一致。

- 這個流量你**不可控**——AI vendor 自己決定要不要驗
- 我們監測得到，且**這個會直接影響你 SpeakSpec 訂閱的成本**
- 月配額 + 超量計費（依你的方案 tier，見 `/pricing`）

## 建議的調 TTL 實務流程

1. **觀察**：上線後 1-2 週，從 SpeakSpec dashboard 看到你 entity 的 SDK fetch 次數
2. **算成本**：SDK fetch quota 用了多少？離超量加錢還有多遠？
3. **TTL 微調**：如果接近超量、且網站 directive 變動不頻繁 → 拉長到 15-30 分鐘
4. **驗證 webhook**：確認 cache-invalidation webhook 在 SDK 端正確接收（dashboard webhooks 區看 delivery log）

> **內部極限**：SpeakSpec 對 well-known endpoints 在 IP 層也有 rate limit（30 req/min 起跳）；正常 SDK 流量不會碰到，但極短 TTL + 大量 cache miss 偶爾會撞到——再次強調：**不建議低於 1 分鐘 TTL**。

## 相關文件

- [REST API](./rest-api.md)
- [MCP 整合](./mcp-integration.md)
- [pricing](/pricing)（方案配額 + 超量單價）
