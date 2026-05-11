# Nuxt SDK：`@speakspec/nuxt`

`@speakspec/nuxt` 是 SpeakSpec 提供的 Nuxt 4 模組，把您的 Nuxt 站台直接變成 AIDP 0.3 來源 — publish 客戶 entity directive、signed content envelope、paginated content directory，並把客戶 origin 上的 AI crawler 訪問批次回送 SpeakSpec 後台供分析。

## 安裝

```bash
pnpm add @speakspec/nuxt
```

## 設定

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@speakspec/nuxt'],
  speakspec: {
    entityId: process.env.SPEAKSPEC_ENTITY_ID,
    apiKey: process.env.SPEAKSPEC_API_KEY,
    webhookSecret: process.env.SPEAKSPEC_WEBHOOK_SECRET,
    siteOrigin: process.env.NUXT_PUBLIC_SITE_URL,
    botTracking: {
      enabled: true,
      upload: { enabled: true },
    },
  },
})
```

| 設定 | 必填 | 預設 | 說明 |
|---|---|---|---|
| `entityId` | ✅ | — | SpeakSpec entity 的 AIDP id（dashboard 提供） |
| `apiKey` | ✅ | — | SpeakSpec API key（`aidp_…`），server-side only |
| `webhookSecret` | webhook 路由可達時 | — | 驗證 §8.10 cache-invalidation webhook |
| `siteOrigin` | 推薦 | — | 您站台的正式 origin（用於組 absolute URL） |
| `endpoint` | — | `https://api.speakspec.com` | SpeakSpec API base，可指向 staging |
| `botTracking.enabled` | — | `false` | 開啟 AI crawler 偵測中介層 |
| `botTracking.upload.enabled` | — | `false` | 開啟把 impression 上送 SpeakSpec |
| `botTracking.upload.batchSize` | — | `50` | 滿 N 筆 flush |
| `botTracking.upload.flushIntervalMs` | — | `60000` | 滿 N 毫秒 flush |
| `botTracking.upload.maxQueueBytes` | — | `2097152` | queue 上限（防記憶體爆） |
| `botTracking.upload.onError` | — | `fallback-stdout` | upload 失敗時 `fallback-stdout` 印 stdout 或 `silent` |
| `botTracking.excludePaths` | — | `['/_nuxt/', '/api/_aidp/']` | 中介層跳過的 path prefix |

## 自動暴露的 well-known 路由

| 路由 | 用途 |
|---|---|
| `GET /.well-known/aidp.json` | Entity directive（含 cache、ETag、`If-None-Match → 304`） |
| `GET /.well-known/aidp/content/{id}.json` | 簽過的 Content envelope（§8.7） |
| `GET /.well-known/aidp/content` 與 `/content/` | 分頁 content directory（§8.8，支援 `page` / `page_size` / `type` / `language` / `updated_since`） |
| `POST /api/_aidp/invalidate` | §8.10 cache-invalidation webhook 接收（HMAC + 64 KB cap + replay 視窗） |

每頁如果是文章 / 商品 / 政策內容，呼叫 `useAidpContent({ id })` 注入 `<link rel="aidp-content">` 並把 (path → content_id) 對應註冊進 SDK，讓後續 AI 訪問該 path 的 impression 帶上 content_id：

```vue
<script setup lang="ts">
const article = await useFetch(...)
useAidpContent({ id: article.value.id })
</script>
```

## Impression upload（opt-in）

`botTracking.enabled` 開啟後，SDK 中介層會偵測 14 種已知 AI crawler（GPTBot / ClaudeBot / PerplexityBot / Google-Extended / CCBot / Bytespider / cohere-ai / Diffbot / Applebot-Extended / meta-externalagent / 等）。預設只印 JSON 到 stdout 給您自己的 log pipeline 接。

進一步開啟 `botTracking.upload.enabled` 後，SDK 會把每筆 impression 排入記憶體 queue，滿 batch（預設 50 筆 / 60 秒）後 fire-and-forget POST 到：

```
POST {endpoint}/api/v1/impressions
X-API-Key: aidp_xxx
Content-Type: application/json

{
  "impressions": [
    {
      "user_agent": "Mozilla/5.0 (compatible; GPTBot/1.2; ...)",
      "path": "/articles/etf-explainer-2026-04",
      "content_id": "etf-explainer-2026-04",
      "client_ip": "20.171.x.x"
    }
  ]
}
```

> SDK 不送預先分類好的 `crawler` 欄位 — 伺服端用 `user_agent` 走 `ClassifyAgent` 推導，避免 SDK 與 server 兩邊 pattern 不同步。

伺服端把這些紀錄寫進既有 `impressions` 表 + continuous aggregates，`source_type` 為 `sdk_origin`，dashboard 端 `/dashboard/analytics` 的 source pie 會獨立顯示「SDK Origin（您網站被 AI 抓的訪問）」分桶。

### 設計保證

- **絕不阻擋 SSR**：upload 走 fire-and-forget，超時 5 秒，連續 5 次失敗自動 backoff 5 分鐘
- **失敗 fallback**：upload 失敗的 impression 落地 stdout（除非設 `onError: 'silent'`），保證您仍從 log 拿到完整訊號
- **記憶體上限**：queue 超過 `maxQueueBytes` 時自動 drop 最舊（同樣 fallback log），防記憶體爆
- **隱私**：`client_ip` 僅作為 `visitor_hash` 計算來源（`sha256(ip + ua + entity_salt)`），不存 raw IP
- **訊號語意**：sdk_origin 行的「unique_visitors」HLL 數值 ≈ 獨立 AI bot session（非人類訪客）

### 不開啟 upload 時呢？

預設 `upload.enabled = false`，中介層僅 `console.log(JSON.stringify(impression))`。可接 Loki / Datadog / Vector + BigQuery 等任何 log pipeline 自行分析；SpeakSpec dashboard 在這個模式下看不到您網域的 AI 流量。

## CLI：`speakspec`

驗證部署的 helper：

```bash
pnpm speakspec validate-keys https://api.speakspec.com
pnpm speakspec verify-bundle https://yoursite.com/.well-known/aidp/content/etf-explainer.json
pnpm speakspec test-revocation https://api.speakspec.com
```

成功 exit 0；失敗 exit 1 + stderr 帶 `reason=…`（12 種 spec 對應的失敗模式）。

## 架構限制

- **Multi-instance 部署**：queue 為 in-process，每個 Nitro worker 各有自己的 queue。Vercel Serverless 在 warm 狀態 OK；Cloudflare Workers / 短生命週期 worker 不適用此 queue（cold start 會丟未 flush 的 impression）— 後續會推 Cloudflare edge ingest 模式
- **首次訪問該 path 時 content_id 未知**：因為 `useAidpContent` 在頁面渲染時才註冊；首次 AI 訪問會以 `content_id=null` 入庫；同 path 後續訪問才被 enrich
- **upload 模式下 SpeakSpec server 會記錄 client_ip → visitor_hash**：若您的法遵流程禁止任何形式的 IP 雜湊，請保持 `upload.enabled = false`
