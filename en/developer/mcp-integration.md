# MCP Integration

MCP (Model Context Protocol) is the standard protocol for AI Agents to access external data. The AIDP platform provides a full MCP endpoint, enabling AI Agents to query Entity data directly.

> **v0.2.0 change:** `name` and `description` fields now accept either bare string (shorthand for `{default: ...}`) or object. SDK consumers must update schema validation to handle both forms. See spec §3.3.

## MCP Endpoint

- Single endpoint: `POST /mcp`
- Uses JSON-RPC 2.0 protocol
- **Public mode**: no authentication required — exposes `aidp_query`, `aidp_entity_info`, and all resource endpoints
- **Authenticated mode**: pass an API key via `X-API-Key` header to unlock 50 entity-scoped tools covering every REST API read/write operation

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

## Authenticated Mode (X-API-Key)

Add `X-API-Key: aidp_...` to the HTTP headers of any MCP request to unlock 50 entity-scoped tools. Each tool is automatically bound to the entity that owns the API key — you do not need to (and should not) pass `entity_id` in the arguments.

### Claude Desktop Integration

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "speakspec": {
      "url": "https://api.speakspec.com/mcp",
      "headers": { "X-API-Key": "aidp_YOUR_KEY_HERE" }
    }
  }
}
```

After restarting Claude Desktop, you can drive the platform through natural language, for example: "Update the 'About Us' section to emphasize sustainability and publish it."

### Scope Rules

| API key scope | Callable tool groups |
|---|---|
| `read` | All read tools named `aidp_*_get`, `aidp_*_list`, `aidp_output_*`, `aidp_analytics_*`, `aidp_entity_summary`, `aidp_search_own_entity`, `aidp_export` |
| `write` | All read tools + create / update / delete / publish / lock / import write tools |

Calling a write tool with a `read` key returns JSON-RPC error code `-32002` (INSUFFICIENT_SCOPE).

### Rate Limit

- Public calls (no header): 60 req/min per IP
- Authenticated calls: 300 req/min per API key

### Tool Reference (REST ↔ MCP)

See [API Reference: MCP](/en/api/mcp) for the full 50-tool mapping to REST endpoints.

## v0.4 and MCP

AIDP v0.4 introduces the `content_index` field, so `/.well-known/aidp.json` no longer inlines all content. However, MCP tools read the backend database directly and are **not affected by the well-known inline/directory strategy**:

- `list_contents` / `get_content` and similar tools always return the full content list (including content of types in `directory` mode)
- AI agents using MCP do not need to consult `content_index` first
- If an agent uses the public well-known endpoint (no API key) instead, it must follow the `content_index.types_indexed` → directory rule

## Content Negotiation

Use the Accept header to specify the response format:

- `application/json` (default) -- AIDP JSON format
- `application/ld+json` -- Schema.org JSON-LD format
- `text/markdown` -- llms.txt Markdown format
- `text/html` -- Open Graph HTML

## Exposure Tracking

- Each MCP call automatically records AI exposure
- Agents can be identified via the User-Agent header
- Public calls are recorded as `source=mcp`; authenticated calls as `source=api_key_mcp` (tracked separately from public agent impressions)
- Exposure data can be viewed in the [SpeakSpec Dashboard](/en/guide/speakspec-guide)
