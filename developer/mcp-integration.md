# MCP 整合

MCP（Model Context Protocol）是讓 AI Agent 存取外部資料的標準協定。AIDP 平台提供完整的 MCP 端點，讓 AI Agent 能夠直接查詢 Entity 資料。

> **v0.2.0 變更：** `name` 與 `description` 欄位現可為 bare string（等同 `{default: ...}`）或 object。SDK consumer 須升級 schema validation 以接受兩種形式。詳見 spec §3.3。

## MCP 端點

- 單一端點：`POST /mcp`
- 使用 JSON-RPC 2.0 協定
- **公開模式**：免認證，可使用 `aidp_query` / `aidp_entity_info` 與所有 resource 端點
- **認證模式**：以 `X-API-Key` header 傳送 API key，解鎖 50 個實體作用域工具，涵蓋 REST API 的所有讀寫能力

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

## 認證模式（X-API-Key）

在 MCP 請求的 HTTP header 加入 `X-API-Key: aidp_...`，即可解鎖 50 個實體作用域工具。工具會自動綁定到 API key 對應的 entity — 不需要（也不應該）在 arguments 傳入 `entity_id`。

### Claude Desktop 整合

在 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "speakspec": {
      "url": "https://api.speakspec.com/mcp",
      "headers": { "X-API-Key": "aidp_YOUR_KEY_HERE" }
    }
  }
}
```

重啟 Claude Desktop 後即可直接以自然語言操作：「幫我把『關於我們』改成強調永續經營並發布」。

### Scope 規則

| API key scope | 可呼叫工具類別 |
|---|---|
| `read` | 所有以 `aidp_*_get`、`aidp_*_list`、`aidp_output_*`、`aidp_analytics_*`、`aidp_entity_summary`、`aidp_search_own_entity`、`aidp_export` 為名的 read 工具 |
| `write` | 所有 read 工具 + create / update / delete / publish / lock / import 等寫入工具 |

如以 `read` key 呼叫 write 工具，MCP 會回傳 JSON-RPC error code `-32002`（INSUFFICIENT_SCOPE）。

### Rate Limit

- 公開呼叫（無 header）：60 req/min per IP
- 認證呼叫：300 req/min per API key

### 工具清單對照（REST ↔ MCP）

完整 50 個工具與 REST 路徑的對照表見 [API 參考：MCP](/api/mcp)。

## v0.4 與 MCP 的關係

AIDP v0.4 引入 `content_index` 欄位讓 `/.well-known/aidp.json` 不再內嵌所有 content。但 MCP tools 仍直接讀後端資料庫，**不受 well-known inline/directory 策略影響**：

- `list_contents` / `get_content` 等 tool 永遠回傳完整 content list（含 directory 模式的 type）
- AI agent 透過 MCP 取得內容時不需先檢查 `content_index`
- 但若 agent 改走 well-known 公開端點（無 API key），則要遵守 `content_index.types_indexed` → 走 directory 的規則

## Content Negotiation

透過 Accept header 可指定回傳格式：

- `application/json`（預設）-- AIDP JSON 格式
- `application/ld+json` -- Schema.org JSON-LD 格式
- `text/markdown` -- llms.txt Markdown 格式
- `text/html` -- Open Graph HTML

## 曝光追蹤

- 每次 MCP 呼叫自動記錄 AI 曝光
- Agent 可透過 User-Agent header 識別
- 公開呼叫記為 `source=mcp`，認證呼叫記為 `source=api_key_mcp`（與公開 agent 曝光分開統計）
- 曝光資料可在 [SpeakSpec 儀表板](/guide/speakspec-guide) 中檢視
