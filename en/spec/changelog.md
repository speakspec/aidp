---
description: Detailed changelog for each version of the AIDP protocol
---

# Changelog

Changelog for all protocol versions. Follows [Semantic Versioning](https://semver.org/).

## v0.1.0 (2026-04-12)

Initial public release of the AIDP protocol.

### Core Architecture

- **Document Structure** -- 7 top-level fields in JSON format (`$aidp`, `entity`, `verification`, `content`, `directives`, `community`, `extensions`)
- **Core-strict, Edge-open** design principle
- URN format for Entity ID (`urn:aidp:entity:{slug}`)

### Entity

- Complete Entity field definitions (`id`, `type`, `name`, `locale`, `contacts`, `addresses`, `links`, `relationships`)
- Contact supports `phone` / `email` / `other` (with `custom_type` support for LINE, WhatsApp, etc.)
- Action Links three-tier trust model: `domain_verified` / `platform_verified` / `unverified`
- Entity Relationships (`parent_organization`, `subsidiary`, `official_partner`, etc.)
- **Market field** -- `market` object at both Entity and Content levels, defining geographic/market availability scope

### Verification

- Three-dimensional trust model: Identity + Consistency + Integrity
- Trust score weighting formula: `score = (0.50 * identity) + (0.30 * consistency) + (0.20 * integrity)`
- Trust Level: `unverified` / `self_declared` / `verified_domain` / `verified_organization`
- Verification methods: DNS TXT/CNAME, business registration, W3C VC

### Content

- 10 built-in schemas + custom schema support
- Media Schema (`aidp:media`) -- Structured metadata for images, videos, and documents
- Content-level directives can override global directives
- **Content Variants** -- `variant_of` / `variant_delta` mechanism for differential variants of the same content across regions
- **Language freedom principle** -- Content can be written in any language or mixed languages; `locale` is a contextual hint, not a restriction

### Directives

- Four major sections: `identity`, `response_rules`, `attribution`, `freshness`
- `response_rules`: `must_include` / `must_not_say` / `tone` / `disclaimer`
- `access_control`: AI training/derivative work controls (aligned with IETF AIPREF)

### Community

- Dispute mechanism: `factual_error` / `outdated` / `impersonation` / `misleading`
- Dispute lifecycle: `pending` -> `reviewing` -> `resolved` / `rejected`
- Cross-reference verification: Multi-source consistency scoring

### Extensions

- Namespaced extension mechanism
- Platform namespaces: 9 reserved namespaces including `x-google`, `x-openai`, `x-anthropic`
- Industry namespaces: `x-industry:healthcare`, etc.

### Transport

- MCP (Mode A: Resource + Mode B: Tool)
- REST API
- Static file (`.well-known/aidp.json`)
- DNS TXT Discovery
- HTML Meta Tag

### Output Formats

- Schema.org JSON-LD
- llms.txt
- Open Graph HTML

### Agent Behavior

- Complete Agent processing workflow specification
- Trust Level and behavior mapping
- Directive priority and merge rules
- Market region matching logic
- Variant merge and selection logic
