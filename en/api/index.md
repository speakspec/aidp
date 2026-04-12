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

## Public Endpoints

The following endpoints do not require authentication and are accessible by anyone:

| Category | Description |
|------|------|
| [Public API](/en/api/public) | Access AIDP documents via HTTP with content negotiation support |
| [MCP API](/en/api/mcp) | Access AIDP data via the MCP JSON-RPC protocol |

## Platform Management API

The SpeakSpec platform also provides a full management API for registered users to manage Entities, Content, Directives, verification, and analytics data. The management API requires authentication; please refer to the built-in API documentation within the platform.

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
