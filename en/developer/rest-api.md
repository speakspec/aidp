# REST API Integration

Third-party developers can access AIDP data through SpeakSpec's HTTP API. All endpoints use the `/api/` or `/public/` prefix — **the `/v1` segment is no longer required**, the server handles version compatibility automatically.

Base URL: `https://api.speakspec.com`

> **v0.2.0 change:** `name` and `description` fields now accept either bare string (shorthand for `{default: ...}`) or object. SDK consumers must update schema validation to handle both forms. See spec §3.3.

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
| `text/html` | Self-documenting HTML page (with OpenGraph meta) |

**About the `text/html` response:** Browser visitors receive a self-documenting HTML page that contains the OpenGraph meta tags plus a short developer-facing explanation, including a curl example and a link to the SpeakSpec public page. The page makes it explicit that the URL is a machine-readable AIDP feed. Unfurl bots from Facebook / Twitter / Slack still pick up the OG metadata from `<head>`. **This endpoint is designed for machine consumption**; human visitors should use [`speakspec.com/entity/{aidpId}`](https://speakspec.com/entity/) for the full dashboard public page.

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

## Member Invitation Endpoints

Invitation endpoints use user JWT authentication (API keys are not accepted).

### Cancel an invitation

`DELETE /api/v1/entities/:id/members/invitations/:inv_id`

Admin / owner only. Marks a pending invitation as `expired`. Responds with `204 No Content`.

### Preview an invitation (public)

`GET /api/v1/invitations/:token/preview`

No authentication required. Lets a logged-out visitor decide whether an invitation is valid and whether the target email is already registered, so the client can route to login or register accordingly.

Response:

```json
{
  "email": "alice@example.com",
  "entity_aidp_id": "urn:aidp:entity:bob-corp",
  "entity_name": "urn:aidp:entity:bob-corp",
  "role": "editor",
  "exists": true,
  "expired": false
}
```

### List my pending invitations

`GET /api/v1/me/invitations`

Returns invitations addressed to the current user's email that are `status=pending` and not expired, enriched with inviter display name and entity info. Used by the dashboard pending-invitations panel.

### Decline an invitation

`POST /api/v1/me/invitations/:token/decline`

Marks an invitation as `expired`. The server enforces that `invitation.email` matches the current user's email; mismatches return `INVITE_EMAIL_MISMATCH`.

### Accept an invitation

`POST /api/v1/invitations/:token/accept`

Authenticated. The invitation email must match the current user. On success, if the user has a soft-deleted entity within the 14-day cooldown window, that entity is hard-deleted and its `aidp_id` / `domain` cooldowns are purged. Response:

```json
{
  "member": { "id": "...", "entity_id": "...", "role": "editor", "joined_at": "..." },
  "dissolved_purged": { "aidp_id": "urn:aidp:entity:alice-shop" }
}
```

`dissolved_purged` only appears when a purge actually happened.

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
