# Roadmap

Version planning roadmap for the AIDP protocol.

## Released

- [x] **v0.4.0** (2026-05-12) -- Content delivery strategy: per-entity per-type `inline` / `directory` switch; new top-level `content_index` field (pointer to the directory + metadata on which types are inlined vs indexed); new `pinned` envelope flag (force a content into `aidp.json` regardless of its type strategy); `/.well-known/aidp/content/directory.json` accepts `?pinned=true|false` filter.
- [x] **v0.3.0** (2026-05-12) -- Three-layer decoupling design (Transport / Verification / Consumption); cryptographic `_proof` (`ed25519-jws`); Content Endpoint (§8.7) + Content Directory (§8.8) + Inline Embedding (§8.9); Webhook cache invalidation (§8.10, HMAC + replay protection); JWKS (§8.11) / Verification (§8.12) / Revocation (§8.13) endpoints; JSON Schema artifact `v0.3.0.json`.
- [x] **v0.2.0** (2026-04-28) -- Polymorphic LocalizedString: `name` / `description` accept either bare string or `{default, [locale]: ...}` object form. Search trigger now indexes all locale values of `name` (not just `default`).
- [x] **v0.1.0** (2026-04-23) -- Initial public release: entity, verification, content, directives, transport, projections, community integrity.

## Planned

- [ ] **v0.4.x** -- Redirect proxy tracking parameter standardization and link_redirects/link_clicks behavior specification
- [ ] **v0.4.x** -- Platform verification (OAuth and meta tag verification) for third-party link trust
- [ ] **v0.4.x** -- Real-time content push (WebSocket / SSE for live updates)
- [ ] **v0.4.x** -- Agent feedback loop (Agents report stale/incorrect content back to the platform)
- [ ] **v0.5** -- C2PA provenance fields for media verification (fills the §3.7 placeholder)
- [ ] **v0.5** -- Marketplace layer (paid directives, content provider analytics)
- [ ] **v0.5** -- Projection plugin system (third parties can register custom output formats)
- [ ] **v0.6** -- Dispute reputation system (disputer track record affects dispute weight)
- [ ] **v0.6** -- Automated dispute resolution through multi-source consensus
- [ ] **v1.0** -- Stable release with reference implementation + VC/DID fully enabled
