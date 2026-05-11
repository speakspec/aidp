---
description: SpeakSpec @speakspec/astro — AIDP 0.3 SDK for Astro（即將推出）
---

# Astro SDK（即將推出）

`@speakspec/astro` — Astro 5 的 AIDP 0.3 整合套件，與 [`@speakspec/nuxt`](/developer/sdk-nuxt) 功能對等。Astro 的 server endpoint + middleware 模型跟 Nitro 高度相似，移植成本低。

## 預計提供

- `src/pages/.well-known/aidp.json.ts` server endpoint — 自動 expose entity directive
- `src/pages/.well-known/aidp/content/[id].json.ts` — 簽過的 Content envelope（§8.7）
- `src/pages/.well-known/aidp/content/index.ts` — 分頁 content directory（§8.8）
- `src/pages/api/_aidp/invalidate.ts` — §8.10 cache-invalidation webhook 接收
- Astro middleware — AI crawler 偵測 + impression 上送
- `<AidpDirective />` Astro component
- `astro.config.mjs` 整合（透過 integration API 自動註冊路由）

## 為什麼 Astro 是 SpeakSpec 重點 SDK

Astro 的客群跟 SpeakSpec 重疊極高：blog / 內容站 / marketing 網站 / docs 站，都是 AI agent 會頻繁抓的目標。AIDP 0.3 的價值（簽章 + 撤銷 + 觀測）對這類站台 ROI 最高。

## 上線排程

**v0.3 Q2 release**（與 Nuxt SDK 同 launch window）。

## 想搶先試？

Email **early-access@speakspec.com** 或在 [GitHub](https://github.com/speakspec/aidp) 開 issue。

## 目前可行的替代方案

Astro 的純靜態模式（`output: 'static'`）可以放靜態 JSON：在 `src/pages/.well-known/aidp.json.ts` 寫一個自訂 endpoint 把 dashboard 匯出的 JSON 直接 return。詳見 [靜態檔案部署](/developer/static-file)。

## 規範參考

- [AIDP 0.3 §4.8 Cryptographic Proof](/spec/transport#cryptographic-proof)
- [AIDP 0.3 §8.5–8.13 Transport](/spec/transport)
- [Authenticated API](/api/authenticated)
