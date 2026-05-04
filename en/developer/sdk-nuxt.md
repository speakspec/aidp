# Nuxt SDK: `@speakspec/nuxt`

`@speakspec/nuxt` is the Nuxt 4 module SpeakSpec ships to turn your Nuxt site into a first-class AIDP 0.3 source — it publishes the entity directive, signed Content envelopes, and a paginated content directory, and batches AI-crawler impressions observed on the customer's own origin back to the SpeakSpec dashboard for analytics.

## Install

```bash
pnpm add @speakspec/nuxt
```

## Configure

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

| Option | Required | Default | Notes |
|---|---|---|---|
| `entityId` | ✅ | — | Your SpeakSpec entity AIDP id (from dashboard) |
| `apiKey` | ✅ | — | SpeakSpec API key (`aidp_…`); server-side only |
| `webhookSecret` | when `/api/_aidp/invalidate` is reachable | — | Verifies §8.10 cache-invalidation deliveries |
| `siteOrigin` | recommended | — | Your site's canonical origin (used for absolute URLs) |
| `endpoint` | — | `https://api.speakspec.com` | Override for staging |
| `botTracking.enabled` | — | `false` | Enable AI crawler detection middleware |
| `botTracking.upload.enabled` | — | `false` | Upload impressions to SpeakSpec |
| `botTracking.upload.batchSize` | — | `50` | Flush after N records |
| `botTracking.upload.flushIntervalMs` | — | `60000` | Flush after N ms |
| `botTracking.upload.maxQueueBytes` | — | `2097152` | In-memory queue cap |
| `botTracking.upload.onError` | — | `fallback-stdout` | `fallback-stdout` logs failed impressions; `silent` drops them |
| `botTracking.excludePaths` | — | `['/_nuxt/', '/api/_aidp/']` | Path prefixes to skip |

## Auto-mounted well-known routes

| Route | Purpose |
|---|---|
| `GET /.well-known/aidp.json` | Entity directive (cache + ETag + `If-None-Match → 304`) |
| `GET /.well-known/aidp/content/{id}.json` | Signed Content envelope (§8.7) |
| `GET /.well-known/aidp/content` and `/content/` | Paginated content directory (§8.8; supports `page` / `page_size` / `type` / `language` / `updated_since`) |
| `POST /api/_aidp/invalidate` | §8.10 cache-invalidation webhook receiver (HMAC + 64 KB cap + replay window) |

For per-page binding on article / product / policy pages, call `useAidpContent({ id })` to inject `<link rel="aidp-content">` AND register the (path → content_id) mapping with the SDK so subsequent AI crawler impressions on that path carry `content_id`:

```vue
<script setup lang="ts">
const article = await useFetch(...)
useAidpContent({ id: article.value.id })
</script>
```

## Impression upload (opt-in)

When `botTracking.enabled` is set, the SDK middleware classifies inbound traffic against 14 known AI crawlers (GPTBot / ClaudeBot / PerplexityBot / Google-Extended / CCBot / Bytespider / cohere-ai / Diffbot / Applebot-Extended / meta-externalagent / etc.). By default it only prints a JSON record to stdout for the host's own log pipeline.

Set `botTracking.upload.enabled = true` and the SDK queues each impression in memory and fires a batched POST when the batch is full (default 50 records / 60 s) to:

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

> The SDK does not send a pre-classified `crawler` field — the server derives it server-side via `ClassifyAgent` on `user_agent`, avoiding pattern drift between SDK and server.

The server stores them in the existing `impressions` hypertable + continuous aggregates with `source_type='sdk_origin'`, and the dashboard's `/dashboard/analytics` source pie surfaces a dedicated "SDK Origin (AI traffic on your site)" slice.

### Design guarantees

- **Never blocks SSR**: upload is fire-and-forget; timeout 5 s; 5 consecutive failures trigger a 5-minute backoff
- **Fallback on failure**: failed impressions are logged to stdout (unless `onError: 'silent'`) so you always retain a complete signal
- **Memory cap**: queue overflow drops oldest impressions (also via fallback log) to prevent unbounded growth
- **Privacy**: `client_ip` is used only to compute `visitor_hash` (`sha256(ip + ua + entity_salt)`); raw IPs are never stored
- **Semantics**: for sdk_origin rows, the HLL-derived "unique_visitors" approximates unique AI bot sessions (not human visitors)

### Without upload

With `upload.enabled = false` (default), the middleware only `console.log(JSON.stringify(impression))`s. Pipe stdout into Loki / Datadog / Vector → BigQuery / etc. — the SpeakSpec dashboard will not see your origin's AI traffic in this mode.

## CLI: `speakspec`

Helpers for validating your deployment:

```bash
pnpm speakspec validate-keys https://api.speakspec.com
pnpm speakspec verify-bundle https://yoursite.com/.well-known/aidp/content/etf-explainer.json
pnpm speakspec test-revocation https://api.speakspec.com
```

Exit 0 on success; exit 1 with stderr `reason=…` (12 spec-aligned failure modes) on failure.

## Caveats

- **Multi-instance deployments**: the queue lives in-process; each Nitro worker has its own. Warm Vercel Serverless is fine; Cloudflare Workers / short-lived workers are not (cold starts drop in-flight impressions) — a Cloudflare edge ingest mode is on the roadmap
- **First hit on a new path has no `content_id`**: `useAidpContent` only registers during page render; the first AI hit lands with `content_id=null`. Subsequent hits on the same path are enriched
- **In upload mode the server hashes `client_ip` for `visitor_hash`**: if your compliance regime forbids any form of IP hashing, keep `upload.enabled = false`
