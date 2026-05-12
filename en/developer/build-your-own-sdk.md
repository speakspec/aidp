---
description: Not on Nuxt / Next / Astro? This guide walks you through implementing what the official SDKs do, in any backend language (Python / Go / PHP / Rails / ...).
---

# Build Your Own AIDP SDK

The official SDKs cover [Nuxt](/en/developer/sdk-nuxt) / [Next.js](/en/developer/sdk-next) / [Astro](/en/developer/sdk-astro). If you run Django, Rails, Express, Hono, Laravel, plain Go HTTP, or anything else, this page walks you through implementing the same contract in your own stack — behaviorally equivalent to the official SDKs, treated identically by AI agents, and requiring zero SpeakSpec private keys on your side.

> **Everything here uses public SpeakSpec API only.** Your backend **never signs anything**; signed bundles are passed through verbatim, exactly like a static CDN. Private keys stay with SpeakSpec.

## What you're implementing

| Capability | Required? | Behavior |
|---|---|---|
| Serve `/.well-known/aidp.json` | ✅ Required | Surface the SpeakSpec-signed entity directive on your domain |
| Serve `/.well-known/aidp/content/{id}.json` | 🟡 Recommended | Per-content signed envelope (AIDP 0.4 §8.7) |
| Serve `/.well-known/aidp/content` | 🟡 Recommended | Paginated content directory (§8.8) |
| Webhook receiver `/api/aidp/invalidate` | 🟡 Recommended | SpeakSpec evicts your server cache on directive changes (§8.10) |
| AI bot impression tracking | 🟢 Bonus | Detect GPTBot / ClaudeBot etc. UAs and report stats |

The minimum is the first row. Each additional capability gives the customer richer signal end-to-end.

## Security ground rules (read before coding)

- **`SPEAKSPEC_API_KEY` (`ssk_xxx`) is server-side only.** Never put it in the client bundle, never in URL query strings, never in logs.
- **`SPEAKSPEC_WEBHOOK_SECRET`** is server-side only — same rules.
- **Never sign anything yourself.** AIDP's ed25519 private key is held by SpeakSpec; the bundle you fetch already has the `_proof` block. Pass it through byte-for-byte. Touching any field (even reformatting the JSON) breaks the AI agent's signature verification against the published JWKS.
- **Use constant-time HMAC compare** (Python `hmac.compare_digest` / Go `hmac.Equal` / PHP `hash_equals` / Ruby `Rack::Utils.secure_compare`) — never `==`, which leaks via timing.
- **Rate-limit the webhook endpoint at your CDN/WAF** (e.g. 60 req/min/IP). The SDK caps inbound bodies at 64 KB before HMAC to bound attacker-driven SHA-256 work.

## 1. Serve `/.well-known/aidp.json`

### Upstream contract

```http
GET https://api.speakspec.com/public/entity/{entity_id}
Authorization: Bearer ssk_xxx          # optional; auth attributes traffic to your dashboard
If-None-Match: "abc123"                # optional; conditional fetch
Accept: application/json
```

Response:

```http
HTTP/1.1 200 OK
ETag: "abc123"
Content-Type: application/json

{
  "spec_version": "0.4.0",
  "entity_id": "urn:aidp:entity:your-slug",
  "entity": { "name": "...", "kind": "..." },
  "content": [
    { "id": "flagship-ramen", "type": "menu_item", "pinned": true, "...": "..." }
  ],
  "content_index": {
    "url": "https://yoursite.com/.well-known/aidp/content/directory.json",
    "types_inlined": ["faq", "service"],
    "types_indexed": ["article", "event"],
    "total_by_type": { "faq": 2, "service": 3, "article": 12, "event": 4 },
    "pinned_count": 1,
    "updated_at": "2026-05-12T10:00:00Z"
  },
  "directives": {...},
  "_proof": { "algorithm": "ed25519", "signature": "..." }
}
```

`304 Not Modified` means nothing changed — keep serving cached.

v0.4 adds the top-level `content_index` field so AI agents can tell at a glance which content types are inlined vs only listed via the directory, plus a `pinned: true|false` flag on each content envelope. You don't need to touch any of this when proxying upstream -- pass it through verbatim.

### Flow

```
Inbound GET /.well-known/aidp.json
  ↓
1. Local cache fresh? Serve it (with ETag + Cache-Control)
  ↓
2. Otherwise fetch upstream (passing cached ETag as If-None-Match)
  ↓
3a. 304 → bump expiresAt, serve cached payload
3b. 200 → store (payload, etag, expiresAt = now + 5min), serve payload
3c. 4xx → 502 to caller + log (API key revoked or entity removed)
3d. 5xx / network → serve stale if cached, otherwise 502
  ↓
4. To client:
   ETag: "<upstream etag>"
   Cache-Control: public, max-age=60, stale-while-revalidate=300
   Content-Type: application/json
   <body>
   If client sent If-None-Match equal to local etag → 304 + same headers, no body
```

### Python (FastAPI + Redis)

```python
import time
import httpx
import redis.asyncio as redis
from fastapi import FastAPI, Request, Response, HTTPException

app = FastAPI()
r = redis.from_url("redis://localhost")

ENTITY_ID = "your-slug"
API_KEY   = "ssk_xxx"      # from env, NEVER hardcode
ENDPOINT  = "https://api.speakspec.com"
TTL_SEC   = 300

async def get_entity(if_none_match: str | None):
    cached = await r.hgetall(f"aidp:entity:{ENTITY_ID}")
    now = int(time.time())
    if cached and int(cached.get(b"expires_at", 0)) > now:
        return cached  # fresh

    headers = {
        "Accept": "application/json",
        "User-Agent": "MyAidpBackend/1.0",
    }
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    if cached and cached.get(b"etag"):
        headers["If-None-Match"] = cached[b"etag"].decode()

    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(
            f"{ENDPOINT}/public/entity/{ENTITY_ID}",
            headers=headers,
        )

    if resp.status_code == 304 and cached:
        await r.hset(f"aidp:entity:{ENTITY_ID}", "expires_at", now + TTL_SEC)
        return cached

    if 400 <= resp.status_code < 500:
        raise HTTPException(502, f"upstream rejected: {resp.status_code}")

    resp.raise_for_status()
    payload = resp.text
    etag = resp.headers.get("etag", "")
    await r.hset(f"aidp:entity:{ENTITY_ID}", mapping={
        "payload": payload, "etag": etag, "expires_at": now + TTL_SEC,
    })
    return {"payload": payload.encode(), "etag": etag.encode(),
            "expires_at": str(now + TTL_SEC).encode()}

@app.get("/.well-known/aidp.json")
async def well_known_aidp(request: Request):
    inbound = request.headers.get("if-none-match")
    bundle = await get_entity(inbound)
    etag = bundle[b"etag"].decode()
    headers = {
        "ETag": etag,
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    }
    if inbound and inbound == etag:
        return Response(status_code=304, headers=headers)
    return Response(
        content=bundle[b"payload"],
        media_type="application/json",
        headers=headers,
    )
```

### Go (net/http)

```go
package main

import (
    "context"
    "io"
    "net/http"
    "os"
    "sync"
    "time"
)

type bundle struct {
    payload   []byte
    etag      string
    expiresAt time.Time
}

var (
    entityID = os.Getenv("SPEAKSPEC_ENTITY_ID")
    apiKey   = os.Getenv("SPEAKSPEC_API_KEY")
    endpoint = "https://api.speakspec.com"
    ttl      = 5 * time.Minute

    mu    sync.RWMutex
    cache *bundle
)

func fetchEntity(ctx context.Context, ifNoneMatch string) (*bundle, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET",
        endpoint+"/public/entity/"+entityID, nil)
    req.Header.Set("Accept", "application/json")
    req.Header.Set("User-Agent", "MyAidpBackend/1.0")
    if apiKey != "" {
        req.Header.Set("Authorization", "Bearer "+apiKey)
    }
    if ifNoneMatch != "" {
        req.Header.Set("If-None-Match", ifNoneMatch)
    }
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    if resp.StatusCode == http.StatusNotModified {
        return nil, nil  // caller keeps stale
    }
    if resp.StatusCode >= 400 {
        return nil, &httpError{resp.StatusCode}
    }
    body, _ := io.ReadAll(resp.Body)
    return &bundle{
        payload:   body,
        etag:      resp.Header.Get("ETag"),
        expiresAt: time.Now().Add(ttl),
    }, nil
}

func handleWellKnown(w http.ResponseWriter, r *http.Request) {
    mu.RLock()
    cur := cache
    mu.RUnlock()

    if cur == nil || time.Now().After(cur.expiresAt) {
        prevETag := ""
        if cur != nil {
            prevETag = cur.etag
        }
        fresh, err := fetchEntity(r.Context(), prevETag)
        if err != nil {
            if cur != nil {
                w.Header().Set("Cache-Control", "public, max-age=10, stale-while-revalidate=60")
                serve(w, r, cur)
                return
            }
            http.Error(w, "upstream unavailable", http.StatusBadGateway)
            return
        }
        if fresh != nil {
            mu.Lock()
            cache = fresh
            mu.Unlock()
            cur = fresh
        } else if cur != nil {
            cur.expiresAt = time.Now().Add(ttl)
        }
    }

    w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
    serve(w, r, cur)
}

func serve(w http.ResponseWriter, r *http.Request, b *bundle) {
    w.Header().Set("ETag", b.etag)
    if r.Header.Get("If-None-Match") == b.etag {
        w.WriteHeader(http.StatusNotModified)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.Write(b.payload)
}

type httpError struct{ status int }
func (e *httpError) Error() string { return "upstream status" }
```

### PHP (plain, no framework)

```php
<?php
// /.well-known/aidp.json.php — rewrite via .htaccess
declare(strict_types=1);

const ENTITY_ID = 'your-slug';
const API_KEY   = 'ssk_xxx';        // read from env, do NOT hardcode
const ENDPOINT  = 'https://api.speakspec.com';
const TTL_SEC   = 300;
const CACHE_FILE = '/tmp/aidp-entity-cache.json';

function loadCache(): ?array {
    if (!file_exists(CACHE_FILE)) return null;
    return json_decode(file_get_contents(CACHE_FILE), true);
}

function saveCache(array $bundle): void {
    file_put_contents(CACHE_FILE, json_encode($bundle), LOCK_EX);
}

function fetchUpstream(?string $ifNoneMatch): array {
    $headers = ['Accept: application/json', 'User-Agent: MyAidpBackend/1.0'];
    if (API_KEY) $headers[] = 'Authorization: Bearer ' . API_KEY;
    if ($ifNoneMatch) $headers[] = 'If-None-Match: ' . $ifNoneMatch;

    $ch = curl_init(ENDPOINT . '/public/entity/' . ENTITY_ID);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 5,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    $rawHeaders = substr($raw, 0, $headerSize);
    $body = substr($raw, $headerSize);
    preg_match('/^etag:\s*(.+)$/mi', $rawHeaders, $m);
    return ['status' => $status, 'body' => $body, 'etag' => trim($m[1] ?? '')];
}

$cached  = loadCache();
$now     = time();
$inbound = $_SERVER['HTTP_IF_NONE_MATCH'] ?? null;

if ($cached && $cached['expires_at'] > $now) {
    serve($cached, $inbound);
    exit;
}

$resp = fetchUpstream($cached['etag'] ?? null);

if ($resp['status'] === 304 && $cached) {
    $cached['expires_at'] = $now + TTL_SEC;
    saveCache($cached);
    serve($cached, $inbound);
    exit;
}

if ($resp['status'] >= 400) {
    if ($cached) { serve($cached, $inbound, true); exit; }
    http_response_code(502);
    exit;
}

$bundle = ['payload' => $resp['body'], 'etag' => $resp['etag'], 'expires_at' => $now + TTL_SEC];
saveCache($bundle);
serve($bundle, $inbound);

function serve(array $b, ?string $inbound, bool $stale = false): void {
    $cc = $stale
        ? 'public, max-age=10, stale-while-revalidate=60'
        : 'public, max-age=60, stale-while-revalidate=300';
    header('ETag: ' . $b['etag']);
    header('Cache-Control: ' . $cc);
    if ($inbound === $b['etag']) { http_response_code(304); return; }
    header('Content-Type: application/json');
    echo $b['payload'];
}
```

## 2. Per-content envelope + directory (§8.7 / §8.8)

Same flow, different URLs:

| You expose | Upstream URL |
|---|---|
| `GET /.well-known/aidp/content/{id}.json` | `GET {endpoint}/public/entity/{entityId}/content/{id}/publish.json` |
| `GET /.well-known/aidp/content` | `GET {endpoint}/public/entity/{entityId}/content/directory.json` |

`/.well-known/aidp/content` accepts (and forwards) only these query params (others must return 400):

- `page` (positive integer)
- `page_size` (positive integer)
- `type`
- `language`
- `updated_since` (ISO 8601)
- `pinned` (`true` / `false`, v0.4+)

Cache key MUST include a query fingerprint so distinct paginations / filters don't share a cache entry:

```
key = "directory:{entity_id}:" + JSON.stringify({page, page_size, type, language, updated_since, pinned})
```

### v0.4: `?pinned` filter and `pinned` flag

- Directory endpoint accepts `?pinned=true` / `?pinned=false` query parameters; the response only includes items matching the flag
- Every directory item and content envelope carries a `pinned: true|false` flag (v0.4+)
- Pinned content always appears in `/.well-known/aidp.json`'s `content` array regardless of the type's delivery strategy, and is sorted first in directory responses

You don't need to special-case any of these fields when proxying upstream — pass them through alongside the rest of the envelope.

## 3. Webhook receiver (§8.10)

When the customer changes a directive in the dashboard, SpeakSpec POSTs to the webhook URL you registered:

```http
POST https://yoursite.com/api/aidp/invalidate
Content-Type: application/json
X-AIDP-Timestamp: 2026-05-10T12:00:00Z
X-AIDP-Signature: hmac-sha256=8f3c...

{
  "$aidp": "0.4.0",
  "event": "directive.updated",
  "scope": "entity",                    // or "content"
  "entity_id": "urn:aidp:entity:your-slug",
  "content_id": "fixture-1",            // present iff scope === "content"
  "timestamp": "2026-05-10T12:00:00Z"
}
```

Verification + handling:

```python
import hmac, hashlib, json
from datetime import datetime, timezone, timedelta
from fastapi import Request, Response, HTTPException

WEBHOOK_SECRET = b"shh-from-env"
MAX_BODY_BYTES = 64 * 1024
REPLAY_WINDOW = timedelta(minutes=5)

@app.post("/api/aidp/invalidate")
async def invalidate(request: Request):
    sig = request.headers.get("x-aidp-signature", "")
    ts  = request.headers.get("x-aidp-timestamp", "")
    if not sig or not ts:
        raise HTTPException(400, "missing signature/timestamp headers")

    # 1. Replay window
    try:
        when = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(400, "bad timestamp")
    if abs(datetime.now(timezone.utc) - when) > REPLAY_WINDOW:
        raise HTTPException(401, "timestamp outside replay window")

    # 2. Body size cap (BEFORE HMAC)
    body = await request.body()
    if len(body) > MAX_BODY_BYTES:
        raise HTTPException(413, "body too large")
    if len(body) == 0:
        raise HTTPException(400, "empty body")

    # 3. HMAC verify (constant-time)
    expected = "hmac-sha256=" + hmac.new(
        WEBHOOK_SECRET,
        (ts + "\n").encode() + body,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, sig):
        raise HTTPException(401, "signature mismatch")

    # 4. Apply invalidation
    payload = json.loads(body)
    slug = payload["entity_id"].removeprefix("urn:aidp:entity:")
    if payload["scope"] == "entity":
        await invalidate_keys(f"entity:{slug}")
        await invalidate_prefix(f"content:{slug}:")
        await invalidate_prefix(f"directory:{slug}:")
    else:
        await invalidate_keys(f"content:{slug}:{payload['content_id']}")
        await invalidate_prefix(f"directory:{slug}:")

    return Response(status_code=204)
```

**Critical details — don't miss any of these**:

- HMAC is over `${X-AIDP-Timestamp}\n${raw body}`, **not just the body**
- Header value prefix is `hmac-sha256=`, not `sha256=`
- `body.entity_id` is URN-formatted (`urn:aidp:entity:slug`); strip the prefix to get the slug
- `body.timestamp`, when present, MUST equal the `X-AIDP-Timestamp` header value — mismatch = forgery
- Don't compare signatures with `==` — use constant-time

## 4. AI bot impression tracking (optional)

Each inbound request with a known AI crawler User-Agent gets logged + uploaded to SpeakSpec.

### UA detection

Excerpt of the rule table (full list in [`@speakspec/nuxt`'s `bot-detect.ts`](https://github.com/speakspec/nuxt/blob/main/src/runtime/server/utils/bot-detect.ts)):

| Crawler | Source | UA substring |
|---|---|---|
| GPTBot | openai | `GPTBot` |
| ChatGPT-User | openai | `ChatGPT-User` |
| ClaudeBot | anthropic | `ClaudeBot` |
| anthropic-ai | anthropic | `anthropic-ai` |
| PerplexityBot | perplexity | `PerplexityBot` |
| Google-Extended | google | `Google-Extended` |
| CCBot | commoncrawl | `CCBot` |
| Bytespider | bytedance | `Bytespider` |

(Match case-insensitively; substring match.)

### Upload schema

```http
POST https://api.speakspec.com/api/v1/impressions
Authorization: Bearer ssk_xxx
Content-Type: application/json

[
  {
    "msg": "aidp.crawler_impression",
    "crawler": "gptbot",
    "crawler_source": "openai",
    "path": "/articles/etf-explainer",
    "user_agent": "Mozilla/5.0 (compatible; GPTBot/1.0; ...)",
    "ts": "2026-05-10T12:00:00Z",
    "entity_id": "your-slug"
  }
]
```

Recommended pattern: **fire-and-forget batched queue**

- Middleware MUST NOT block the response — push the impression onto an in-memory queue
- Flush every 60s or when the queue hits 50 items
- On failure, fall back to printing to stdout (the host's log pipeline will catch it)
- Cap queue size (e.g. 2 MB), drop oldest on overrun, never OOM

Pure-stdout mode (no upload) is also valid — the customer just won't see SpeakSpec dashboard charts, but their logs still preserve the AI traffic data.

## 5. Verifying it works

After implementing, run these three curls to confirm parity with the official SDKs:

```bash
# entity directive
curl -i https://yoursite.com/.well-known/aidp.json
# expect 200 + ETag + Cache-Control + valid AIDP JSON

# conditional fetch
ETAG=$(curl -sI https://yoursite.com/.well-known/aidp.json | grep -i ^etag | cut -d' ' -f2 | tr -d '\r')
curl -i -H "If-None-Match: $ETAG" https://yoursite.com/.well-known/aidp.json
# expect 304 + same ETag + same Cache-Control + empty body

# Signature verification (the Nuxt SDK ships a CLI usable cross-framework)
npx -y @speakspec/nuxt verify-bundle https://yoursite.com/.well-known/aidp.json
# expect exit 0
```

For the webhook: trigger a "test webhook" from the SpeakSpec dashboard and verify your server log shows:
- 401 / 400 rejecting bad requests
- 200 / 204 accepting valid requests and clearing the matching cache keys
- The same timestamp can't be replayed (record processed timestamps for 5 minutes)

## 6. Cache header tuning

Defaults (matching the official SDKs):

| Route | `max-age` | `stale-while-revalidate` |
|---|---|---|
| `/.well-known/aidp.json` | 60 | 300 |
| `/.well-known/aidp/content/{id}` | 300 | 600 |
| `/.well-known/aidp/content` | 60 | 300 |

Tuning principle: longer = lower backend load but slower revocation; shorter = inverse. See [SDK Cache & Cost Tuning](/en/developer/sdk-cache-tuning) for the full trade-off discussion.

## 7. URL cheat sheet

| You expose | Upstream |
|---|---|
| `GET /.well-known/aidp.json` | `GET https://api.speakspec.com/public/entity/{entityId}` |
| `GET /.well-known/aidp/content/{id}.json` | `GET https://api.speakspec.com/public/entity/{entityId}/content/{id}/publish.json` |
| `GET /.well-known/aidp/content?...` | `GET https://api.speakspec.com/public/entity/{entityId}/content/directory.json?...` |
| `POST /api/aidp/invalidate` | (inbound only — you receive, never call upstream) |
| `POST https://api.speakspec.com/api/v1/impressions` | (outbound only — you call) |

## 8. Environment variable conventions (recommended — match official SDKs)

```env
SPEAKSPEC_ENTITY_ID=your-slug
SPEAKSPEC_API_KEY=ssk_xxxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
SPEAKSPEC_ENDPOINT=https://api.speakspec.com
# Cache tuning (seconds; per §8.5–8.13)
SPEAKSPEC_CACHE_TTL_SEC=300
SPEAKSPEC_ENTITY_MAX_AGE=60
SPEAKSPEC_ENTITY_SWR=300
SPEAKSPEC_CONTENT_MAX_AGE=300
SPEAKSPEC_CONTENT_SWR=600
SPEAKSPEC_DIRECTORY_MAX_AGE=60
SPEAKSPEC_DIRECTORY_SWR=300
# Bot tracking (optional)
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

## 9. Spec & tooling references

- [AIDP 0.4 §4.8 Cryptographic Proof](/en/spec/transport#cryptographic-proof) — `_proof` block structure
- [AIDP 0.4 §8.5–8.14 Transport](/en/spec/transport) — well-known routes + conditional fetch + webhook + `content_index` / `?pinned` filter
- [JSON Schema v0.4.0](/schema/v0.4.0.json) — machine-readable schema artifact
- [Authenticated API](/en/api/authenticated) — `/public/entity/...` upstream contract
- The three official SDKs are reference implementations. To compare details, read:
  - [`speakspec/nuxt`](https://github.com/speakspec/nuxt) — Nuxt 4, h3-tied
  - [`speakspec/next`](https://github.com/speakspec/next) — Next 15 App Router
  - [`speakspec/astro`](https://github.com/speakspec/astro) — Astro 5

Built one and want it listed as a community SDK? Open an issue at [aidp-docs](https://github.com/speakspec/aidp-docs) with your repo URL plus a screenshot of the verification curls passing — we'll add it to this page.
