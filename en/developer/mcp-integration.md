# MCP Integration

MCP (Model Context Protocol) is the standard protocol for AI Agents to access external data. The AIDP platform provides a full MCP endpoint, enabling AI Agents to query Entity data directly.

## MCP Endpoint

- Single endpoint: `POST /mcp`
- Uses JSON-RPC 2.0 protocol
- No authentication required

## Two Access Modes

### Mode A: Resource Mode

AIDP documents are exposed as MCP Resources, suitable for Agents that need to browse and read structured data.

- URI format: `aidp://entity/{entity_id}` and `aidp://entity/{entity_id}/content/{content_id}`
- MIME type: `application/aidp+json`

List all available Resources:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}
```

Read a specific Entity's AIDP document:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "aidp://entity/sakura-ramen-pdx"
  }
}
```

### Mode B: Tool Mode

Provides two available tools, suitable for Agents that need precise queries.

#### aidp_query

Search Entities with support for filtering by type and category:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | No | Filter by Entity type (e.g., `business`) |
| `category` | string[] | No | Filter by category tags |
| `limit` | integer | No | Maximum number of results (default 10, max 50) |

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "aidp_query",
    "arguments": {
      "type": "business",
      "limit": 5
    }
  }
}
```

#### aidp_entity_info

Retrieve only the Entity's basic information (without content, suitable for quick lookups):

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "aidp_entity_info",
    "arguments": {
      "entity_id": "sakura-ramen-pdx"
    }
  }
}
```

## Content Negotiation

Use the Accept header to specify the response format:

- `application/json` (default) -- AIDP JSON format
- `application/ld+json` -- Schema.org JSON-LD format
- `text/markdown` -- llms.txt Markdown format
- `text/html` -- Open Graph HTML

## Exposure Tracking

- Each MCP call automatically records AI exposure
- Agents can be identified via the User-Agent header
- Exposure data can be viewed in the [SpeakSpec Dashboard](/en/guide/speakspec-guide)
