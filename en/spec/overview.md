---
description: AIDP protocol specification overview, defining structured information formats and AI Agent directive standards
---

# Overview

> **Version:** 0.1.0
> **Status:** Released
> **License:** CC-BY-4.0 (spec text)

AIDP (AI Directive Protocol) defines a standard format that allows content providers (businesses, organizations, individuals) to publish **structured information designed for AI Agent consumption**, along with **directives that guide how AI should present that information in its responses**.

Think of it as:

- **Schema.org** -> Tells search engines *what* your content is
- **AIDP** -> Tells AI Agents *what* your content is, *how to talk about it*, and *how much to trust it*

## Design Principles

| Principle | Description |
|---|---|
| **Strict core, open edges** | Core fields are strictly defined; everything else is extensible |
| **Machine-first, human-readable** | Output is JSON, but developers can read it directly |
| **Trust is verifiable, not self-claimed** | Trust levels are derived from verification methods, not self-reported by users |
| **Transport-agnostic** | Can be served via MCP, REST, static files, DNS TXT, or embedded in HTML |
| **Backward-compatible evolution** | New versions must not break parsers for older versions |
| **Multi-format output** | A single AIDP source document can be projected into Schema.org, llms.txt, Open Graph, and other formats |
| **Built on existing standards** | Leverages W3C VC/DID, IETF AIPREF, C2PA rather than reinventing the wheel |
| **First-party facts only** | Directives carry only verifiable facts, not marketing claims or subjective opinions |
| **Multi-signal trust** | Trust is evaluated across three dimensions: identity, content integrity, and community consensus |
| **Language-agnostic** | AI Agents have cross-language understanding capabilities; Content can be written in any language, and locale serves only as a hint |

## Terminology

| Term | Definition |
|---|---|
| **Entity** | A business, individual, or organization that owns content |
| **Directive** | An instruction that guides how AI should process/present content |
| **Agent** | Any AI system that reads AIDP data |
| **Provider** | A platform or system that hosts AIDP endpoints |
| **Projection** | The process of converting an AIDP document into other formats (e.g., Schema.org, llms.txt) |

## Minimal Document (Quick Start)

The smallest valid AIDP document. A business can start from here:

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:my-shop",
    "type": "business",
    "name": { "default": "My Shop" },
    "locale": "en-US"
  },
  "verification": {
    "methods": [],
    "trust_score": 0.10,
    "trust_level": "unverified",
    "last_verified": null
  },
  "content": [],
  "directives": {
    "response_rules": {
      "must_include": [],
      "must_not_say": []
    }
  }
}
```

This is a valid AIDP document with zero content. An Entity can progressively add:

1. **Domain + DNS verification** -> `trust_level` upgrades to `verified_domain`
2. **Content items** -> Services, products, FAQ, media
3. **Directives** -> `must_include`, `must_not_say`, tone, disclaimers
4. **Business registration** -> `trust_level` upgrades to `verified_organization`

All fields beyond the minimal document are optional. Platform UIs should guide users to complete them progressively, rather than requiring everything at once.
