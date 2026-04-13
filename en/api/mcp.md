# MCP API

MCP (Model Context Protocol) endpoint. No authentication required.

Base URL: `https://api.speakspec.com`

## Endpoint

```
POST /mcp
```

Uses the JSON-RPC 2.0 protocol.

**Request Content-Type:** `application/json`

## Supported Methods

| Method | Description |
|---|---|
| `resources/list` | List all available AIDP Resources |
| `resources/read` | Read a specific AIDP Resource |
| `tools/list` | List available MCP Tools |
| `tools/call` | Call an MCP Tool |

## Available Tools

### aidp_query

Search and retrieve AIDP Entity documents, with filtering by type and category.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | No | Filter by Entity type (e.g., `business`, `person`, `product`) |
| `category` | string[] | No | Filter by category tags |
| `limit` | integer | No | Maximum number of results (default 10, max 50) |

### aidp_entity_info

Get Entity basic information (without content), including identity, verification status, and directives.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `entity_id` | string | Yes | Entity AIDP ID (slug or full URN, e.g., `sakura-ramen-pdx`) |

## Example: tools/call (aidp_query)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
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

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"$aidp\":\"0.1.0\",\"entity\":{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":{\"default\":\"Sakura Ramen\"},\"type\":\"business\"},\"content\":[...],\"verification\":{\"trust_level\":\"verified_domain\"}}]"
      }
    ]
  }
}
```

## Example: tools/call (aidp_entity_info)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "aidp_entity_info",
    "arguments": {
      "entity_id": "sakura-ramen-pdx"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":\"Sakura Ramen\",\"type\":\"business\",\"description\":\"Authentic Japanese ramen in Portland\",\"trust_level\":\"verified_domain\",\"created_at\":\"2026-01-15T00:00:00Z\"}"
      }
    ]
  }
}
```

## Example: resources/list

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/list"
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resources": [
      {
        "uri": "aidp://entity/sakura-ramen-pdx",
        "name": "Sakura Ramen",
        "description": "Authentic Japanese ramen in Portland",
        "mimeType": "application/json"
      }
    ]
  }
}
```
