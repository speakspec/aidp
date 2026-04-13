# MCP 整合

MCP（Model Context Protocol）是讓 AI Agent 存取外部資料的標準協定。AIDP 平台提供完整的 MCP 端點，讓 AI Agent 能夠直接查詢 Entity 資料。

## MCP 端點

- 單一端點：`POST /mcp`
- 使用 JSON-RPC 2.0 協定
- 不需要認證

## 兩種存取模式

### Mode A: Resource 模式

AIDP 文件作為 MCP Resource 公開，適合需要瀏覽和讀取結構化資料的 Agent。

- URI 格式：`aidp://entity/{entity_id}` 和 `aidp://entity/{entity_id}/content/{content_id}`
- MIME type: `application/aidp+json`

列出所有可用的 Resource：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}
```

讀取特定 Entity 的 AIDP 文件：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "aidp://entity/sakura-ramen-pdx"
  }
}
```

### Mode B: Tool 模式

提供兩個可用工具，適合需要精確查詢的 Agent。

#### aidp_query

搜尋 Entity，支援按類型和分類篩選：

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | 否 | 篩選 Entity 類型（例如 `business`） |
| `category` | string[] | 否 | 篩選分類標籤 |
| `limit` | integer | 否 | 回傳筆數上限（預設 10，最大 50） |

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "aidp_query",
    "arguments": {
      "type": "business",
      "limit": 5
    }
  }
}
```

#### aidp_entity_info

只取得 Entity 基本資訊（不含 content，適合快速查詢）：

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "aidp_entity_info",
    "arguments": {
      "entity_id": "sakura-ramen-pdx"
    }
  }
}
```

## Content Negotiation

透過 Accept header 可指定回傳格式：

- `application/json`（預設）-- AIDP JSON 格式
- `application/ld+json` -- Schema.org JSON-LD 格式
- `text/markdown` -- llms.txt Markdown 格式
- `text/html` -- Open Graph HTML

## 曝光追蹤

- 每次 MCP 呼叫自動記錄 AI 曝光
- Agent 可透過 User-Agent header 識別
- 曝光資料可在 [SpeakSpec 儀表板](/guide/speakspec-guide) 中檢視
