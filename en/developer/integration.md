---
description: AIDP developer integration guide covering MCP, REST API, and static file integration methods
---

# Integration Overview

The AIDP protocol provides three integration methods, suited to different use cases and technical requirements.

## Three Integration Methods

1. **MCP Integration** -- AI Agents access AIDP data directly via MCP JSON-RPC (recommended for AI application developers)
2. **REST API** -- Manage Entities, Content, and Directives via HTTP API and retrieve various output formats
3. **Static File** -- Place AIDP JSON at `/.well-known/aidp.json`, the simplest deployment method

## Method Comparison

| Method | Use Case | Authentication | Real-time Updates | Full Directive Support |
|---|---|---|---|---|
| MCP | Direct AI Agent access | Not required | Yes | Yes |
| REST API | Third-party system integration | JWT Token | Yes | Yes |
| Static File | Simple deployment, self-hosting | Not required | Manual | Yes |

## How to Choose

If you are developing an AI Agent or AI application, **MCP Integration** is the most recommended approach. AI Agents can query AIDP data directly through the standard MCP protocol without any additional authentication process.

If you need to manage Entities and Content within your own system, or need to programmatically create and update data, use the **REST API**.

If you only need AI Agents to be able to read your data and do not need to manage content through a platform, **Static File** is the simplest choice.

## Detailed Documentation

- [MCP Integration](/developer/mcp-integration) -- MCP endpoint, Resource mode, Tool mode
- [REST API Integration](/developer/rest-api) -- Authentication, CRUD operations, public API
- [Static File Deployment](/developer/static-file) -- File setup, web server configuration, DNS verification
