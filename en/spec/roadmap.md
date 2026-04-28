# Roadmap

Version planning roadmap for the AIDP protocol.

## Released

- [x] **v0.2.0** (2026-04-28) -- Polymorphic LocalizedString: `name` / `description` accept either bare string or `{default, [locale]: ...}` object form. Search trigger now indexes all locale values of `name` (not just `default`).
- [x] **v0.1.0** (2026-04-23) -- Initial public release: entity, verification, content, directives, transport, projections, community integrity.

## Planned

- [ ] **v0.2.x** -- Redirect proxy tracking parameter standardization and link_redirects/link_clicks behavior specification
- [ ] **v0.2.x** -- Platform verification (OAuth and meta tag verification) for third-party link trust
- [ ] **v0.2.x** -- Real-time content push (WebSocket / SSE for live updates)
- [ ] **v0.2.x** -- Agent feedback loop (Agents report stale/incorrect content back to the platform)
- [ ] **v0.3** -- Enable C2PA provenance fields for media verification
- [ ] **v0.3** -- Per-content-item cryptographic signatures
- [ ] **v0.4** -- Marketplace layer (paid directives, content provider analytics)
- [ ] **v0.4** -- Projection plugin system (third parties can register custom output formats)
- [ ] **v0.5** -- Dispute reputation system (disputer track record affects dispute weight)
- [ ] **v0.5** -- Automated dispute resolution through multi-source consensus
- [ ] **v1.0** -- Stable release with reference implementation + VC/DID fully enabled
