---
description: SpeakSpec @speakspec/next — Next.js 15 (App Router) 的 AIDP 0.3 SDK
---

# Next.js SDK：`@speakspec/next`

`@speakspec/next` 是 SpeakSpec 提供的 Next.js 15（App Router）整合套件，把您的 Next 站台直接變成 AIDP 0.3 來源 — publish entity directive、signed content envelope、paginated content directory、注入 `<link rel="aidp">` head 標籤、接收 cache-invalidation webhook，並把 AI crawler 訪問批次回送 SpeakSpec 後台。功能對齊 [`@speakspec/nuxt`](/developer/sdk-nuxt)。

## 安裝

```bash
pnpm add @speakspec/next
```

## 設定（環境變數）

```env
# .env.local
SPEAKSPEC_ENTITY_ID=urn:aidp:entity:your-slug
SPEAKSPEC_API_KEY=aidp_xxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
NEXT_PUBLIC_SPEAKSPEC_SITE_ORIGIN=https://yoursite.com
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

| 變數 | 必填 | 說明 |
|---|---|---|
| `SPEAKSPEC_ENTITY_ID` | ✅ | SpeakSpec entity 的 AIDP id。**必須是完整 URN 格式 `urn:aidp:entity:<slug>`**（dashboard 的 Slug 欄位顯示的就是這串完整值；填短 slug 會 404）|
| `SPEAKSPEC_API_KEY` | ✅ | SpeakSpec API key（`aidp_…`），server-side only |
| `SPEAKSPEC_WEBHOOK_SECRET` | webhook 路由可達時 | 驗證 §8.10 cache-invalidation webhook |
| `NEXT_PUBLIC_SPEAKSPEC_SITE_ORIGIN` | 推薦 | 您站台的正式 origin |
| `SPEAKSPEC_BOT_TRACKING` | — | 開啟 AI crawler 偵測（`true` / `false`）|
| `SPEAKSPEC_BOT_UPLOAD` | — | 開啟把 impression 上送 SpeakSpec |

## Wire well-known 路由

每個 AIDP endpoint 對應一個 Route Handler 檔案：

```ts
// app/.well-known/aidp.json/route.ts
import { aidpEntityRoute } from '@speakspec/next'
export const GET = aidpEntityRoute()
```

```ts
// app/.well-known/aidp/content/[id]/route.ts
import { aidpContentRoute } from '@speakspec/next'
export const GET = aidpContentRoute()
```

```ts
// app/.well-known/aidp/content/route.ts
import { aidpDirectoryRoute } from '@speakspec/next'
export const GET = aidpDirectoryRoute()
```

```ts
// app/api/_aidp/invalidate/route.ts
import { aidpWebhookRoute } from '@speakspec/next'
export const runtime = 'nodejs'  // HMAC 驗證需要 Node runtime
export const POST = aidpWebhookRoute()
```

## Wire bot-detect middleware

```ts
// middleware.ts (專案根目錄)
import { aidpBotMiddleware } from '@speakspec/next/middleware'
export default aidpBotMiddleware()

export const config = {
  matcher: '/((?!_next/static|_next/image|api/_aidp/invalidate|favicon.ico).*)',
}
```

## 注入 `<link rel="aidp">` 標籤

```tsx
// app/layout.tsx
import { AidpLinks } from '@speakspec/next/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <head><AidpLinks /></head>
      <body>{children}</body>
    </html>
  )
}
```

每頁如果是文章 / 商品 / 政策內容，渲染 `<AidpContent />` 把 (path → content_id) 對應註冊進 SDK，後續 AI 訪問該 path 的 impression 帶上 content_id：

```tsx
// app/articles/[id]/page.tsx
import { AidpContent } from '@speakspec/next/react'

export default async function ArticlePage({ params }) {
  const article = await loadArticle((await params).id)
  return (
    <>
      <AidpContent contentId={article.id} pathname={`/articles/${article.id}`} />
      <article>{article.body}</article>
    </>
  )
}
```

## Cache 層

預設 in-memory cache（單實例 / warm Vercel function 適用）。多實例或希望 cold start 後仍持久，於 boot 注入自訂 store：

```ts
// app/instrumentation.ts
import { setCacheStore } from '@speakspec/next'
import { redisStore } from './my-cache'

export function register() {
  setCacheStore(redisStore)
}
```

任何符合下列介面的物件都可作為 store：

```ts
interface FullStore {
  getItem<T>(key: string): Promise<T | null>
  setItem(key: string, value: unknown): Promise<void>
  removeItem(key: string): Promise<void>
  getKeys(base: string): Promise<string[]>  // prefix match
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

`SPEAKSPEC_BOT_TRACKING=true` 開啟後，middleware 偵測 14 種已知 AI crawler；只印 JSON 到 stdout。再加 `SPEAKSPEC_BOT_UPLOAD=true` 才會把 impression 排隊批次 fire-and-forget POST 到 SpeakSpec。

設計保證跟 Nuxt SDK 一致：絕不阻擋 SSR、失敗 fallback stdout、記憶體上限、僅雜湊 IP 不存 raw。詳見 [Nuxt SDK § Impression upload](/developer/sdk-nuxt#impression-upload-opt-in)。

## 跟 `@speakspec/nuxt` 的差異

- **Edge runtime**：bot-detect middleware Edge-safe；impression queue 用 `fetch` + `console.log` 也是 Edge-safe。但 webhook receiver 用 `node:crypto` 驗 HMAC，**必須** pin 在 Node runtime（範例已含 `export const runtime = 'nodejs'`）。
- **Multi-instance**：in-memory cache + impression queue 都是 per-process。Vercel cold start 可能丟掉飛行中的 impression — 屬於可接受的 fire-and-forget 設計；要跨實例共用 cache 用 `setCacheStore`。
- **首次訪問 path 時 content_id 未知**：`<AidpContent />` 在 render 時才註冊；首次 AI 訪問落地 `content_id=null`，同 path 後續訪問才被 enrich。

## 規範參考

- [AIDP 0.3 §4.8 Cryptographic Proof](/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/spec/transport)
- [Authenticated API](/api/authenticated)
- [SDK cache tuning](/developer/sdk-cache-tuning)
