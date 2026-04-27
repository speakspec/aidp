# Changelog

All notable changes to the AIDP protocol are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-04-28

### Changed

- **LocalizedString fields (`name`, `description`) now accept either a bare string or the existing `{default, [locale]: ...}` object form.** Bare string is shorthand for `{default: <string>}`. See §3.3.
- Implementations MUST handle both forms (§9 agent behavior).
- Projections resolve LocalizedString via `value[locale] ?? value.default` (§11).

### Fixed

- Search trigger now indexes all locale values of `name`, not just `default` — multi-locale entities are now findable in non-default locales.

### Migration

Existing v0.1.0 entities (all use object form) are unchanged. New entities MAY use either form. Aggregator endpoints (`.well-known/aidp-directory.json`, `/public/search`) continue to emit object form for backward compatibility.

## [0.1.0] — 2026-04-23

Initial public release of the AIDP (AI Directive Protocol) specification.

### Core architecture

- Document structure with 7 top-level fields (`$aidp`, `entity`, `verification`, `content`, `directives`, `community`, `extensions`)
- Core-strict, Edge-open design principle
- Entity IDs in URN format (`urn:aidp:entity:{slug}`)

### Entity

- Full entity schema (`id`, `type`, `name`, `locale`, `contacts`, `addresses`, `links`, `relationships`)
- Contact types: `phone` / `email` / `other` (with `custom_type` for LINE, WhatsApp, etc.)
- Action Links with three-tier trust model: `domain_verified` / `platform_verified` / `unverified`
- Entity relationships (`parent_organization`, `subsidiary`, `official_partner`, etc.)
- `market` field on entity and content — geographic / market availability

### Verification

- Path-based trust model (not additive): highest reached path wins
  - `email_domain` (role address) → `claimed` (0.40)
  - `dns_txt` / `dns_cname` → `verified_domain` (0.65)
  - DNS + admin-approved `business_registration` → `verified_organization` (0.80)
- `business_registration` requires a verified DNS method as prerequisite
- `meta_tag` is display-only and NOT counted in trust score
- Stackable bonus: `manual_review` adds +0.10 on any path (admin-initiated only)
- Tier cap: non-privileged entity types are capped at 0.89 (only `government` / `institutional` may exceed)
- Trust level admin override: MAY be set; requires reason and audit log entry
- W3C Verifiable Credential field present but NOT active in v0.1 (reserved)

### Content

- 10 built-in schemas + custom schema support
- Media schema (`aidp:media`) for images, video, documents
- Content-level directives override global directives
- Content variants (`variant_of` / `variant_delta`) for regional differences
- Language freedom: content MAY use any language or mixed languages; `locale` is a hint, not a restriction

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

### Output formats

- Schema.org JSON-LD projection
- llms.txt projection
- Open Graph HTML projection

### Agent behavior

- Agent processing-flow specification
- Trust-level → behavior mapping
- Directive precedence and merge rules
- Market / region matching logic
- Variant selection and delta merging
