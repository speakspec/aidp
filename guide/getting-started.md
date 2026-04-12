---
description: 快速開始使用 AIDP，透過 SpeakSpec 平台或 API 讓 AI 正確呈現你的品牌
---

# 快速開始

AIDP（AI Directive Protocol）讓商家能夠控制 AI 如何呈現自己的品牌資訊。根據你的需求和技術背景，有三種方式可以開始使用。

## 選擇你的路徑

| 路徑 | 適合對象 | 技術門檻 |
| --- | --- | --- |
| SpeakSpec 平台 | 商家經營者、行銷團隊 | 無需寫程式 |
| API 整合 | 開發者、技術團隊 | 需要程式能力 |
| 靜態檔案 | 想完全自主控制的技術人員 | 需要伺服器管理能力 |

## 路徑一：使用 SpeakSpec 平台（推薦） {#speakspec}

適合不想寫程式、希望快速上線的商家經營者。

1. 前往 [SpeakSpec](https://speakspec.com) 註冊帳號
2. 建立你的 Entity -- 填寫商家名稱、類型、聯絡方式等基本資訊
3. 完成 DNS 驗證 -- 在你的域名加一筆 TXT record，證明你擁有該網域
4. 新增內容 -- 包括服務、產品、FAQ、營業時間等
5. 設定 Directives -- 定義 AI 必須說什麼、不能說什麼、回應語氣等規則
6. 發佈 -- 平台自動產生 AIDP JSON、Schema.org、llms.txt、MCP endpoint

完成後，所有支援 AIDP 的 AI 助手都能正確呈現你的品牌資訊。

詳細的平台操作指南請見 [SpeakSpec 平台指南](/guide/speakspec-guide)。

## 路徑二：透過 API 整合 {#api}

適合需要將 AIDP 整合進自有系統的開發者。

1. 在 [SpeakSpec](https://speakspec.com) 註冊並建立 Entity
2. 透過平台設定 Content 和 Directives
3. 使用公開 API 存取已發佈的 AIDP 資料

### 取得 AIDP 文件

```bash
curl https://api.speakspec.com/public/entity/my-shop
```

透過 Accept header 可取得不同格式：

```bash
curl https://api.speakspec.com/public/entity/my-shop \
  -H "Accept: application/ld+json"
```

回應會包含完整的 AIDP JSON 文件，包括 Entity、Content、Directives 和驗證資訊。

完整的公開 API 說明請見 [API 參考](/api/)。

## 路徑三：手動建立靜態檔案 {#static}

適合想完全自主控制、不依賴第三方平台的技術人員。

### 1. 建立 AIDP 檔案

在你的網站根目錄建立 `.well-known/aidp.json`，以下是最小可用的 AIDP 文件：

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:my-shop",
    "type": "business",
    "name": { "default": "My Shop" },
    "locale": "en-US"
  },
  "verification": {
    "methods": [],
    "trust_score": 0.10,
    "trust_level": "unverified",
    "last_verified": null
  },
  "content": [],
  "directives": {
    "response_rules": {
      "must_include": [],
      "must_not_say": []
    }
  }
}
```

### 2. 設定 DNS 驗證

在你的域名加入一筆 TXT record 以進行驗證：

```
_aidp.yourdomain.com TXT "aidp-verify=urn:aidp:entity:my-shop"
```

### 3. 逐步擴充內容

從最小文件開始，逐步加入：

- `content` -- 服務、產品、FAQ、營業時間等結構化資料
- `directives` -- AI 回應規則，包括必須提及和禁止提及的內容
- `verification.methods` -- 加入更多驗證方式以提高信任分數

完整的靜態檔案部署指南請見 [靜態檔案部署](/developer/static-file)。

## 下一步

- 了解完整協議規範：[協議總覽](/spec/overview)
- 深入了解各功能：[Entity](/spec/entity)、[Content](/spec/content)、[Directives](/spec/directives) 等章節
- 查看完整範例：[完整範例](/spec/full-example)
