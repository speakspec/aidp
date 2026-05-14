---
description: SpeakSpec SDK cache mechanism and cost control — understand SSR cache, tune TTL, weigh server load tradeoffs
---

# SDK Cache & Cost Control

When your site adopts `@speakspec/nuxt` (or equivalent SDK), each SSR render fetches entity & content directives from SpeakSpec on the server side, embeds the signature inline in the HTML, and returns to the visitor.

This hits SpeakSpec's well-known endpoints — more visitors, more traffic. The SDK's built-in cache greatly reduces real fetch counts, but **the cache TTL is the dial you control between "freshness vs cost / load"**. This page explains how to tune it.

## SDK cache architecture

```
human visitor / AI bot → customer.com/articles/etf
        │
        ▼
your Nuxt server (SSR)
        │
        ├── SDK checks Nitro cache (in-memory)
        │     ├─ Hit (within last X min): return immediately, no SpeakSpec call
        │     └─ Miss: continue
        │
        ├── SDK fetches SpeakSpec well-known endpoint (with ETag)
        │     ├─ 304 Not Modified (most common): use cached data, refresh expiry
        │     └─ 200 + new content: write to Nitro cache
        │
        └── inline directive + signed _proof into HTML to visitor
```

Two fetch trigger points:
1. **Entity directive** (`/.well-known/aidp.json`) — needed on every page SSR
2. **Content directive** (`/.well-known/aidp/content/{id}.json`) — when rendering a specific article

Both share the same TTL. **SpeakSpec also signs `_proof` and increments `canonical_verify` counters at this moment** — this is by design in 0.3: publication and verification happen together at SSR time.

## Default

`@speakspec/nuxt` default Nitro cache TTL = **5 minutes**. Meaning:

- An article hit 100 times in 5 min → SpeakSpec sees **1** SDK fetch
- After 5 min, next hit → cache miss → one more fetch

For mid-traffic sites (10k-100k PV/day), the default is fine.

## Want to save more? Lengthen the TTL

`nuxt.config.ts` example:

```ts
export default defineNuxtConfig({
  speakspec: {
    cache: {
      ttl: 60 * 60, // 1 hour
    },
  },
})
```

| TTL | SpeakSpec fetch volume | Freshness impact |
|---|---|---|
| 1 minute | High (worst case 1/entity/min) | Content update visible within 1 min |
| 5 minutes (default) | Medium | Visible within 5 min |
| 1 hour | Low | Visible within 1 hour |
| 24 hours | Very low | **Not recommended** — directive emergency updates (revoke, compliance) get delayed |

> **Note**: SpeakSpec sends `aidp.cache.invalidate` webhooks to your SDK on content updates — the SDK actively clears the matching cache key on receipt. So **long TTL + webhook invalidation = best of both worlds** (fewer fetches, updates still propagate). Confirm your SDK handles the webhook (default behavior, no config needed).

## But too-long TTL hits another wall: your server load

After SDK caches the fetched directive, SSR **inlines it into HTML**. That happens at every SSR render — SpeakSpec load is light, but **your SSR server load still scales with visitor count regardless of cache TTL**.

Long cache TTL helps SpeakSpec, but **doesn't help your SSR server** (your render load is proportional to visitors, not TTL).

If your server is already saturated (high CPU, slow responses), cache tuning won't help. Look at:

- **CDN config**: add `Cache-Control: public, s-maxage=300` on SSR responses; let Cloudflare / Vercel Edge cache the entire HTML
- **ISR / SSG**: for low-update-frequency content, switch to `nuxt build --prerender` or ISR instead of SSR
- **Client-side fallback**: if SEO isn't critical, defer SDK signing to the client side

## ⚠️ CDNs don't cache well-known JSON endpoints by default

The SDK already sets correct `Cache-Control` headers on `/.well-known/aidp.json`, `/.well-known/aidp/content/{id}.json`, and `/.well-known/aidp/content/` (e.g. `public, max-age=60, stale-while-revalidate=300`). But **Cloudflare, CloudFront, and Vercel Edge do not automatically cache JSON / HTML responses by default** — only static assets (`.js`, `.css`, `.png`, …) get cached out of the box.

The result: every well-known request hits your origin. If your response shows `cf-cache-status: DYNAMIC`, this is what's happening.

**Cloudflare (most common) fix** — go to "Rules → Cache Rules" and add:

```
Rule name:  Cache AIDP well-known
If incoming requests match:
  (http.request.uri.path eq "/.well-known/aidp.json")
  or (starts_with(http.request.uri.path, "/.well-known/aidp/content/"))
Then:
  Cache eligibility: Eligible for cache
  Edge TTL: Use cache-control header (recommended)
```

Verify: `curl -I https://your-site.com/.well-known/aidp.json` — `cf-cache-status` should become `HIT` on the second request (first one is `MISS`).

**Vercel**: responses already carry `Cache-Control: public` and the Edge Network honors them — no extra setup. If you front Vercel with Cloudflare, you still need the Cache Rule above.

**How much does it save?** For mid-traffic sites, origin fetches drop from PV to roughly PV / (cache hit ratio); a 90%+ hit ratio cuts origin compute by an order of magnitude.

## SDK fetch monthly hard cap (429 behavior)

Each plan has a `sdk_fetch_max_monthly` hard cap (free = quota; paid = quota × 10). When exhausted, SpeakSpec's well-known endpoints respond with **HTTP 429 + `Retry-After`** (pointing to the start of the next month).

**SDKs MUST handle this gracefully — never break the customer's site**:

1. On 429 → do NOT treat as an error; treat as "monthly cap reached"
2. Use the most recent successful cache, even if expired
3. If no cache available → **do NOT inline AIDP signatures**, but **render the page HTML normally**
4. Visitors notice nothing; AI agents see no `_proof` and treat the content as unverified

The bundled `@speakspec/nuxt` SDK implements this fallback by default. Custom SDKs should mirror it.

> **Why block instead of bill**: v3 simplification — actual traffic cost is < 0.5% of subscription revenue, so flat-tier + hard-cap is friendlier to customers (no surprise overage bills) and simpler to operate (no tier sync, no push pipeline). Customers who frequently hit the cap should upgrade to the next tier.

## Canonical verify quota (AI-side traffic)

Distinct from SDK fetch (your visitors trigger): `canonical_verify` is **AI-vendor-side traffic** — when AI references your content, it hits SpeakSpec's `/v/:aidpId/:contentId` to confirm the signature and current directive still match.

- You **cannot control** this — AI vendors decide whether to verify
- We monitor it, and **it directly affects your SpeakSpec subscription cost**
- Monthly quota + overage charges (per your plan tier, see `speakspec.com/pricing`)

## Recommended TTL tuning workflow

1. **Observe**: 1-2 weeks post-launch, check SDK fetch counts in your SpeakSpec dashboard
2. **Compute cost**: how much of your SDK fetch quota is consumed? How far from overage?
3. **Tune TTL**: if approaching overage and your directives don't change often → extend to 15-30 min
4. **Verify webhook**: confirm cache-invalidation webhook is being received (dashboard webhooks section, delivery log)

> **Hard limits**: SpeakSpec also rate-limits well-known endpoints at the IP layer (30 req/min baseline); normal SDK traffic won't hit it, but very short TTL + many cache misses occasionally do. Reaffirming: **don't go below 1 min TTL**.

## See also

- [REST API](./rest-api.md)
- [MCP integration](./mcp-integration.md)
- [pricing](https://speakspec.com/pricing) (plan quota + overage rates)
