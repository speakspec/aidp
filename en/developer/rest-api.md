# REST API Integration

Third-party developers can access AIDP data through SpeakSpec's HTTP API. All endpoints use the `/api/` or `/public/` prefix — **the `/v1` segment is no longer required**, the server handles version compatibility automatically.

Base URL: `https://api.speakspec.com`

## Endpoint Categories

| Category | Path Prefix | Auth |
|---|---|---|
| Public API | `/public/` | None |
| Authenticated API | `/api/` | API Key |

## Public Endpoints

Public endpoints do not require authentication.

| Method | Path | Description |
|---|---|---|
| GET | `/public/entity/{aidpId}` | Retrieve an Entity's full AIDP document |
| GET | `/public/entity/{aidpId}/content` | Query an Entity's public content |
| GET | `/.well-known/aidp-directory.json` | Index of all verified Entities |

### Retrieve AIDP document

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx
```

Use the Accept header to choose a format:

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx \
  -H "Accept: application/ld+json"
```

| Accept Header | Format |
|---|---|
| `application/json` (default) | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

### Query content

Filter by type and tags:

```bash
curl "https://api.speakspec.com/public/entity/sakura-ramen-pdx/content?type=menu_item"
```

| Parameter | Description |
|---|---|
| `type` | Filter by content type (service, product, menu_item, faq, etc.) |
| `tags` | Filter by tags (comma-separated) |
| `variant_of` | Filter all variants of a base content |

### Discover all Entities

```bash
curl https://api.speakspec.com/.well-known/aidp-directory.json
```

Returns the list of all verified Entities for AI Agent auto-discovery.

### AIPREF headers

Public responses automatically include IETF AIPREF headers describing AI usage permissions:

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

## Authenticated Endpoints

Endpoints under `/api/` are used to manage Entities, Content, Directives, and other resources, and require authentication.

### Authentication

Send the API Key in the HTTP header:

```
X-API-Key: aidp_xxxxxxxx
```

API Keys are created in the SpeakSpec dashboard. Each key is **bound to one Entity** and has either `read` or `write` scope.

### Read Entity content

```bash
curl https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx"
```

### Write operation (write scope)

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "menu_item",
    "data": { "name": "Classic Tonkotsu Ramen", "price": "$16" }
  }'
```

For the full endpoint catalog, scope rules, and error codes, see [Authenticated API reference](/en/api/authenticated).

## Error Format

All errors return:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common codes:

| Code | HTTP | Description |
|---|---|---|
| `NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INVALID_API_KEY` | 401 | API Key wrong format or not found |
| `API_KEY_EXPIRED` | 401 | API Key expired |
| `INSUFFICIENT_SCOPE` | 403 | API Key has no write permission |
| `ENTITY_SCOPE_MISMATCH` | 403 | API Key is bound to a different Entity |
| `INTERNAL_ERROR` | 500 | Server error |

Full error code list: [Authenticated API reference](/en/api/authenticated#error-codes).

## Full API Documentation

- [Public API](/en/api/public) — full public-endpoint reference
- [Authenticated API](/en/api/authenticated) — full authenticated-endpoint reference
- [MCP API](/en/api/mcp) — MCP JSON-RPC endpoint
