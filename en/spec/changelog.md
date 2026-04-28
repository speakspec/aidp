---
description: Detailed changelog for each version of the AIDP protocol
---

# Changelog

Changelog for all protocol versions. Follows [Semantic Versioning](https://semver.org/).

## v0.2.0 (2026-04-28)

### Changed

- **LocalizedString fields (`name`, `description`) now accept either a bare string or the existing `{default, [locale]: ...}` object form.** Bare string is shorthand for `{default: <string>}`. See §3.3.
- Implementations MUST handle both forms (§9 agent behavior).
- Projections resolve LocalizedString via `value[locale] ?? value.default` (§11).

### Fixed

- Search trigger now indexes all locale values of `name`, not just `default` — multi-locale entities are now findable in non-default locales.

### Migration

Existing v0.1.0 entities (all use object form) are unchanged. New entities MAY use either form. Aggregator endpoints (`.well-known/aidp-directory.json`, `/public/search`) continue to emit object form for backward compatibility.

## v0.1.0 (2026-04-23)

Initial public release of the AIDP protocol.

### Core Architecture

- **Document Structure** — 7 top-level fields in JSON format (`$aidp`, `entity`, `verification`, `content`, `directives`, `community`, `extensions`)
- **Core-strict, Edge-open** design principle
- URN-format Entity ID (`urn:aidp:entity:{slug}`)

### Entity

- Full entity field definitions (`id`, `type`, `name`, `locale`, `contacts`, `addresses`, `links`, `relationships`)
- Contact types: `phone` / `email` / `other` (with `custom_type` support for LINE, WhatsApp, etc.)
- Action Links three-tier trust model: `domain_verified` / `platform_verified` / `unverified`
- Entity Relationships (`parent_organization`, `subsidiary`, `official_partner`, etc.)
- **Market field** — entity- and content-level `market` object defining geographic / market availability

### Verification

- **Path-based trust model (non-additive)**: three independent gates; the platform picks the highest reached
  - `email_domain` (role address) → `claimed` (0.40)
  - `dns_txt` / `dns_cname` → `verified_domain` (0.65)
  - DNS **and** admin-approved `business_registration` → `verified_organization` (0.80)
- `business_registration` requires a verified DNS method as prerequisite
- `meta_tag` is excluded from the score (display only)
- **Stackable bonus**: `manual_review` adds +0.10 on any path; admin-initiated only
- **Tier cap 0.89**: non-privileged entity types cannot exceed 0.89 (only `government` / `institutional` may)
- **Trust level override**: admins may pin `trust_level` to any enum value with a required reason, recorded in the audit log
- W3C Verifiable Credential field reserved; NOT active in v0.1

### Content

- 10 built-in schemas + custom schema support
- Media Schema (`aidp:media`) — structured metadata for images, video, documents
- Content-level directives override global directives
- **Content Variants** — `variant_of` / `variant_delta` mechanism for regional differences
- **Language freedom** — content MAY use any language or mixed languages; `locale` is a hint, not a restriction

### Directives

- Four sections: `identity`, `response_rules`, `attribution`, `freshness`
- `response_rules`: `must_include` / `must_not_say` / `tone` / `disclaimer`
- `access_control`: AI training / derivative-work controls (aligns with IETF AIPREF)

### Community

- Dispute categories: `factual_error` / `outdated` / `impersonation` / `misleading`
- Dispute lifecycle: `pending` → `reviewing` → `resolved` / `rejected`
- Cross-reference consistency scoring

### Extensions

- Namespaced extension mechanism
- Platform namespaces reserved: `x-google`, `x-openai`, `x-anthropic`, and 6 others
- Industry namespaces: `x-industry:healthcare`, etc.

### Transport

- MCP (Mode A: Resource, Mode B: Tool)
- REST API
- Static file (`.well-known/aidp.json`)
- DNS TXT discovery
- HTML meta tag

### Output Formats

- Schema.org JSON-LD
- llms.txt
- Open Graph HTML

### Agent Behavior

- Agent processing-flow specification
- Trust-level → behavior mapping
- Directive precedence and merge rules
- Market / region matching logic
- Variant selection and delta merging
