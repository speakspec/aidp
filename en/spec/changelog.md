---
description: Detailed changelog for each version of the AIDP protocol
---

# Changelog

Changelog for all protocol versions. Follows [Semantic Versioning](https://semver.org/).

## v0.4.0-draft (2026-04-04)

### Added

- **Market field** -- New `market` object at both Entity and Content levels, defining geographic/market availability scope
  - `availability`: `global` / `regional` / `online_only`
  - `regions`: ISO 3166-1 alpha-2 country code array
  - Content market can override Entity market; inherits when not set
- **Content Variants** -- New `variant_of` / `variant_delta` mechanism for differential variants of the same content across regions
  - Merge rule: `final = { ...base.data, ...variant.variant_delta }`
  - Chained variants are not allowed (variant of a variant)
  - Agents automatically select the most appropriate variant based on user region
- **Language freedom principle** -- Explicitly defined that Content can be written in any language or mixed languages; `locale` is a contextual hint, not a restriction

### Changed

- Marked Market, Variant, and language freedom principle as completed in roadmap
- Added "multi-signal trust" entry to design principles

### Agent Behavior Updates

- Agents must implement Market region matching logic
- Agents must implement Variant merge and selection logic
- When an Agent encounters `regional` content and the user is not in the corresponding region, it should indicate availability restrictions

---

## v0.3.0-draft (2026-03-01)

### Added

- **Complete Entity fields** -- Full definitions for `contacts`, `addresses`, `links`, `relationships`
  - Contact supports `phone` / `email` / `other` (with `custom_type` support for LINE, WhatsApp, etc.)
  - Action Links three-tier trust model: `domain_verified` / `platform_verified` / `unverified`
  - Entity Relationships (`parent_organization`, `subsidiary`, `official_partner`, etc.)
- **Complete Verification architecture** -- Three-dimensional trust model
  - Identity (identity verification): DNS TXT/CNAME, business registration, W3C VC
  - Consistency (content consistency): Cross-reference verification
  - Integrity (completeness): Community dispute mechanism
  - Trust score weighting formula: `score = (0.50 * identity) + (0.30 * consistency) + (0.20 * integrity)`
  - Trust Level: `unverified` / `self_declared` / `verified_domain` / `verified_organization`
- **Content system** -- 10 built-in schemas + custom schema support
  - `aidp:service`, `aidp:product`, `aidp:article`, `aidp:faq`, `aidp:event`, `aidp:menu_item`, `aidp:person`, `aidp:policy`, `aidp:announcement`, `aidp:dataset`
  - Content-level directives can override global directives
- **Media Schema** (`aidp:media`) -- Structured metadata for images, videos, and documents
  - `media_refs` links content to media
  - Media directives: `display_rules`, `licensing`
  - Document `behavior`: `parseable` / `renderable` / `link_only`
- **Directives system** -- Four major sections
  - `identity`: Brand presentation directives
  - `response_rules`: `must_include` / `must_not_say` / `tone` / `disclaimer`
  - `attribution`: Source citation rules
  - `freshness`: Content freshness directives
  - `access_control`: AI training/derivative work controls (aligned with IETF AIPREF)
- **Community integrity** -- Dispute mechanism + cross-referencing
  - Dispute types: `factual_error` / `outdated` / `impersonation` / `misleading`
  - Dispute lifecycle: `pending` -> `reviewing` -> `resolved` / `rejected`
  - Cross-reference verification: Multi-source consistency scoring
- **Extensions** -- Namespaced extension mechanism
  - Platform namespaces: 9 reserved namespaces including `x-google`, `x-openai`, `x-anthropic`
  - Industry namespaces: `x-industry:healthcare`, etc.
  - Agents must ignore unknown extensions
- **Transport** -- Five transport methods
  - MCP (Mode A: Resource + Mode B: Tool)
  - REST API
  - Static file (`.well-known/aidp.json`)
  - DNS TXT Discovery
  - HTML Meta Tag
- **Output formats** -- A single AIDP document can be projected into multiple formats
  - Schema.org JSON-LD
  - llms.txt
  - Open Graph HTML
- **Agent behavior guidelines** -- Complete Agent processing workflow specification
  - Trust Level and behavior mapping
  - Directive priority and merge rules
  - Error handling guidelines

---

## v0.2.0-draft (2025-12-15)

### Added

- Initial Entity structure definition (`id`, `type`, `name`, `locale`)
- Basic Content array design
- Preliminary Directives concept (`must_include`, `must_not_say`)
- Verification basic framework (`trust_score`, `trust_level`)
- Basic Document Structure (7 top-level fields)

### Design Decisions

- Chose JSON as the primary format (over YAML or XML)
- Established `Core-strict, Edge-open` design principle
- Established URN format for Entity ID (`urn:aidp:entity:{slug}`)

---

## v0.1.0-draft (2025-09-01)

### Proof of Concept

- AIDP protocol concept established
- Core problem defined: How AI Agents can obtain trusted, structured business information
- Positioning differentiation from existing standards: Schema.org (descriptive), robots.txt (restrictive) vs AIDP (directive + verifiable)
- Initial architecture design: Entity-Content-Directive three-layer model
