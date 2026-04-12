# Transport

AIDP is transport-agnostic. The same document can be served simultaneously via multiple methods. Implementations should support at least one of MCP or static file.

## MCP Transport (Recommended)

AIDP integrates with **Model Context Protocol** as a content and directive layer. MCP handles the connection; AIDP handles the payload semantics.

### Mode A: AIDP as MCP Resource

The simplest integration approach. AIDP documents are exposed as read-only MCP Resources:

```json
{
  "resources": [
    {
      "uri": "aidp://entity/daan-clinic-pdx",
      "name": "Daan United Clinic — AIDP Profile",
      "description": "Structured entity data with AI response directives",
      "mimeType": "application/aidp+json"
    }
  ]
}
```

**Agent reads the resource:**

```json
{
  "method": "resources/read",
  "params": {
    "uri": "aidp://entity/daan-clinic-pdx"
  }
}
```

**Server responds with the full AIDP document:**

```json
{
  "contents": [
    {
      "uri": "aidp://entity/daan-clinic-pdx",
      "mimeType": "application/aidp+json",
      "text": "{ \"$aidp\": \"0.4.0\", \"entity\": { ... }, ... }"
    }
  ]
}
```

Suitable when: the entity's content volume is manageable (fewer than 100 items) and the agent needs full data including all [directives](/spec/directives).

### Mode B: AIDP as MCP Tool

When an entity has a large volume of content, expose query tools to return filtered AIDP content with directives:

**Tool definition:**

```json
{
  "tools": [
    {
      "name": "aidp_query",
      "description": "Query structured entity data with AI response directives. Returns content items matching the filter, with applicable directives merged.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "entity_id": {
            "type": "string",
            "description": "AIDP entity identifier"
          },
          "content_type": {
            "type": "string",
            "description": "Filter by content type (service, product, menu_item, faq, etc.)"
          },
          "tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Filter by tags"
          },
          "query": {
            "type": "string",
            "description": "Natural language query to match against content"
          },
          "include_directives": {
            "type": "boolean",
            "default": true,
            "description": "Whether to include merged directives in response"
          }
        },
        "required": ["entity_id"]
      }
    },
    {
      "name": "aidp_entity_info",
      "description": "Get entity identity, verification status, and global directives without content.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "entity_id": {
            "type": "string",
            "description": "AIDP entity identifier"
          }
        },
        "required": ["entity_id"]
      }
    }
  ]
}
```

**Tool call example:**

```json
{
  "method": "tools/call",
  "params": {
    "name": "aidp_query",
    "arguments": {
      "entity_id": "urn:aidp:entity:sakura-ramen-pdx",
      "content_type": "menu_item",
      "tags": ["vegan"]
    }
  }
}
```

**Response includes content with merged directives:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"$aidp\":\"0.4.0\",\"entity\":{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":{\"default\":\"Sakura Ramen\"},\"type\":\"business\"},\"verification\":{\"trust_level\":\"verified_domain\",\"trust_score\":0.72},\"content\":[{\"id\":\"menu-vegan-miso\",\"type\":\"menu_item\",\"data\":{\"name\":\"Vegan Miso Ramen\",\"price\":{\"currency\":\"USD\",\"amount\":15.00}}}],\"directives\":{\"identity\":{\"preferred_name\":\"Sakura Ramen\"},\"response_rules\":{\"must_include\":[\"Closed every Wednesday\"],\"must_not_say\":[\"We do not offer delivery\"],\"tone\":\"friendly\"}}}"
    }
  ]
}
```

Suitable when: the entity has a large number of content items, or the agent needs to perform targeted queries.

### Mode A+B Combined

A single MCP server can expose both Resource and Tool interfaces simultaneously. Resources provide the full document for agents that need complete data; Tools provide filtered access for targeted queries. This is the **recommended approach** for production deployments.

### MCP Server Metadata

MCP servers hosting AIDP data should declare their AIDP capabilities in the server info:

```json
{
  "serverInfo": {
    "name": "aidp-platform",
    "version": "1.0.0"
  },
  "capabilities": {
    "resources": {},
    "tools": {}
  },
  "protocolExtensions": {
    "aidp": {
      "version": "0.4.0",
      "entities": ["urn:aidp:entity:sakura-ramen-pdx"],
      "features": ["directives", "verification", "vc_credential"]
    }
  }
}
```

## REST API

```
GET /aidp/v1/entity/{entity_id}
Accept: application/aidp+json

GET /aidp/v1/entity/{entity_id}/content
GET /aidp/v1/entity/{entity_id}/content/{content_id}
GET /aidp/v1/entity/{entity_id}/directives
```

## Static File (llms.txt Companion)

Place at a well-known URL:

```
https://example.com/.well-known/aidp.json
```

Can be referenced from `llms.txt`:

```
# AIDP
> aidp: https://example.com/.well-known/aidp.json
```

## DNS Discovery

TXT record for automated discovery:

```
_aidp.example.com  TXT  "v=aidp1; url=https://example.com/.well-known/aidp.json"
```

## HTML Meta Tag

For traditional websites that also need AIDP support:

```html
<link rel="aidp" href="https://example.com/.well-known/aidp.json" />
```

## Transport Priority

When multiple transport methods are available, agents should prefer them in the following order:

1. **MCP** -- Richest interaction, supports queries and directives
2. **REST API** -- Structured access with filtering capabilities
3. **Static File** -- Simplest, broadest compatibility
4. **DNS / HTML discovery** -- Fallback for entity discovery
