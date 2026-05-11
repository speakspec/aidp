---
description: SpeakSpec @speakspec/next — AIDP 0.3 SDK for Next.js（即將推出）
---

# Next.js SDK（即將推出）

`@speakspec/next` — Next.js 15 (App Router) 的 AIDP 0.3 整合套件，與 [`@speakspec/nuxt`](/developer/sdk-nuxt) 功能對等。

## 預計提供

- `/.well-known/aidp.json` Route Handler — 自動 expose entity directive，含快取 + ETag + 304 conditional GET
- `/.well-known/aidp/content/[id]/route.ts` — 簽過的 Content envelope（§8.7）
- `/.well-known/aidp/content/route.ts` — 分頁 content directory（§8.8）
- `app/api/_aidp/invalidate/route.ts` — §8.10 cache-invalidation webhook 接收
- Next.js middleware — AI crawler 偵測 + impression 上送
- `<AidpDirective>` React component + `useAidpContent()` hook
- `next.config.js` 整合 + 環境變數對齊 Nuxt 版本

## 上線排程

**v0.3 Q2 release**（與 Nuxt SDK 同 launch window）。

## 想搶先試？

Email **early-access@speakspec.com** 或在 [GitHub](https://github.com/speakspec/aidp) 開 issue。我們會給 closed alpha access。

## 目前可行的替代方案

1. **手動 publish 靜態 JSON** — `/.well-known/aidp.json` 放在 `public/` 目錄即可。詳見 [靜態檔案部署](/developer/static-file)。缺點：沒有自動簽章更新、沒有 AI bot 流量觀測。
2. **若您的後端可以同時跑 Nuxt** — 把 SpeakSpec 的 publishing 路徑分流到 Nuxt 子應用，主站維持 Next.js。

## 規範參考

- [AIDP 0.3 §4.8 Cryptographic Proof](/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/spec/transport)
- [Authenticated API](/api/authenticated)
