---
description: SpeakSpec authenticated API reference covering API Key authentication, scopes, error codes, and endpoint catalog
---

# Authenticated API

For third-party systems to manage Entities, Content, Directives, Verification, and other resources. All endpoints require API Key authentication.

Base URL: `https://api.speakspec.com`

## Authentication

Send the API Key in the HTTP header:

```
X-API-Key: aidp_xxxxxxxx
```

API Keys are created in the SpeakSpec dashboard. The full key is shown **only once** at creation time — copy and store it immediately. See [SpeakSpec Platform Guide — API Keys](/en/guide/speakspec-guide#api-keys).

## URL Prefix

All authenticated endpoints use the `/api/` prefix. The server handles version compatibility internally; future spec bumps do not break existing callers.

```bash
curl https://api.speakspec.com/api/entities/{entityId} \
  -H "X-API-Key: aidp_xxxxxxxx"
```

## API Key Behavior

### Entity Binding

Each API Key is **bound to exactly one Entity**. The entity is chosen at key creation time and cannot be changed. Calling another Entity's resources → `403 ENTITY_SCOPE_MISMATCH`.

### Scope

| Scope | Allowed methods |
|---|---|
| `read` | `GET` |
| `write` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

A `read`-scoped key attempting a write → `403 INSUFFICIENT_SCOPE`.

### Key Format

- Always prefixed with `aidp_`
- Wrong format or unknown key → `401 INVALID_API_KEY`
- Revoked → `401 API_KEY_REVOKED`
- Expired → `401 API_KEY_EXPIRED`

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

### Error Codes

| Code | HTTP | Description |
|---|---|---|
| `INVALID_API_KEY` | 401 | API Key has wrong format or does not exist |
| `API_KEY_EXPIRED` | 401 | API Key has expired |
| `API_KEY_REVOKED` | 401 | API Key has been revoked |
| `INSUFFICIENT_SCOPE` | 403 | API Key is `read`-scoped, write attempted |
| `ENTITY_SCOPE_MISMATCH` | 403 | API Key is bound to a different Entity |
| `INVALID_ID` | 400 | Path Entity ID is not a valid UUID |
| `NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server-side failure |

## Endpoints

### Entity

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}` | read |
| PUT | `/api/entities/{id}` | write |
| GET | `/api/entities/{id}/usage` | read |
| GET | `/api/entities/{id}/audit-logs` | read |

### Content

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/contents` | read |
| POST | `/api/entities/{id}/contents` | write |
| GET | `/api/entities/{id}/contents/{contentId}` | read |
| PUT | `/api/entities/{id}/contents/{contentId}` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}` | write |
| PUT | `/api/entities/{id}/contents/{contentId}/draft` | write |
| POST | `/api/entities/{id}/contents/{contentId}/publish` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}/draft` | write |
| GET | `/api/entities/{id}/contents/{contentId}/lock` | read |
| POST | `/api/entities/{id}/contents/{contentId}/lock` | write |
| DELETE | `/api/entities/{id}/contents/{contentId}/lock` | write |
| POST | `/api/entities/{id}/contents/{contentId}/preview` | write |
| GET | `/api/entities/{id}/contents/{contentId}/versions` | read |
| GET | `/api/entities/{id}/contents/{contentId}/versions/{version}` | read |
| POST | `/api/entities/{id}/contents/{contentId}/versions/{version}/restore` | write |

### Directives

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/directives` | read |
| PUT | `/api/entities/{id}/directives` | write |
| PUT | `/api/entities/{id}/directives/evidence` | write |

### Verification

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/verify/status` | read |
| POST | `/api/entities/{id}/verify/dns/init` | write |
| POST | `/api/entities/{id}/verify/dns/check` | write |
| POST | `/api/entities/{id}/verify/email/init` | write |
| POST | `/api/entities/{id}/verify/business-registration/init` | write |

### Output

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/output/aidp` | read |
| GET | `/api/entities/{id}/output/schema-org` | read |
| GET | `/api/entities/{id}/output/llms-txt` | read |
| GET | `/api/entities/{id}/output/og-tags` | read |

### Links

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/links` | read |
| POST | `/api/entities/{id}/links` | write |
| GET | `/api/entities/{id}/links/{linkId}` | read |
| PUT | `/api/entities/{id}/links/{linkId}` | write |
| DELETE | `/api/entities/{id}/links/{linkId}` | write |

### Analytics

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/analytics/overview` | read |
| GET | `/api/entities/{id}/analytics/daily` | read |
| GET | `/api/entities/{id}/analytics/agents` | read |
| GET | `/api/entities/{id}/analytics/content` | read |
| GET | `/api/entities/{id}/analytics/links` | read |

### Import / Export

| Method | Path | Scope |
|---|---|---|
| GET | `/api/entities/{id}/export` | read |
| POST | `/api/entities/{id}/import` | write |

## Examples

### Fetch Entity AIDP document

```bash
curl https://api.speakspec.com/api/entities/{entityId}/output/aidp \
  -H "X-API-Key: aidp_xxxxxxxx"
```

### Create Content

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "menu_item",
    "data": {
      "name": "Classic Tonkotsu Ramen",
      "price": "$16"
    }
  }'
```

### Read scope rejects write

```bash
curl -X POST https://api.speakspec.com/api/entities/{entityId}/contents \
  -H "X-API-Key: aidp_readonly_key" \
  -H "Content-Type: application/json" \
  -d '{ "type": "menu_item" }'
```

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "This API key has read-only access"
  }
}
```
