# Extensions

AIDP 設計為可由第三方擴充，而無需修改核心規範。

## Extension 命名空間

Extensions 位於 `extensions` 鍵下，以反向域名或短識別碼作為命名空間：

```json
{
  "extensions": {
    "x-google": {
      "place_id": "ChIJ...",
      "knowledge_panel_override": { }
    },
    "x-openai": {
      "gpt_plugin_manifest": "https://..."
    },
    "x-industry:healthcare": {
      "npi_number": "1234567890",
      "accreditation": {
        "body": "Joint Commission",
        "level": "Ambulatory Care",
        "valid_until": "2027-12-31"
      }
    },
    "x-custom:loyalty": {
      "program_name": "Daan Wellness Points",
      "join_url": "https://daanclinic.com/loyalty"
    }
  }
}
```

## Extension 規則

1. 所有 extension 鍵必須以 `x-` 為前綴
2. 核心規範欄位不得放在 extensions 中
3. 不理解某個 extension 的 Agent 必須忽略它（不報錯）
4. Extension 作者應發佈自己的 schema 文件
5. Extensions 不得覆寫核心 directive 行為
6. 巢狀命名空間使用 `:` 分隔符（例如 `x-industry:healthcare`）

## 已知 Extension 命名空間（保留）

| 命名空間 | 用途 |
|---|---|
| `x-google` | Google 特定整合 |
| `x-openai` | OpenAI 特定整合 |
| `x-anthropic` | Anthropic 特定整合 |
| `x-mcp` | MCP 協議特定的中繼資料 |
| `x-schema-org` | Schema.org 相容層 |
| `x-industry:{vertical}` | 產業特定標準 |
| `x-geo:{region}` | 地區特定要求 |
| `x-custom:{name}` | 提供者/使用者自訂的 extensions |
