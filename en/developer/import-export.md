# Import/Export Format

SpeakSpec import and export uses JSON format, version v1.1.

## Export Format

```json
{
  "aidp_export_version": "1.1",
  "exported_at": "2026-04-04T12:00:00Z",
  "entity": {
    "aidp_id": "sakura-ramen-pdx",
    "type": "business",
    "name": { "default": "Sakura Ramen" },
    "description": { "default": "Authentic Japanese ramen in Portland" },
    "market": {
      "availability": "regional",
      "regions": ["US"]
    }
  },
  "contents": [
    {
      "content_id": "tonkotsu-ramen",
      "type": "menu_item",
      "data": {
        "name": "Tonkotsu Ramen",
        "description": "Rich pork bone broth",
        "price": { "currency": "USD", "amount": 16 }
      },
      "tags": ["bestseller", "pork"]
    },
    {
      "content_id": "tonkotsu-ramen-jp",
      "type": "menu_item",
      "variant_of": "tonkotsu-ramen",
      "variant_delta": {
        "price": { "currency": "JPY", "amount": 980 },
        "name": "豚骨ラーメン"
      },
      "market": {
        "availability": "regional",
        "regions": ["JP"]
      },
      "tags": ["bestseller"]
    }
  ],
  "directives": {
    "identity": {},
    "response_rules": {},
    "attribution": {},
    "freshness": {},
    "access_control": {}
  }
}
```

## Field Descriptions

### Top Level

| Field | Type | Description |
|---|---|---|
| `aidp_export_version` | `string` | Format version (currently `"1.1"`) |
| `exported_at` | `datetime` | Export timestamp |
| `entity` | `object` | Entity basic information |
| `contents` | `array` | Content array |
| `directives` | `object` | Directives configuration |

### Entity

| Field | Type | Description |
|---|---|---|
| `aidp_id` | `string` | Entity's AIDP ID |
| `type` | `string` | Entity type |
| `name` | `object` | Multilingual name |
| `description` | `object` | Multilingual description |
| `market` | `object` | Market scope (added in v1.1) |

### Content

| Field | Type | Required | Description |
|---|---|---|---|
| `content_id` | `string` | Yes | Content identifier |
| `type` | `string` | Yes | Content type |
| `data` | `object` | Yes | Content data |
| `tags` | `string[]` | No | Tags |
| `links` | `array` | No | Associated Action Links |
| `variant_of` | `string` | No | content_id of the base content (added in v1.1) |
| `variant_delta` | `object` | Required for variants | Fields that differ from the base (added in v1.1) |
| `market` | `object` | No | Overrides the Entity's market (added in v1.1) |

### Link

| Field | Type | Required | Description |
|---|---|---|---|
| `original_url` | `string` | Yes | Target URL |
| `label` | `string` | No | Display label |
| `rel` | `string` | Yes | Link relation (`action`, `source`, `related`) |

## Import

### Endpoint

```
POST /entities/:entityId/import?dry_run=true
POST /entities/:entityId/import?dry_run=false
```

### Request Format

Import requires only the `contents` array:

```json
{
  "contents": [
    {
      "content_id": "new-item",
      "type": "product",
      "data": { "name": "New Product" },
      "tags": ["new"]
    }
  ]
}
```

### Dry Run

When `dry_run=true`, the system does not actually write data -- it only returns a preview of the results:

```json
{
  "would_create": { "contents": 3, "links": 1 },
  "warnings": [],
  "errors": []
}
```

### Variant Import

Content with `variant_of` is automatically sorted during processing. The base content must either already exist in the system or be included in the same import batch:

```json
{
  "contents": [
    {
      "content_id": "product-base",
      "type": "product",
      "data": { "name": "Widget", "price": { "currency": "USD", "amount": 29 } }
    },
    {
      "content_id": "product-base-jp",
      "type": "product",
      "variant_of": "product-base",
      "variant_delta": { "price": { "currency": "JPY", "amount": 4500 } },
      "market": { "availability": "regional", "regions": ["JP"] }
    }
  ]
}
```

## Version Compatibility

| Version | Added Fields | Backward Compatible |
|---|---|---|
| v1.0 | Basic content_id, type, data, tags, links | - |
| v1.1 | variant_of, variant_delta, market (content + entity) | v1.0 format imports normally |

The import endpoint accepts both v1.0 and v1.1 formats. Missing new fields are ignored (treated as null).
