---
description: SpeakSpec @speakspec/next — AIDP 0.3 SDK for Next.js 15 (App Router)
---

# Next.js SDK: `@speakspec/next`

`@speakspec/next` is the SpeakSpec integration package for Next.js 15 (App Router). It turns your Next site into a first-class AIDP 0.3 source — publishes the entity directive, signed content envelopes, paginated content directory, injects `<link rel="aidp">` head tags, receives cache-invalidation webhooks, and observes AI-crawler traffic for upload to your dashboard. Feature-equivalent to [`@speakspec/nuxt`](/en/developer/sdk-nuxt).

## Install

```bash
pnpm add @speakspec/next
```

## Configure (env vars)

```env
# .env.local
SPEAKSPEC_ENTITY_ID=your-entity-slug
SPEAKSPEC_API_KEY=aidp_xxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
NEXT_PUBLIC_SPEAKSPEC_SITE_ORIGIN=https://yoursite.com
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

| Variable | Required | Notes |
|---|---|---|
| `SPEAKSPEC_ENTITY_ID` | ✅ | AIDP entity id (provided by your SpeakSpec dashboard) |
| `SPEAKSPEC_API_KEY` | ✅ | SpeakSpec API key (`aidp_…`), server-side only |
| `SPEAKSPEC_WEBHOOK_SECRET` | when webhook route reachable | Verifies §8.10 cache-invalidation webhook |
| `NEXT_PUBLIC_SPEAKSPEC_SITE_ORIGIN` | recommended | Canonical origin of your site |
| `SPEAKSPEC_BOT_TRACKING` | — | Enables AI crawler detection (`true` / `false`) |
| `SPEAKSPEC_BOT_UPLOAD` | — | Enables impression upload to SpeakSpec |

## Wire the well-known routes

One Route Handler file per AIDP endpoint:

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
export const runtime = 'nodejs'  // HMAC verification requires Node runtime
export const POST = aidpWebhookRoute()
```

## Wire the bot-detection middleware

```ts
// middleware.ts (project root)
import { aidpBotMiddleware } from '@speakspec/next/middleware'
export default aidpBotMiddleware()

export const config = {
  matcher: '/((?!_next/static|_next/image|api/_aidp/invalidate|favicon.ico).*)',
}
```

## Inject `<link rel="aidp">` tags

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

For per-page binding on article / product / policy pages, render `<AidpContent />` to register the (path → content_id) mapping. Subsequent AI crawler hits on that path are enriched with `content_id`:

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

## Cache layer

The SDK ships an in-memory cache by default — fine for single-instance deployments and warm Vercel functions. Multi-instance (or wanting durability across cold starts) customers can plug in a Redis-backed or fs-backed store at boot:

```ts
// app/instrumentation.ts
import { setCacheStore } from '@speakspec/next'
import { redisStore } from './my-cache'

export function register() {
  setCacheStore(redisStore)
}
```

Any object satisfying:

```ts
interface FullStore {
  getItem<T>(key: string): Promise<T | null>
  setItem(key: string, value: unknown): Promise<void>
  removeItem(key: string): Promise<void>
  getKeys(base: string): Promise<string[]>  // prefix match
}
```

works.

## Cache tuning

Three well-known routes carry `Cache-Control` headers — Cloudflare / CloudFront read them directly to bound revocation propagation. Full trade-off in [SDK cache tuning](/en/developer/sdk-cache-tuning).

```env
# Defaults
SPEAKSPEC_CACHE_TTL_SEC=300              # SDK internal
SPEAKSPEC_ENTITY_MAX_AGE=60              # /.well-known/aidp.json
SPEAKSPEC_ENTITY_SWR=300
SPEAKSPEC_CONTENT_MAX_AGE=300            # /.well-known/aidp/content/[id]
SPEAKSPEC_CONTENT_SWR=600
SPEAKSPEC_DIRECTORY_MAX_AGE=60           # /.well-known/aidp/content
SPEAKSPEC_DIRECTORY_SWR=300
```

## Impression upload (opt-in)

With `SPEAKSPEC_BOT_TRACKING=true`, middleware detects 14 known AI crawlers and prints JSON to stdout. Add `SPEAKSPEC_BOT_UPLOAD=true` to also batch fire-and-forget POST impressions to SpeakSpec.

Design guarantees mirror the Nuxt SDK: never blocks SSR, fallback to stdout on failure, memory-bounded queue, IP only hashed never stored. See [Nuxt SDK § Impression upload](/en/developer/sdk-nuxt#impression-upload-opt-in).

## Caveats vs `@speakspec/nuxt`

- **Edge runtime**: bot-detect middleware is Edge-safe; impression queue uses `fetch` + `console.log` only — also Edge-safe. Webhook receiver uses `node:crypto` for HMAC and **must** run in Node runtime (the example above already pins `export const runtime = 'nodejs'`).
- **Multi-instance**: in-memory cache + impression queue are per-process. Vercel cold starts may drop in-flight impressions — acceptable per fire-and-forget design. For shared persistence use `setCacheStore`.
- **First-hit content_id**: `<AidpContent />` registers on render, so the very first AI crawler hit on a path lands with `content_id=null`. Subsequent hits are enriched.

## Spec & references

- [AIDP 0.3 §4.8 Cryptographic Proof](/en/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/en/spec/transport)
- [Authenticated API](/en/api/authenticated)
- [SDK cache tuning](/en/developer/sdk-cache-tuning)
