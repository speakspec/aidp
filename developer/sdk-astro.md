---
description: SpeakSpec @speakspec/astro — Astro 5 的 AIDP 0.3 SDK
---

# Astro SDK：`@speakspec/astro`

`@speakspec/astro` 是 SpeakSpec 提供的 Astro 5 整合套件，把您的 Astro 站台直接變成 AIDP 0.3 來源 — publish entity directive、signed content envelope、paginated content directory、注入 `<link rel="aidp">` head 標籤、接收 cache-invalidation webhook，並把 AI crawler 訪問批次回送 SpeakSpec 後台。功能對齊 [`@speakspec/nuxt`](/developer/sdk-nuxt) 與 [`@speakspec/next`](/developer/sdk-next)。

## 安裝

```bash
pnpm add @speakspec/astro
```

## 設定（環境變數）

```env
# .env
SPEAKSPEC_ENTITY_ID=urn:aidp:entity:your-slug
SPEAKSPEC_API_KEY=aidp_xxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
PUBLIC_SPEAKSPEC_SITE_ORIGIN=https://yoursite.com
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

| 變數 | 必填 | 說明 |
|---|---|---|
| `SPEAKSPEC_ENTITY_ID` | ✅ | SpeakSpec entity 的 AIDP id。**必須是完整 URN 格式 `urn:aidp:entity:<slug>`**（dashboard 的 Slug 欄位顯示的就是這串完整值；填短 slug 會 404）|
| `SPEAKSPEC_API_KEY` | ✅ | SpeakSpec API key（`aidp_…`），server-side only |
| `SPEAKSPEC_WEBHOOK_SECRET` | webhook 路由可達時 | 驗證 §8.10 cache-invalidation webhook |
| `PUBLIC_SPEAKSPEC_SITE_ORIGIN` | 推薦 | 您站台的正式 origin |
| `SPEAKSPEC_BOT_TRACKING` | — | 開啟 AI crawler 偵測（`true` / `false`）|
| `SPEAKSPEC_BOT_UPLOAD` | — | 開啟把 impression 上送 SpeakSpec |

## Wire well-known 路由

Astro 必須是 `output: 'server'` 或 `output: 'hybrid'` 才能服務動態 API 路由。每個 AIDP endpoint 對應一支檔案：

```ts
// src/pages/.well-known/aidp.json.ts
import { aidpEntityRoute } from '@speakspec/astro'
export const GET = aidpEntityRoute()
```

```ts
// src/pages/.well-known/aidp/content/[id].json.ts
import { aidpContentRoute } from '@speakspec/astro'
export const GET = aidpContentRoute()
```

```ts
// src/pages/.well-known/aidp/content/index.ts
import { aidpDirectoryRoute } from '@speakspec/astro'
export const GET = aidpDirectoryRoute()
```

```ts
// src/pages/api/aidp/invalidate.ts  ← 開頭不能有底線
import { aidpWebhookRoute } from '@speakspec/astro'
export const POST = aidpWebhookRoute()
```

> Astro 5 把任何以 `_` 開頭的 path 段視為私有目錄，不會被路由。webhook 路徑用 `api/aidp/...`（無底線）。在 SpeakSpec dashboard 註冊的 webhook URL 必須對齊。

## Wire bot-detect middleware

```ts
// src/middleware.ts
import { aidpBotMiddleware } from '@speakspec/astro/middleware'
export const onRequest = aidpBotMiddleware()
```

如果已有自己的 middleware，用 `sequence`：

```ts
import { sequence } from 'astro:middleware'
import { aidpBotMiddleware } from '@speakspec/astro/middleware'

export const onRequest = sequence(myExisting, aidpBotMiddleware())
```

## 注入 `<link rel="aidp">` 標籤

```astro
---
// src/layouts/BaseLayout.astro
import AidpLinks from '@speakspec/astro/components/AidpLinks.astro'
---
<html>
  <head><AidpLinks /></head>
  <body><slot /></body>
</html>
```

每頁如果是文章 / 商品 / 政策內容，渲染 `<AidpContent />` 把 (path → content_id) 對應註冊進 SDK：

```astro
---
// src/pages/articles/[id].astro
import AidpContent from '@speakspec/astro/components/AidpContent.astro'
const article = await loadArticle(Astro.params.id)
---
<AidpContent contentId={article.id} pathname={`/articles/${article.id}`} />
<article set:html={article.body} />
```

## Cache 層

預設 in-memory cache。多實例或希望 cold start 後仍持久，於 boot 注入自訂 store：

```ts
// src/server-init.ts (透過 astro:server:setup integration 呼叫)
import { setCacheStore } from '@speakspec/astro'
import { redisStore } from './my-cache'

setCacheStore(redisStore)
```

任何符合下列介面的物件都可作為 store：

```ts
interface FullStore {
  getItem<T>(key: string): Promise<T | null>
  setItem(key: string, value: unknown): Promise<void>
  removeItem(key: string): Promise<void>
  getKeys(base: string): Promise<string[]>
}
```

## Cache 調校

three well-known 路由各自帶 `Cache-Control` header — Cloudflare / CloudFront 等 CDN 直接吃這些 header 來決定撤銷傳播速度。完整 trade-off 參考 [SDK cache tuning](/developer/sdk-cache-tuning)。

```env
# 預設值
SPEAKSPEC_CACHE_TTL_SEC=300              # SDK 內部
SPEAKSPEC_ENTITY_MAX_AGE=60              # /.well-known/aidp.json
SPEAKSPEC_ENTITY_SWR=300
SPEAKSPEC_CONTENT_MAX_AGE=300            # /.well-known/aidp/content/[id]
SPEAKSPEC_CONTENT_SWR=600
SPEAKSPEC_DIRECTORY_MAX_AGE=60           # /.well-known/aidp/content
SPEAKSPEC_DIRECTORY_SWR=300
```

## Impression upload（opt-in）

`SPEAKSPEC_BOT_TRACKING=true` 開啟後，middleware 偵測 14 種已知 AI crawler；只印 JSON 到 stdout。再加 `SPEAKSPEC_BOT_UPLOAD=true` 才會把 impression 批次 fire-and-forget POST 到 SpeakSpec。

設計保證跟 Nuxt SDK 一致：絕不阻擋 SSR、失敗 fallback stdout、記憶體上限、僅雜湊 IP 不存 raw。詳見 [Nuxt SDK § Impression upload](/developer/sdk-nuxt#impression-upload-opt-in)。

## 跟 `@speakspec/nuxt` 的差異

- **Output 模式**：必須是 `output: 'server'` 或 `'hybrid'`。預設 `'static'` 會在 build time 把所有路由 bake 成靜態檔案，不會回應 directive 變更。
- **Multi-instance**：in-memory cache + impression queue 都是 per-process。跑 Cloudflare 或類似 edge 平台的客戶請用 `setCacheStore` 注入 Redis-backed cache。
- **首次訪問 path 時 content_id 未知**：`<AidpContent />` 在 render 時才註冊；首次 AI 訪問落地 `content_id=null`，同 path 後續訪問才被 enrich。

## 為什麼 Astro 是 SpeakSpec 重點 SDK

Astro 客群跟 SpeakSpec 重疊極高 — blog / 內容站 / marketing 網站 / docs 站，都是 AI agent 頻繁抓的目標。AIDP 0.3 的價值（簽章 + 撤銷 + 觀測）對這類站台 ROI 最高。

## 規範參考

- [AIDP 0.3 §4.8 Cryptographic Proof](/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/spec/transport)
- [Authenticated API](/api/authenticated)
- [SDK cache tuning](/developer/sdk-cache-tuning)
