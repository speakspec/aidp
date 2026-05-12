---
description: 沒有用 Nuxt / Next / Astro？這份文件帶你用任何後端語言（Python / Go / PHP / Rails / ...）親手實作官方 SDK 做的事。
---

# 自己實作 AIDP SDK

官方 SDK 目前覆蓋 [Nuxt](/developer/sdk-nuxt) / [Next.js](/developer/sdk-next) / [Astro](/developer/sdk-astro) 三個框架。如果你跑的是 Django、Rails、Express、Hono、Laravel、純 Go HTTP server、或任何其他後端，這份文件帶你照同樣的契約實作一遍 — 跟官方 SDK 行為等價、可被 AI 代理同樣對待，不需要也沒辦法持有任何 SpeakSpec 私鑰。

> **整支只用 SpeakSpec 公開 API**。你的後端**永遠不簽章**，所有簽章都從 SpeakSpec 伺服器拿到後直接傳遞（pass-through），跟靜態 CDN 一樣。私鑰始終在 SpeakSpec 那邊。

## 你要實作什麼

| 能力 | 必要？ | 行為 |
|---|---|---|
| Serve `/.well-known/aidp.json` | ✅ 必要 | 把 SpeakSpec 簽好的 entity directive 放在你的網域上 |
| Serve `/.well-known/aidp/content/{id}.json` | 🟡 推薦 | 每篇 content 的簽章 envelope（per AIDP 0.4 §8.7） |
| Serve `/.well-known/aidp/content` | 🟡 推薦 | 分頁 content 目錄（§8.8） |
| Webhook receiver `/api/aidp/invalidate` | 🟡 推薦 | SpeakSpec 在 directive 變動時清你 server cache（§8.10） |
| AI bot impression tracking | 🟢 加分 | 識別 GPTBot / ClaudeBot 等 UA 並回傳統計 |

最低端只需要做第一條，其他每加一條讓 customer 的整體訊號越完整。

## 安全前提（讀完再寫程式）

- **`SPEAKSPEC_API_KEY`（`ssk_xxx`）只在 server 端持有**。永遠不放進 client bundle、不寫進 URL query string、不印 log。
- **`SPEAKSPEC_WEBHOOK_SECRET`** 只在 server 端持有，作用同上。
- **不要自己簽章**。AIDP 的 ed25519 私鑰由 SpeakSpec 持有；你拿到的 bundle 已經帶了 `_proof` 簽章區塊，原封不動 pass-through 即可。如果你動到 bundle 的任何欄位（即使只是重新格式化 JSON），AI 代理用 JWKS 驗章會失敗。
- **HMAC 比對用 constant-time compare**（Python `hmac.compare_digest` / Go `hmac.Equal` / PHP `hash_equals` / Ruby `Rack::Utils.secure_compare`）— 絕對不要用 `==`，會洩漏時間旁通訊息。
- **Webhook 端點要在 CDN/WAF 設 rate limit**（建議 60 req/min/IP）— HMAC 驗證前 SDK 會把 body 上限定在 64 KB，避免 attacker 用大 body 浪費你的 SHA-256 CPU。

> **Entity ID 格式（重要）**：本頁所有 `{entityId}` 引用都是完整 URN（例：`urn:aidp:entity:speakspec`），不是 short slug。SpeakSpec server 不接受 short slug — 填短的會 404。dashboard 的 Slug 欄位顯示的就是這串完整值。下面範例中的 `your-slug` 是「URN 後半段」變數，組合時要拼成 `urn:aidp:entity:your-slug` 才能放進 URL path 或環境變數。

## 1. Serve `/.well-known/aidp.json`

### 上游契約

```http
GET https://api.speakspec.com/public/entity/{entity_id}
Authorization: Bearer ssk_xxx          # 選填；認證後 SpeakSpec 會把流量歸到你的 dashboard
If-None-Match: "abc123"                # 選填；條件式抓取
Accept: application/json
```

回應：

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

`304 Not Modified` 代表沒變動，繼續用舊的 cached 資料。

v0.4 新增 `content_index` 頂層欄位，讓 AI agent 一次掌握哪些 content type 是 inline、哪些只在 directory；以及單筆 content envelope 上的 `pinned: true|false` 旗標。你 proxy 上游時無須處理這些 -- pass-through 即可。

### 流程

```
你的後端收到 GET /.well-known/aidp.json
  ↓
1. 看本地 cache — fresh? 直接回 (含 ETag + Cache-Control)
  ↓
2. 否則 fetch 上游（帶 cached ETag 當 If-None-Match）
  ↓
3a. 304 → 延 expiresAt，回 cached payload
3b. 200 → 存 (payload, etag, expiresAt = now + 5min)，回 payload
3c. 4xx → 502 給呼叫方並記 log（API key 過期或 entity 被砍）
3d. 5xx / 網路錯 → 有 cached 就回 stale，否則 502
  ↓
4. 回 client：
   ETag: "<上游 etag>"
   Cache-Control: public, max-age=60, stale-while-revalidate=300
   Content-Type: application/json
   <body>
   若 client 帶 If-None-Match 等於本地 etag → 304 + 上述 headers，無 body
```

### Python（FastAPI + redis）

```python
import hmac, hashlib, time, asyncio
import httpx
import redis.asyncio as redis
from fastapi import FastAPI, Request, Response, HTTPException

app = FastAPI()
r = redis.from_url("redis://localhost")

ENTITY_ID = "urn:aidp:entity:your-slug"
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

### Go（net/http）

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

### PHP（plain，無框架）

```php
<?php
// /.well-known/aidp.json.php — 用 .htaccess 改寫到此
declare(strict_types=1);

const ENTITY_ID = 'urn:aidp:entity:your-slug';
const API_KEY   = 'ssk_xxx';        // 從 env 讀，不要 hardcode
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

## 2. Per-content envelope + directory（§8.7 / §8.8）

只是把上面 entity 的流程套到不同 URL：

| 你提供的路徑 | 上游 URL |
|---|---|
| `GET /.well-known/aidp/content/{id}.json` | `GET {endpoint}/public/entity/{entityId}/content/{id}/publish.json` |
| `GET /.well-known/aidp/content` | `GET {endpoint}/public/entity/{entityId}/content/directory.json` |

`/.well-known/aidp/content` 接受並轉發以下 query params（其他都回 400）：

- `page`（正整數）
- `page_size`（正整數）
- `type`
- `language`
- `updated_since`（ISO 8601）
- `pinned`（`true` / `false`，v0.4+）

cache key 必須含 query 的 fingerprint，否則不同分頁 / 過濾條件會互相覆蓋：

```
key = "directory:{entity_id}:" + JSON.stringify({page, page_size, type, language, updated_since, pinned})
```

### v0.4：`?pinned` 過濾與 `pinned` 旗標

- Directory endpoint 接受 `?pinned=true` / `?pinned=false` query 參數，回應只包含對應旗標的內容
- 每個 directory item 與 content envelope 都帶 `pinned: true|false` 旗標（v0.4+）
- Pinned content 永遠出現在 `/.well-known/aidp.json` 的 `content` 陣列，無論其 type 的投放策略為何；在 directory 回應中排序在前

當你 proxy 上游時無須對這些欄位做任何處理 -- 連同其餘 envelope 一起 pass-through 即可。

## 3. Webhook receiver（§8.10）

當 customer 在 dashboard 改 directive，SpeakSpec 會 POST 到你登記的 webhook URL：

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

驗證 + 處理流程：

```python
import hmac, hashlib, time
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Request, HTTPException

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

**關鍵不要漏的細節**：

- HMAC 是 over `${X-AIDP-Timestamp}\n${raw body}`，**不是只有 body**
- header 字串前綴必須是 `hmac-sha256=`，不是 `sha256=`
- `body.entity_id` 是 URN 格式 `urn:aidp:entity:slug`，要剝前綴拿 slug
- `body.timestamp` 若有，必須等於 `X-AIDP-Timestamp` header — 不一致代表 replay 偽造
- 不要用 `==` 比簽章 — timing attack

## 4. AI bot impression tracking（optional）

每次有 inbound 請求帶可疑的 AI crawler User-Agent，記一筆 impression 並上傳到 SpeakSpec。

### UA 識別

對照表（節錄；完整清單見 [`@speakspec/nuxt` 的 `bot-detect.ts`](https://github.com/speakspec/nuxt/blob/main/src/runtime/server/utils/bot-detect.ts)）：

| Crawler | Source | UA 子字串 |
|---|---|---|
| GPTBot | openai | `GPTBot` |
| ChatGPT-User | openai | `ChatGPT-User` |
| ClaudeBot | anthropic | `ClaudeBot` |
| anthropic-ai | anthropic | `anthropic-ai` |
| PerplexityBot | perplexity | `PerplexityBot` |
| Google-Extended | google | `Google-Extended` |
| CCBot | commoncrawl | `CCBot` |
| Bytespider | bytedance | `Bytespider` |

(用大小寫不敏感的 substring match。)

### 上傳 schema

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
    "entity_id": "urn:aidp:entity:your-slug"
  }
]
```

建議實作模式：**fire-and-forget batched queue**

- middleware 不阻塞回應 — 把 impression push 到 in-memory queue
- 每 60s 或滿 50 筆觸發 flush
- 失敗就降級 print 到 stdout（host 的 log pipeline 會收）
- queue 上限（如 2 MB）超過就丟最舊的，不要 OOM

純 stdout 模式（不上傳）也合格，customer 只是看不到 SpeakSpec dashboard 的圖表，但 AI 流量資料還是有保存在自己的 log。

## 5. 驗證你做對了

實作完跑這三條 curl 跟官方 SDK 行為對齊：

```bash
# entity directive
curl -i https://yoursite.com/.well-known/aidp.json
# 期望 200 + ETag + Cache-Control + 合法 AIDP JSON

# 條件式抓取
ETAG=$(curl -sI https://yoursite.com/.well-known/aidp.json | grep -i ^etag | cut -d' ' -f2 | tr -d '\r')
curl -i -H "If-None-Match: $ETAG" https://yoursite.com/.well-known/aidp.json
# 期望 304 + 同 ETag + 同 Cache-Control + 空 body

# 簽章驗章（裝 Nuxt SDK 也能用 CLI，跨框架共用）
npx -y @speakspec/nuxt verify-bundle https://yoursite.com/.well-known/aidp.json
# 期望 exit 0
```

webhook：用任何 SpeakSpec 後台的「test webhook」按鈕觸發，看你的 server log 是否：
- 401 / 400 都能擋掉壞請求
- 200 / 204 收到合法請求並清掉對應 cache key
- 同一個 timestamp 不可被 replay（記錄已處理過的 timestamp 5 分鐘）

## 6. Cache header 調校

預設值（跟 SDK 一致）：

| Route | `max-age` | `stale-while-revalidate` |
|---|---|---|
| `/.well-known/aidp.json` | 60 | 300 |
| `/.well-known/aidp/content/{id}` | 300 | 600 |
| `/.well-known/aidp/content` | 60 | 300 |

調校原則：拉長 = 後端輕但撤銷傳播慢；縮短 = 反過來。詳細權衡見 [SDK 快取與成本控管](/developer/sdk-cache-tuning)。

## 7. URL 對照速查

| 你提供 | 上游 |
|---|---|
| `GET /.well-known/aidp.json` | `GET https://api.speakspec.com/public/entity/{entityId}` |
| `GET /.well-known/aidp/content/{id}.json` | `GET https://api.speakspec.com/public/entity/{entityId}/content/{id}/publish.json` |
| `GET /.well-known/aidp/content?...` | `GET https://api.speakspec.com/public/entity/{entityId}/content/directory.json?...` |
| `POST /api/aidp/invalidate` | （inbound only — 你接的，不打上游） |
| `POST https://api.speakspec.com/api/v1/impressions` | （outbound only — 你打的） |

## 8. 環境變數命名（建議跟官方 SDK 對齊）

```env
SPEAKSPEC_ENTITY_ID=urn:aidp:entity:your-slug
SPEAKSPEC_API_KEY=ssk_xxxxxxxxxxxx
SPEAKSPEC_WEBHOOK_SECRET=...
SPEAKSPEC_ENDPOINT=https://api.speakspec.com
# 可調 cache（單位：秒；對應 §8.5–8.13）
SPEAKSPEC_CACHE_TTL_SEC=300
SPEAKSPEC_ENTITY_MAX_AGE=60
SPEAKSPEC_ENTITY_SWR=300
SPEAKSPEC_CONTENT_MAX_AGE=300
SPEAKSPEC_CONTENT_SWR=600
SPEAKSPEC_DIRECTORY_MAX_AGE=60
SPEAKSPEC_DIRECTORY_SWR=300
# Bot tracking（optional）
SPEAKSPEC_BOT_TRACKING=true
SPEAKSPEC_BOT_UPLOAD=true
```

## 9. Spec & 工具參考

- [AIDP 0.4 §4.8 Cryptographic Proof](/spec/transport#cryptographic-proof) — `_proof` 區塊結構
- [AIDP 0.4 §8.5–8.14 Transport](/spec/transport) — well-known 路由 + 條件式抓取 + webhook + `content_index` / `?pinned` 過濾
- [JSON Schema v0.4.0](/schema/v0.4.0.json) — 機器可讀 schema artifact
- [Authenticated API](/api/authenticated) — `/public/entity/...` 上游契約
- 三個官方 SDK 是 reference implementation — 想對照實作細節，看：
  - [`speakspec/nuxt`](https://github.com/speakspec/nuxt) — Nuxt 4，h3-tied
  - [`speakspec/next`](https://github.com/speakspec/next) — Next 15 App Router
  - [`speakspec/astro`](https://github.com/speakspec/astro) — Astro 5

實作完想要被收錄成第 4 個 community SDK？開 issue 到 [aidp-docs](https://github.com/speakspec/aidp-docs)，附上 repo + 通過驗證 curl 的截圖，會放進這頁。
