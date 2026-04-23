---
description: SpeakSpec public API reference for AI Agent and third-party system integration
---

# API Reference

The SpeakSpec platform provides public APIs for AI Agents and third-party systems to access AIDP data.

## Base URL

```
https://api.speakspec.com
```

All responses are in JSON format.

## Endpoint Categories

| Category | Auth | Description |
|------|------|------|
| [Public API](/en/api/public) | None | Access AIDP documents via HTTP with content negotiation |
| [MCP API](/en/api/mcp) | None | Access AIDP data via the MCP JSON-RPC protocol |
| [Authenticated API](/en/api/authenticated) | API Key | Manage Entities, Content, Directives, and other resources |

## Rate Limiting

All endpoints are subject to request rate limits. When limits are exceeded, an HTTP 429 status code is returned. Response headers include:

- `X-RateLimit-Limit` - Maximum requests per minute
- `X-RateLimit-Remaining` - Remaining available requests
- `X-RateLimit-Reset` - Unix timestamp when the limit resets

## Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

| Error Code | HTTP Status | Description |
|--------|------------|------|
| `NOT_FOUND` | 404 | The requested resource does not exist |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
