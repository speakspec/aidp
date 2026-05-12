---
description: SpeakSpec @speakspec/astro — AIDP 0.3 SDK for Astro 5
---

# Astro SDK: `@speakspec/astro`

`@speakspec/astro` is the SpeakSpec integration package for Astro 5. It turns your Astro site into a first-class AIDP 0.3 source — publishes the entity directive, signed content envelopes, paginated content directory, injects `<link rel="aidp">` head tags, receives cache-invalidation webhooks, and observes AI-crawler traffic for upload to your dashboard. Feature-equivalent to [`@speakspec/nuxt`](/en/developer/sdk-nuxt) and [`@speakspec/next`](/en/developer/sdk-next).

## Install

```bash
pnpm add @speakspec/astro
```

## Configure (env vars)

```env
# .env
SPEAKSPEC_ENTITY_ID=urn:aidp:entity:your-slug
SPEAKSPEC_API_KEY=aidp_xxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
PUBLIC_SPEAKSPEC_SITE_ORIGIN=https://yoursite.com
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

| Variable | Required | Notes |
|---|---|---|
| `SPEAKSPEC_ENTITY_ID` | ✅ | SpeakSpec entity AIDP id. **Must be the full URN form `urn:aidp:entity:<slug>`** (the Slug field on the dashboard shows this full value; using a bare slug returns 404) |
| `SPEAKSPEC_API_KEY` | ✅ | SpeakSpec API key (`aidp_…`), server-side only |
| `SPEAKSPEC_WEBHOOK_SECRET` | when webhook route reachable | Verifies §8.10 cache-invalidation webhook |
| `PUBLIC_SPEAKSPEC_SITE_ORIGIN` | recommended | Canonical origin of your site |
| `SPEAKSPEC_BOT_TRACKING` | — | Enables AI crawler detection (`true` / `false`) |
| `SPEAKSPEC_BOT_UPLOAD` | — | Enables impression upload to SpeakSpec |

## Wire the well-known routes

Astro requires `output: 'server'` (or `'hybrid'`) to serve dynamic API routes. One file per AIDP endpoint:

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
// src/pages/api/aidp/invalidate.ts  ← NO leading underscore
import { aidpWebhookRoute } from '@speakspec/astro'
export const POST = aidpWebhookRoute()
```

> Astro 5 excludes any path segment starting with `_` from routing (treats it as private). Use `api/aidp/...` (no leading underscore). The webhook URL you register with the SpeakSpec dashboard must match.

## Wire the bot-detection middleware

```ts
// src/middleware.ts
import { aidpBotMiddleware } from '@speakspec/astro/middleware'
export const onRequest = aidpBotMiddleware()
```

If you already have middleware, sequence them:

```ts
import { sequence } from 'astro:middleware'
import { aidpBotMiddleware } from '@speakspec/astro/middleware'

export const onRequest = sequence(myExisting, aidpBotMiddleware())
```

## Inject `<link rel="aidp">` tags

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

For per-page binding on article / product / policy pages, render `<AidpContent />` to register the (path → content_id) mapping:

```astro
---
// src/pages/articles/[id].astro
import AidpContent from '@speakspec/astro/components/AidpContent.astro'
const article = await loadArticle(Astro.params.id)
---
<AidpContent contentId={article.id} pathname={`/articles/${article.id}`} />
<article set:html={article.body} />
```

## Cache layer

In-memory cache by default. Multi-instance customers plug in Redis / fs / etc. at boot:

```ts
// src/server-init.ts (called from astro:server:setup integration)
import { setCacheStore } from '@speakspec/astro'
import { redisStore } from './my-cache'

setCacheStore(redisStore)
```

Any object satisfying:

```ts
interface FullStore {
  getItem<T>(key: string): Promise<T | null>
  setItem(key: string, value: unknown): Promise<void>
  removeItem(key: string): Promise<void>
  getKeys(base: string): Promise<string[]>
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

- **Output mode**: requires Astro `output: 'server'` or `'hybrid'` for API routes to be dynamic. Default `'static'` bakes all routes at build time and won't update directives without a rebuild.
- **Multi-instance**: in-memory cache + impression queue are per-process. Customers running on Cloudflare or similar edge platforms should provide a Redis-backed cache via `setCacheStore`.
- **First-hit content_id**: `<AidpContent />` registers on render, so the very first AI crawler hit on a path lands with `content_id=null`. Subsequent hits are enriched.

## Why Astro is a priority SDK for SpeakSpec

Astro's audience overlaps heavily with SpeakSpec's — blogs / content sites / marketing pages / docs sites are exactly what AI agents crawl most aggressively. AIDP 0.3's value prop (signing + revocation + observability) has the highest ROI on these properties.

## Spec & references

- [AIDP 0.3 §4.8 Cryptographic Proof](/en/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/en/spec/transport)
- [Authenticated API](/en/api/authenticated)
- [SDK cache tuning](/en/developer/sdk-cache-tuning)
