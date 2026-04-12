# Public API

Public endpoints for AI Agents and external systems. No authentication required.

Base URL: `https://api.speakspec.com`

## Endpoint Overview

| Method | Path | Description |
|---|---|---|
| GET | `/public/entity/:aidpId` | Public AIDP document (with content negotiation) |
| GET | `/public/entity/:aidpId/content` | Public content query (with filtering) |
| GET | `/public/entity/:aidpId/content/:contentId` | Get a single content item |
| GET | `/public/entity/:aidpId/history` | Entity change history |
| GET | `/public/search` | Full-text search for Entities |
| GET | `/.well-known/aidp-directory.json` | Entity directory (with pagination and type filtering) |
| GET | `/r/:hash` | Link redirect proxy |
| GET | `/preview/:token` | Preview draft content |

## GET /public/entity/:aidpId

Returns the complete AIDP document for the specified Entity.

### Content Negotiation

Specify the response format via the Accept header:

| Accept Header | Response Format |
|---|---|
| `application/json` (default) | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

### AIPREF Headers

The response includes IETF AIPREF headers derived from the Entity's access_control directives:

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

- When `allow_training=false`, returns `disallow=FoundationModelProduction`
- When `allow_derivative=true`, returns `allow=Search`

### Example Response

```json
{
  "aidp_version": "0.4.0",
  "entity": {
    "id": "urn:aidp:entity:sakura-ramen-pdx",
    "name": "Sakura Ramen",
    "type": "business",
    "description": "Authentic Japanese ramen in Portland"
  },
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "name": "Classic Tonkotsu Ramen",
      "description": "Rich pork bone broth with chashu",
      "attributes": {
        "price": "$16"
      }
    }
  ],
  "access_control": {
    "allow_training": false,
    "allow_search": true,
    "allow_derivative": true
  },
  "verification": {
    "trust_level": "verified_domain"
  }
}
```

## GET /public/entity/:aidpId/content

Query public content for the specified Entity, with filtering support.

### Query Parameters

| Parameter | Description |
|---|---|
| `type` | Filter by content type (e.g., `menu_item`, `faq`) |
| `tags` | Filter by tags (comma-separated) |
| `variant_of` | Filter all variants of a specific base content (e.g., `iphone-16`) |

### Example

```
GET /public/entity/sakura-ramen-pdx/content?type=menu_item
```

```json
{
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "content_id": "menu-tonkotsu",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth with chashu",
        "price": "$16"
      }
    }
  ]
}
```

## GET /public/entity/:aidpId/content/:contentId

Get a single content item for the specified Entity.

### Example

```
GET /public/entity/sakura-ramen-pdx/content/menu-tonkotsu
```

```json
{
  "id": "menu-tonkotsu",
  "type": "menu_item",
  "content_id": "menu-tonkotsu",
  "data": {
    "name": "Classic Tonkotsu Ramen",
    "description": "Rich pork bone broth with chashu",
    "price": "$16"
  },
  "status": "published"
}
```

## GET /public/entity/:aidpId/history

Get the public change history for an Entity, with pagination support.

### Query Parameters

| Parameter | Description |
|---|---|
| `page` | Page number (default 1) |
| `per_page` | Items per page (default 20, max 100) |
| `content_id` | Filter change history for a specific content item |

### Example

```
GET /public/entity/sakura-ramen-pdx/history?per_page=5
```

```json
{
  "history": [
    {
      "action": "content.published",
      "content_id": "menu-tonkotsu",
      "created_at": "2026-03-20T08:00:00Z"
    },
    {
      "action": "entity.updated",
      "created_at": "2026-03-18T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "per_page": 5
}
```

## GET /public/search

Full-text search for published Entities.

### Query Parameters

| Parameter | Description |
|---|---|
| `q` | Search keyword (required) |
| `page` | Page number (default 1) |
| `per_page` | Items per page (default 20, max 100) |

### Example

```
GET /public/search?q=ramen&per_page=5
```

```json
{
  "entities": [
    {
      "aidp_id": "sakura-ramen-pdx",
      "name": {"default": "Sakura Ramen"},
      "type": "business",
      "trust_level": "verified_domain"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 5
}
```

## GET /.well-known/aidp-directory.json

Returns a directory of all published Entities on the platform, with pagination and type filtering support.

This endpoint follows the `.well-known` URI specification for automatic discovery by AI Agents.

### Query Parameters

| Parameter | Description |
|---|---|
| `type` | Filter by Entity type (e.g., `business`) |
| `page` | Page number (default 1) |
| `per_page` | Items per page (default 50, max 100) |

### Example Response

```json
{
  "entities": [
    {
      "aidp_id": "sakura-ramen-pdx",
      "name": {"default": "Sakura Ramen"},
      "type": "business",
      "category": ["restaurant", "japanese"],
      "domain": "sakura-ramen.com",
      "trust_level": "verified_domain"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 50
}
```

## GET /r/:hash

Link redirect proxy. When a user clicks a tracked link in an AIDP document, this endpoint redirects to the original URL while recording the click event.

The redirect automatically appends `aidp_ref` (link hash) and `aidp_eid` (Entity AIDP ID) query parameters to the target URL.

Returns HTTP 302 redirect, or 404 if the link does not exist.

## GET /preview/:token

Preview draft content via a preview token. Tokens are generated by the platform management interface and are time-limited.

### Example Response

```json
{
  "entity_id": "sakura-ramen-pdx",
  "content": {
    "id": "menu-new-item",
    "type": "menu_item",
    "data": {
      "name": "New Special Ramen",
      "description": "Limited edition"
    },
    "status": "draft",
    "draft": true
  }
}
```
