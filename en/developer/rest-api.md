# REST API Integration

Third-party developers can access AIDP data on the SpeakSpec platform through public REST APIs. Public endpoints do not require authentication.

## Public Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/public/entity/{aidpId}` | Retrieve an Entity's full AIDP document |
| GET | `/public/entity/{aidpId}/content` | Query an Entity's public content |
| GET | `/.well-known/aidp-directory.json` | Index of all verified Entities |

Base URL: `https://api.speakspec.com`

## Retrieve AIDP Document

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx
```

Specify the response format via Accept header:

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx \
  -H "Accept: application/ld+json"
```

| Accept Header | Response Format |
|---|---|
| `application/json` (default) | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

## Query Content

Filter by type and tags:

```bash
curl "https://api.speakspec.com/public/entity/sakura-ramen-pdx/content?type=menu_item"
```

| Parameter | Description |
|---|---|
| `type` | Filter by content type (service, product, menu_item, faq, etc.) |
| `tags` | Filter by tags (comma-separated) |
| `variant_of` | Filter all variants of a specified base content |

## Explore All Entities

```bash
curl https://api.speakspec.com/.well-known/aidp-directory.json
```

Returns a list of all verified Entities on the platform for automated AI Agent discovery.

## AIPREF Headers

Responses automatically include IETF AIPREF headers to inform AI Agents of content usage permissions:

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

## Error Handling

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Entity not found"
  }
}
```

## Platform Management API

If you are a SpeakSpec platform user, the platform also provides a full management API (authentication required) for managing Entities, Content, Directives, and more. Management API documentation is available within the platform after logging in.

For the full public API reference, see: [API Reference](/en/api/)
