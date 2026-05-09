---
description: SpeakSpec @speakspec/astro — AIDP 0.3 SDK for Astro (Coming Soon)
---

# Astro SDK (Coming Soon)

`@speakspec/astro` — AIDP 0.3 integration for Astro 5, feature-equivalent to [`@speakspec/nuxt`](/en/developer/sdk-nuxt). Astro's server endpoint + middleware model maps cleanly onto Nitro, so the port is low-effort.

## What ships

- `src/pages/.well-known/aidp.json.ts` server endpoint — auto-publishes the entity directive
- `src/pages/.well-known/aidp/content/[id].json.ts` — signed Content envelope (§8.7)
- `src/pages/.well-known/aidp/content/index.ts` — paginated content directory (§8.8)
- `src/pages/api/_aidp/invalidate.ts` — §8.10 cache-invalidation webhook receiver
- Astro middleware — AI crawler detection + impression upload
- `<AidpDirective />` Astro component
- `astro.config.mjs` integration (auto-registers routes via the integration API)

## Why Astro is a priority SDK

Astro's user base overlaps heavily with SpeakSpec's: blogs, content sites, marketing pages, doc sites — exactly the surfaces AI agents fetch most often. The AIDP 0.3 value (signing + revocation + observability) has the highest ROI on these sites.

## Release timeline

**v0.3 Q2 release** — alongside the Nuxt SDK launch window.

## Want early access?

Email **early-access@speakspec.com** or open an issue on [GitHub](https://github.com/speakspec/aidp).

## Workarounds today

Astro static mode (`output: 'static'`) can serve a hand-crafted JSON: write a `src/pages/.well-known/aidp.json.ts` endpoint that returns the JSON exported from the SpeakSpec dashboard. See [Static File Deployment](/en/developer/static-file).

## Spec references

- [AIDP 0.3 §4.8 Cryptographic Proof](/en/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/en/spec/transport)
- [Authenticated API](/en/api/authenticated)
