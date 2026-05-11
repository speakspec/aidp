---
description: SpeakSpec @speakspec/next — AIDP 0.3 SDK for Next.js (Coming Soon)
---

# Next.js SDK (Coming Soon)

`@speakspec/next` — AIDP 0.3 integration for Next.js 15 (App Router), feature-equivalent to [`@speakspec/nuxt`](/en/developer/sdk-nuxt).

## What ships

- `/.well-known/aidp.json` Route Handler — auto-publishes the entity directive with cache + ETag + 304 conditional GET
- `/.well-known/aidp/content/[id]/route.ts` — signed Content envelope (§8.7)
- `/.well-known/aidp/content/route.ts` — paginated content directory (§8.8)
- `app/api/_aidp/invalidate/route.ts` — §8.10 cache-invalidation webhook receiver
- Next.js middleware — AI crawler detection + impression upload
- `<AidpDirective>` React component + `useAidpContent()` hook
- `next.config.js` integration + env vars aligned with the Nuxt SDK

## Release timeline

**v0.3 Q2 release** — alongside the Nuxt SDK launch window.

## Want early access?

Email **early-access@speakspec.com** or open an issue on [GitHub](https://github.com/speakspec/aidp). We'll send closed alpha access.

## Workarounds today

1. **Hand-publish a static JSON** — drop `/.well-known/aidp.json` into Next's `public/` directory. See [Static File Deployment](/en/developer/static-file). Trade-off: no auto signature refresh, no AI bot traffic observability.
2. **Run a small Nuxt sidecar** — route SpeakSpec publishing through a Nuxt sub-app while the main site stays on Next.js.

## Spec references

- [AIDP 0.3 §4.8 Cryptographic Proof](/en/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/en/spec/transport)
- [Authenticated API](/en/api/authenticated)
