# Changelog

All notable changes to the AIDP protocol are documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

## [0.4.0] — 2026-MM-DD

> **Status:** Released. Tag `v0.4.0`. Spec text frozen for v0.4 series.

### Added
- **`content_index` top-level field** (§8.X) — pointer + metadata for the content directory; indicates which types are fully inlined vs only available via directory endpoint
- **`pinned` envelope field** (§4) — boolean flag to force a content into `aidp.json` regardless of its type strategy
- **`?pinned=true|false` filter** on `/.well-known/aidp/content/directory.json` (§8.X)

### Changed
- `aidp.json.content` is now filtered per entity content strategy (per-type `inline` / `directory`). Default: all types `inline` (existing behavior preserved when `content_strategy` is unset).

### Upgrade semantics
- v0.4 is a hard cut from v0.3 (single internal user; no rolling compatibility window). v0.3 clients are not guaranteed to work against v0.4 servers.
- New entities and unmigrated entities default to `content_strategy = {}` which is interpreted as all types `inline`, preserving v0.3 behavior at the wire level until the entity owner opts into directory mode.

## [0.3.0] — 2026-05-12

> **Status:** Released. Tag `v0.3.0`. Spec text frozen for v0.3 series.

### Added

- **Three-layer decoupling design principle** (§1.1) — Transport, Verification, and Consumption are now independent layers; agents can pick any combination.
- **Cryptographic proof `_proof` (§4.8)** — optional detached signature issued by a trust provider, verifiable against a public-key JWKS endpoint. Supports `ed25519-jws`. Multiple proofs allowed via `_proofs[]`.
- **Content Endpoint Transport (§8.7)** — `/.well-known/aidp/content/{id}.json` returns a complete `Content` object (body + media + directives + signature). Enables AI agents to consume content via AIDP rather than parsing HTML.
- **Content Directory (§8.8)** — `/.well-known/aidp/content/` paginated index of all content for an entity. The AIDP-layer equivalent of `sitemap.xml`.
- **Inline Embedding (§8.9)** — `<script type="application/aidp+json">` block in HTML. Two modes: `ContentPointer` (default, ~600 bytes) and full `Content` (opt-in, 2–4 KB). Always carries `_proof`.
- **Webhook Cache Invalidation (§8.10)** — `POST {site}/api/_aidp/invalidate` with HMAC + replay protection. Single canonical event `directive.updated` with `scope: entity | content`.
- **Public Key JWKS Endpoint (§8.11)** — `{trust_provider}/.well-known/aidp-keys` exposes signing keys; standard JWKS format with `OKP/Ed25519` keys.
- **Canonical Verification Endpoint (§8.12)** — `{trust_provider}/v/{eid}/{cid}` returns small `VerificationResponse` (`valid`, `revoked`, `current_version`); intentionally not cacheable.
- **Revocation List (§8.13)** — `{trust_provider}/.well-known/aidp-revocation` enumerates revoked entities, content, or signing keys; cacheable for 1 hour.
- **HTML link relations (§8.5)** — added `aidp-content` (per-page binding) and `aidp-keys` (JWKS pointer).
- **Endpoint Preference behavior (§9.1.1)** — agents SHOULD prefer Content Endpoint over HTML scraping when `<link rel="aidp-content">` is present.
- **Verification Behavior (§9.10)** — defines the JWKS fetch / signature verification / canonical lookup flow; failures degrade trust but never reject the payload.
- **Content Endpoint to Schema.org Projection (§11.8)** — mapping table for projecting v0.3 Content responses into Schema.org `Article` for SEO reuse.
- **JSON Schema artifact** `public/schema/v0.3.0.json` with `$defs` for `Proof`, `Content`, `ContentPointer`, `ContentDirectory`, `VerificationResponse`, `TrustProviderKeys`, `RevocationList`, `WebhookInvalidation`.

### Changed

- Transport priority list (§8.6) reordered: Content Endpoint (new) inserted at #3 ahead of Static file; Inline embedding added at the bottom of the discovery tier; Verification endpoints (§8.11–8.13) noted as orthogonal to the priority list.
- §9.1 Processing Order step 3 now references `_proof` verification alongside existing `credential` verification.
- §4.7.1 platform field table gains an optional `attestation_url` row for entity-level verification lookup (complements per-payload `_proof.canonical_url`).
- §8.7 Content Endpoint envelope is documented as a superset of §5 Content fields with a dedicated field reference (§8.7.1) listing endpoint-specific additions (`url`, `title`, `language`, `published_at`, `version`, `author`, `media`, `links`, `verification`, `_proof`).
- v0.3 canonical timestamp field name aligned with §5.1 — endpoints, pointers, and signed fields use `updated_at` (RFC drafts initially used `modified_at`; this was corrected before any release).

### Backward Compatibility

- All v0.3 additions are **additive**. v0.2 payloads remain valid v0.3 documents.
- v0.2 clients encountering `_proof` SHOULD ignore the unknown field per §1.1 ("Backwards-compatible evolution") rather than failing parsing.
- `verification.platform` field already exists in v0.2 (§4.7); v0.3 adds an optional `attestation_url` sub-field for agents to look up authoritative verification status.

### Migration

No breaking changes. Existing v0.2 entity directives at `/.well-known/aidp.json` continue to validate. New optional fields:

- Add `_proof` to entity directive once a trust provider issues a signature
- Publish per-content endpoints under `/.well-known/aidp/content/{id}.json` when ready to expose AI-readable content channel
- Add `<link rel="aidp-content">` and `<link rel="aidp-keys">` to article / product pages

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
