# MCP API

MCP (Model Context Protocol) endpoint. Supports both public mode (no authentication) and authenticated mode (via X-API-Key header).

Base URL: `https://api.speakspec.com`

## Endpoint

```
POST /mcp
```

Uses the JSON-RPC 2.0 protocol.

**Request Content-Type:** `application/json`

**Authentication (optional):** add `X-API-Key: aidp_...` header to unlock 50 entity-scoped tools. All such tools are automatically bound to the entity owning the API key.

> **Since v0.4**: `list_contents` / `get_content` still return the full content set, independent of the well-known inline/directory strategy.

## Supported Methods

| Method | Description |
|---|---|
| `resources/list` | List all available AIDP Resources |
| `resources/read` | Read a specific AIDP Resource |
| `tools/list` | List available MCP Tools |
| `tools/call` | Call an MCP Tool |

## Public Tools (no authentication)

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

## Authenticated Tools (requires X-API-Key)

All tools are automatically bound to the API key's `entity_id` — do not pass `entity_id` in `arguments`. Calling a write tool with a `read`-scope key returns JSON-RPC error `-32002` INSUFFICIENT_SCOPE.

### Entity (4)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_entity_get` | read | `GET /entities/:id` | - |
| `aidp_entity_update` | write | `PUT /entities/:id` | `name`, `description`, `categories`, `tags`, `languages`, `default_language`, `reason` |
| `aidp_entity_usage` | read | `GET /entities/:id/usage` | - |
| `aidp_entity_audit_logs` | read | `GET /entities/:id/audit-logs` | `page`, `page_size` |

### Content (11)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_content_list` | read | `GET /contents` | `page`, `page_size`, `type`, `status` |
| `aidp_content_get` | read | `GET /contents/:contentId` | `content_id` |
| `aidp_content_create` | write | `POST /contents` | `type`, `data`, `reason` |
| `aidp_content_update` | write | `PUT /contents/:contentId` | `content_id`, `data`, `reason` |
| `aidp_content_delete` | write | `DELETE /contents/:contentId` | `content_id`, `reason` |
| `aidp_content_save_draft` | write | `PUT /contents/:contentId/draft` | `content_id`, `data` |
| `aidp_content_publish` | write | `POST /contents/:contentId/publish` | `content_id`, `reason` |
| `aidp_content_discard_draft` | write | `DELETE /contents/:contentId/draft` | `content_id` |
| `aidp_content_lock` | write | `POST/DELETE /contents/:contentId/lock` | `content_id`, `acquire` (bool) |
| `aidp_content_versions_list` | read | `GET /contents/:contentId/versions` | `content_id`, `page`, `page_size` |
| `aidp_content_version_restore` | write | `POST /contents/:contentId/versions/:version/restore` | `content_id`, `version`, `reason` |

### Directives (3)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_directives_get` | read | `GET /directives` | - |
| `aidp_directives_update` | write | `PUT /directives` | `allow_training`, `require_attribution`, `commercial_use`, `reason` |
| `aidp_directives_submit_evidence` | write | `PUT /directives/evidence` | `evidence_url`, `evidence_type` |

### Verification (5)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_verify_status` | read | `GET /verify/status` | - |
| `aidp_verify_dns_init` | write | `POST /verify/dns/init` | `domain` |
| `aidp_verify_dns_check` | write | `POST /verify/dns/check` | `domain` |
| `aidp_verify_email_init` | write | `POST /verify/email/init` | `email` |
| `aidp_verify_business_init` | write | `POST /verify/business-registration/init` | `filename`, `body_base64` |

### Output (4, all read)

| Tool | REST |
|---|---|
| `aidp_output_aidp` | `GET /output/aidp` |
| `aidp_output_schema_org` | `GET /output/schema-org` |
| `aidp_output_llms_txt` | `GET /output/llms-txt` |
| `aidp_output_og_tags` | `GET /output/og-tags` |

### Links (4)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_links_list` | read | `GET /links` | `page`, `page_size` |
| `aidp_links_create` | write | `POST /links` | `target_url`, `label`, `type` |
| `aidp_links_update` | write | `PUT /links/:linkId` | `link_id`, `target_url`, `label`, `type` |
| `aidp_links_delete` | write | `DELETE /links/:linkId` | `link_id` |

### Analytics (14, all read)

| Tool | REST | Key parameters |
|---|---|---|
| `aidp_analytics_overview` | `GET /analytics/overview` | `from`, `to` |
| `aidp_analytics_daily` | `GET /analytics/daily` | `from`, `to` |
| `aidp_analytics_agents` | `GET /analytics/agents` | `from`, `to` |
| `aidp_analytics_content` | `GET /analytics/content` | `from`, `to` |
| `aidp_analytics_links` | `GET /analytics/links` | `from`, `to` |
| `aidp_analytics_hourly` | `GET /analytics/hourly` | `from`, `to` |
| `aidp_analytics_sources` | `GET /analytics/sources` | `from`, `to` |
| `aidp_analytics_countries` | `GET /analytics/countries` | `from`, `to`, `limit` |
| `aidp_analytics_performance` | `GET /analytics/performance` | `from`, `to` |
| `aidp_analytics_mcp_tools` | `GET /analytics/mcp-tools` | `from`, `to`, `limit` |
| `aidp_analytics_bot_vs_human` | `GET /analytics/bot-vs-human` | `from`, `to` |
| `aidp_analytics_visitors` | `GET /analytics/visitors` | `from`, `to` |
| `aidp_analytics_referrers` | `GET /analytics/referrers` | `from`, `to`, `limit` |
| `aidp_analytics_link_daily` | `GET /analytics/link-daily` | `from`, `to` |

### Import / Export (2)

| Tool | Scope | REST | Key parameters |
|---|---|---|---|
| `aidp_export` | read | `GET /export` | - |
| `aidp_import` | write | `POST /import` | `data`, `dry_run` |

### AI aggregate tools (3)

| Tool | Scope | Description |
|---|---|---|
| `aidp_entity_summary` | read | Fetches entity + directives + verify status + content list + usage in parallel |
| `aidp_content_bulk_upsert` | write | Batch create / update content with per-item partial-failure reporting |
| `aidp_search_own_entity` | read | Full-text search forced to the API key's entity |

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
