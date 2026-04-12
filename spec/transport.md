# Transport

AIDP 是傳輸協定無關的。同一份文件可以同時透過多種方式提供。實作應至少支援 MCP 或靜態檔案其中一種。

## MCP Transport（建議）

AIDP 與 **Model Context Protocol** 整合，作為內容與指令層。MCP 處理連線；AIDP 處理酬載語義。

### Mode A：AIDP 作為 MCP Resource

最簡單的整合方式。AIDP 文件以唯讀 MCP Resource 的形式公開：

```json
{
  "resources": [
    {
      "uri": "aidp://entity/daan-clinic-pdx",
      "name": "Daan United Clinic — AIDP Profile",
      "description": "Structured entity data with AI response directives",
      "mimeType": "application/aidp+json"
    }
  ]
}
```

**Agent 讀取 resource：**

```json
{
  "method": "resources/read",
  "params": {
    "uri": "aidp://entity/daan-clinic-pdx"
  }
}
```

**Server 回應完整的 AIDP 文件：**

```json
{
  "contents": [
    {
      "uri": "aidp://entity/daan-clinic-pdx",
      "mimeType": "application/aidp+json",
      "text": "{ \"$aidp\": \"0.4.0\", \"entity\": { ... }, ... }"
    }
  ]
}
```

適用情境：Entity 的內容量可管理（少於 100 項），且 Agent 需要包含所有 [directives](/spec/directives) 的完整資料。

### Mode B：AIDP 作為 MCP Tool

當 Entity 擁有大量內容時，公開查詢工具以回傳附帶 directives 的過濾 AIDP 內容：

**Tool 定義：**

```json
{
  "tools": [
    {
      "name": "aidp_query",
      "description": "Query structured entity data with AI response directives. Returns content items matching the filter, with applicable directives merged.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "entity_id": {
            "type": "string",
            "description": "AIDP entity identifier"
          },
          "content_type": {
            "type": "string",
            "description": "Filter by content type (service, product, menu_item, faq, etc.)"
          },
          "tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Filter by tags"
          },
          "query": {
            "type": "string",
            "description": "Natural language query to match against content"
          },
          "include_directives": {
            "type": "boolean",
            "default": true,
            "description": "Whether to include merged directives in response"
          }
        },
        "required": ["entity_id"]
      }
    },
    {
      "name": "aidp_entity_info",
      "description": "Get entity identity, verification status, and global directives without content.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "entity_id": {
            "type": "string",
            "description": "AIDP entity identifier"
          }
        },
        "required": ["entity_id"]
      }
    }
  ]
}
```

**Tool 呼叫範例：**

```json
{
  "method": "tools/call",
  "params": {
    "name": "aidp_query",
    "arguments": {
      "entity_id": "urn:aidp:entity:sakura-ramen-pdx",
      "content_type": "menu_item",
      "tags": ["vegan"]
    }
  }
}
```

**回應包含內容與合併後的 directives：**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"$aidp\":\"0.4.0\",\"entity\":{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":{\"default\":\"Sakura Ramen\"},\"type\":\"business\"},\"verification\":{\"trust_level\":\"verified_domain\",\"trust_score\":0.72},\"content\":[{\"id\":\"menu-vegan-miso\",\"type\":\"menu_item\",\"data\":{\"name\":\"Vegan Miso Ramen\",\"price\":{\"currency\":\"USD\",\"amount\":15.00}}}],\"directives\":{\"identity\":{\"preferred_name\":\"Sakura Ramen\"},\"response_rules\":{\"must_include\":[\"Closed every Wednesday\"],\"must_not_say\":[\"We do not offer delivery\"],\"tone\":\"friendly\"}}}"
    }
  ]
}
```

適用情境：Entity 擁有大量內容項目，或 Agent 需要執行目標查詢。

### Mode A+B 組合

單一 MCP server 可以同時公開 Resource 和 Tool 介面。Resource 為需要完整資料的 Agent 提供完整文件；Tool 為目標查詢提供過濾存取。這是正式環境部署的**建議方式**。

### MCP Server Metadata

託管 AIDP 資料的 MCP server 應在 server info 中宣告其 AIDP 能力：

```json
{
  "serverInfo": {
    "name": "aidp-platform",
    "version": "1.0.0"
  },
  "capabilities": {
    "resources": {},
    "tools": {}
  },
  "protocolExtensions": {
    "aidp": {
      "version": "0.4.0",
      "entities": ["urn:aidp:entity:sakura-ramen-pdx"],
      "features": ["directives", "verification", "vc_credential"]
    }
  }
}
```

## REST API

```
GET /aidp/v1/entity/{entity_id}
Accept: application/aidp+json

GET /aidp/v1/entity/{entity_id}/content
GET /aidp/v1/entity/{entity_id}/content/{content_id}
GET /aidp/v1/entity/{entity_id}/directives
```

## 靜態檔案（llms.txt 搭配方式）

放置於 well-known URL：

```
https://example.com/.well-known/aidp.json
```

可從 `llms.txt` 引用：

```
# AIDP
> aidp: https://example.com/.well-known/aidp.json
```

## DNS Discovery

用於自動發現的 TXT 記錄：

```
_aidp.example.com  TXT  "v=aidp1; url=https://example.com/.well-known/aidp.json"
```

## HTML Meta Tag

適用於同時需要 AIDP 支援的傳統網站：

```html
<link rel="aidp" href="https://example.com/.well-known/aidp.json" />
```

## Transport 優先順序

當有多種傳輸方式可用時，Agent 應依以下順序優先使用：

1. **MCP** -- 最豐富的互動方式，支援查詢與 directives
2. **REST API** -- 具過濾功能的結構化存取
3. **靜態檔案** -- 最簡單，相容性最廣
4. **DNS / HTML discovery** -- Entity 發現的後備方式
