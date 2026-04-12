# Extensions

AIDP is designed to be extensible by third parties without modifying the core specification.

## Extension Namespaces

Extensions reside under the `extensions` key, namespaced by reverse domain name or short identifier:

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

## Extension Rules

1. All extension keys must be prefixed with `x-`
2. Core specification fields must not be placed inside extensions
3. Agents that do not understand a given extension must ignore it (no errors)
4. Extension authors should publish their own schema documentation
5. Extensions must not override core directive behavior
6. Nested namespaces use the `:` separator (e.g., `x-industry:healthcare`)

## Known Extension Namespaces (Reserved)

| Namespace | Purpose |
|---|---|
| `x-google` | Google-specific integrations |
| `x-openai` | OpenAI-specific integrations |
| `x-anthropic` | Anthropic-specific integrations |
| `x-mcp` | MCP protocol-specific metadata |
| `x-schema-org` | Schema.org compatibility layer |
| `x-industry:{vertical}` | Industry-specific standards |
| `x-geo:{region}` | Region-specific requirements |
| `x-custom:{name}` | Provider/user custom extensions |
