# MCP API

MCP (Model Context Protocol) 端點。支援公開模式（免認證）與認證模式（X-API-Key header）。

Base URL: `https://api.speakspec.com`

## 端點

```
POST /mcp
```

使用 JSON-RPC 2.0 協定。

**Request Content-Type:** `application/json`

**認證（選用）：** 在 header 加上 `X-API-Key: aidp_...` 可解鎖 50 個實體作用域工具，所有工具自動綁定至 key 對應的 entity。

> **v0.4 起**：`list_contents` / `get_content` 仍回完整 content 集，與 well-known 的 inline/directory 策略獨立。

## 支援的方法

| 方法 | 說明 |
|---|---|
| `resources/list` | 列出所有可用的 AIDP Resource |
| `resources/read` | 讀取指定的 AIDP Resource |
| `tools/list` | 列出可用的 MCP Tools |
| `tools/call` | 呼叫 MCP Tool |

## 公開 Tools（免認證）

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

## 認證 Tools（需 X-API-Key）

所有工具皆自動綁定至 API key 對應的 `entity_id`，不需要也不應該在 `arguments` 傳入 `entity_id`。以 `read` scope key 呼叫 write 工具會回傳 JSON-RPC error `-32002` INSUFFICIENT_SCOPE。

### Entity（4 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_entity_get` | read | `GET /entities/:id` | - |
| `aidp_entity_update` | write | `PUT /entities/:id` | `name`, `description`, `categories`, `tags`, `languages`, `default_language`, `reason` |
| `aidp_entity_usage` | read | `GET /entities/:id/usage` | - |
| `aidp_entity_audit_logs` | read | `GET /entities/:id/audit-logs` | `page`, `page_size` |

### Content（11 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_content_list` | read | `GET /contents` | `page`, `page_size`, `type`, `status` |
| `aidp_content_get` | read | `GET /contents/:contentId` | `content_id` |
| `aidp_content_create` | write | `POST /contents` | `type`, `data`, `reason` |
| `aidp_content_update` | write | `PUT /contents/:contentId` | `content_id`, `data`, `reason` |
| `aidp_content_delete` | write | `DELETE /contents/:contentId` | `content_id`, `reason` |
| `aidp_content_save_draft` | write | `PUT /contents/:contentId/draft` | `content_id`, `data` |
| `aidp_content_publish` | write | `POST /contents/:contentId/publish` | `content_id`, `reason` |
| `aidp_content_discard_draft` | write | `DELETE /contents/:contentId/draft` | `content_id` |
| `aidp_content_lock` | write | `POST/DELETE /contents/:contentId/lock` | `content_id`, `acquire` (bool) |
| `aidp_content_versions_list` | read | `GET /contents/:contentId/versions` | `content_id`, `page`, `page_size` |
| `aidp_content_version_restore` | write | `POST /contents/:contentId/versions/:version/restore` | `content_id`, `version`, `reason` |

### Directives（3 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_directives_get` | read | `GET /directives` | - |
| `aidp_directives_update` | write | `PUT /directives` | `allow_training`, `require_attribution`, `commercial_use`, `reason` |
| `aidp_directives_submit_evidence` | write | `PUT /directives/evidence` | `evidence_url`, `evidence_type` |

### Verification（5 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_verify_status` | read | `GET /verify/status` | - |
| `aidp_verify_dns_init` | write | `POST /verify/dns/init` | `domain` |
| `aidp_verify_dns_check` | write | `POST /verify/dns/check` | `domain` |
| `aidp_verify_email_init` | write | `POST /verify/email/init` | `email` |
| `aidp_verify_business_init` | write | `POST /verify/business-registration/init` | `filename`, `body_base64` |

### Output（4 個，皆 read）

| Tool | REST 對應 |
|---|---|
| `aidp_output_aidp` | `GET /output/aidp` |
| `aidp_output_schema_org` | `GET /output/schema-org` |
| `aidp_output_llms_txt` | `GET /output/llms-txt` |
| `aidp_output_og_tags` | `GET /output/og-tags` |

### Links（4 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_links_list` | read | `GET /links` | `page`, `page_size` |
| `aidp_links_create` | write | `POST /links` | `target_url`, `label`, `type` |
| `aidp_links_update` | write | `PUT /links/:linkId` | `link_id`, `target_url`, `label`, `type` |
| `aidp_links_delete` | write | `DELETE /links/:linkId` | `link_id` |

### Analytics（14 個，皆 read）

| Tool | REST 對應 | 主要參數 |
|---|---|---|
| `aidp_analytics_overview` | `GET /analytics/overview` | `from`, `to` |
| `aidp_analytics_daily` | `GET /analytics/daily` | `from`, `to` |
| `aidp_analytics_agents` | `GET /analytics/agents` | `from`, `to` |
| `aidp_analytics_content` | `GET /analytics/content` | `from`, `to` |
| `aidp_analytics_links` | `GET /analytics/links` | `from`, `to` |
| `aidp_analytics_hourly` | `GET /analytics/hourly` | `from`, `to` |
| `aidp_analytics_sources` | `GET /analytics/sources` | `from`, `to` |
| `aidp_analytics_countries` | `GET /analytics/countries` | `from`, `to`, `limit` |
| `aidp_analytics_performance` | `GET /analytics/performance` | `from`, `to` |
| `aidp_analytics_mcp_tools` | `GET /analytics/mcp-tools` | `from`, `to`, `limit` |
| `aidp_analytics_bot_vs_human` | `GET /analytics/bot-vs-human` | `from`, `to` |
| `aidp_analytics_visitors` | `GET /analytics/visitors` | `from`, `to` |
| `aidp_analytics_referrers` | `GET /analytics/referrers` | `from`, `to`, `limit` |
| `aidp_analytics_link_daily` | `GET /analytics/link-daily` | `from`, `to` |

### Import / Export（2 個）

| Tool | Scope | REST 對應 | 主要參數 |
|---|---|---|---|
| `aidp_export` | read | `GET /export` | - |
| `aidp_import` | write | `POST /import` | `data`, `dry_run` |

### AI 聚合工具（3 個）

| Tool | Scope | 說明 |
|---|---|---|
| `aidp_entity_summary` | read | 一次平行抓取 entity + directives + verify status + content 清單 + usage |
| `aidp_content_bulk_upsert` | write | 陣列批次建立 / 更新 content，支援部分失敗 |
| `aidp_search_own_entity` | read | 以 API key 對應 entity 強制限定的全文搜尋 |

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
