# 靜態檔案部署

如果你不需要使用 SpeakSpec 平台，可以直接將 AIDP JSON 檔案部署在自己的網站上，讓 AI Agent 能夠存取你的資料。

## 檔案位置

將 AIDP JSON 放在你的網站根目錄：`/.well-known/aidp.json`

## 部署步驟

1. 建立 AIDP JSON 檔案（參考 [完整範例](/spec/full-example)）
2. 放到 `/.well-known/aidp.json`
3. 設定正確的 HTTP headers：
   - `Content-Type: application/aidp+json`
   - `Access-Control-Allow-Origin: *`（讓 AI Agent 可以跨域存取）
   - `Content-Usage` header（依據 access_control 設定）
4. 加入 DNS TXT record 進行驗證

## Web Server 設定範例

### Nginx

```nginx
location /.well-known/aidp.json {
    default_type application/aidp+json;
    add_header Access-Control-Allow-Origin *;
    add_header Content-Usage "disallow=FoundationModelProduction";
}
```

### Caddy

```caddy
handle /.well-known/aidp.json {
    header Content-Type "application/aidp+json"
    header Access-Control-Allow-Origin "*"
    header Content-Usage "disallow=FoundationModelProduction"
}
```

## HTML Discovery

在你的 HTML 頁面加入 link tag，讓 Agent 能發現 AIDP 文件：

```html
<link rel="aidp" href="/.well-known/aidp.json" type="application/aidp+json" />
```

## 限制

靜態檔案部署有以下限制：

- 無法自動追蹤 AI 曝光
- 無法使用 MCP endpoint
- 需要手動更新內容
- 無法使用 redirect proxy 追蹤連結點擊

如果需要這些功能，建議使用 [SpeakSpec 平台](/guide/speakspec-guide) 或 [REST API](/developer/rest-api)。
