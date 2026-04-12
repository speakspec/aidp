# MCP API

MCP (Model Context Protocol) 端點。不需要認證。

Base URL: `https://api.speakspec.com`

## 端點

```
POST /mcp/v1
```

使用 JSON-RPC 2.0 協定。

**Request Content-Type:** `application/json`

## 支援的方法

| 方法 | 說明 |
|---|---|
| `resources/list` | 列出所有可用的 AIDP Resource |
| `resources/read` | 讀取指定的 AIDP Resource |
| `tools/list` | 列出可用的 MCP Tools |
| `tools/call` | 呼叫 MCP Tool |

## 可用的 Tools

### aidp_query

搜尋並取得 AIDP Entity 文件，支援按類型、分類篩選。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | 否 | 篩選 Entity 類型（例如 `business`、`person`、`product`） |
| `category` | string[] | 否 | 篩選分類標籤 |
| `limit` | integer | 否 | 回傳筆數上限（預設 10，最大 50） |

### aidp_entity_info

取得 Entity 基本資訊（不含 content），包括身份、驗證狀態和 directives。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `entity_id` | string | 是 | Entity 的 AIDP ID（slug 或完整 URN，例如 `sakura-ramen-pdx`） |

## 範例：tools/call (aidp_query)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
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

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{\"$aidp\":\"0.1.0\",\"entity\":{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":{\"default\":\"Sakura Ramen\"},\"type\":\"business\"},\"content\":[...],\"verification\":{\"trust_level\":\"verified_domain\"}}]"
      }
    ]
  }
}
```

## 範例：tools/call (aidp_entity_info)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "aidp_entity_info",
    "arguments": {
      "entity_id": "sakura-ramen-pdx"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":\"Sakura Ramen\",\"type\":\"business\",\"description\":\"Authentic Japanese ramen in Portland\",\"trust_level\":\"verified_domain\",\"created_at\":\"2026-01-15T00:00:00Z\"}"
      }
    ]
  }
}
```

## 範例：resources/list

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/list"
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resources": [
      {
        "uri": "aidp://entity/sakura-ramen-pdx",
        "name": "Sakura Ramen",
        "description": "Authentic Japanese ramen in Portland",
        "mimeType": "application/json"
      }
    ]
  }
}
```
