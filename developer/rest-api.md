# REST API 串接

第三方開發者可透過公開 REST API 存取 SpeakSpec 平台上的 AIDP 資料。公開端點不需要認證。

## 公開端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/public/entity/{aidpId}` | 取得 Entity 的完整 AIDP 文件 |
| GET | `/public/entity/{aidpId}/content` | 查詢 Entity 的公開內容 |
| GET | `/.well-known/aidp-directory.json` | 所有已驗證 Entity 的索引 |

Base URL: `https://api.speakspec.com`

## 取得 AIDP 文件

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx
```

透過 Accept header 指定回傳格式：

```bash
curl https://api.speakspec.com/public/entity/sakura-ramen-pdx \
  -H "Accept: application/ld+json"
```

| Accept Header | 回傳格式 |
|---|---|
| `application/json`（預設） | AIDP JSON |
| `application/ld+json` | Schema.org JSON-LD |
| `text/markdown` | llms.txt |
| `text/html` | Open Graph HTML |

## 查詢內容

支援按類型和標籤篩選：

```bash
curl "https://api.speakspec.com/public/entity/sakura-ramen-pdx/content?type=menu_item"
```

| 參數 | 說明 |
|---|---|
| `type` | 篩選內容類型（service, product, menu_item, faq 等） |
| `tags` | 篩選標籤（逗號分隔） |
| `variant_of` | 篩選指定 base content 的所有 variant |

## 探索所有 Entity

```bash
curl https://api.speakspec.com/.well-known/aidp-directory.json
```

回傳平台上所有已驗證 Entity 的列表，供 AI Agent 自動探索使用。

## AIPREF 標頭

回應會自動包含 IETF AIPREF 標頭，告知 AI Agent 內容使用權限：

```
Content-Usage: disallow=FoundationModelProduction
Content-Usage: allow=Search
```

## 錯誤處理

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Entity not found"
  }
}
```

## 平台管理 API

如果你是 SpeakSpec 平台用戶，平台另提供完整的管理 API（需認證）用於管理 Entity、Content、Directives 等。管理 API 文件請在登入後於平台內查看。

完整公開 API 參考請見：[API 參考](/api/)
