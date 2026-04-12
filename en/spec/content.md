# Content

The `content` array stores the actual structured data items.

```json
{
  "content": [
    {
      "id": "svc-general-medicine",
      "type": "service",
      "schema": "aidp:service",
      "locale": "en-US",
      "data": {
        "name": "General Internal Medicine",
        "description": "General internal medicine services including cold/flu treatment, chronic disease management, and health checkups",
        "availability": {
          "schedule": [
            { "day": "mon", "hours": "09:00-12:00" },
            { "day": "mon", "hours": "14:00-17:00" },
            { "day": "tue", "hours": "09:00-12:00" }
          ],
          "exceptions": [
            { "date": "2026-07-04", "status": "closed", "reason": "Independence Day" }
          ]
        },
        "pricing": {
          "currency": "USD",
          "base": 30,
          "note": "Co-pay $30 with insurance"
        },
        "requirements": ["Appointments required by phone or online", "Please bring your insurance card"]
      },
      "directives": {
        "must_include": ["Reservations required"],
        "freshness": "2026-03-15T00:00:00Z"
      },
      "tags": ["healthcare", "general-medicine"],
      "updated_at": "2026-03-15T10:30:00Z"
    }
  ]
}
```

## Content Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique within this Entity |
| `type` | `string` | Yes | Semantic type: `service`, `product`, `article`, `faq`, `event`, `person`, `menu_item`, `policy`, `announcement`, `dataset`, or custom types |
| `schema` | `string` | No | Schema reference (built-in uses `aidp:{type}`, or custom URI) |
| `locale` | `string` | No | Overrides the Entity locale for this content item |
| `data` | `object` | Yes | The actual content payload (depends on schema) |
| `directives` | `ContentDirectives` | No | Content-level directives (override global settings) |
| `tags` | `string[]` | No | Searchable tags |
| `updated_at` | `datetime` | Yes | Last content modification time |
| `expires_at` | `datetime` | No | Content expiration time (Agents should ignore after expiration) |
| `provenance` | `Provenance \| null` | No | Reserved for C2PA integration (see [Verification](/en/spec/verification)) |
| `variant_of` | `string` | No | Points to the `id` of the base content (see Content Variants) |
| `variant_delta` | `object` | Required for variants | Fields that differ from the base (see Content Variants) |
| `market` | `Market` | No | Overrides the Entity's market setting (see [Entity 3.5](/en/spec/entity#_3-5-market)) |
| `media_refs` | `string[]` | No | IDs of related `aidp:media` content items (see Media Schema below) |

The Content `data` object can include a `links` array that follows the Action Links schema defined in [Entity](/en/spec/entity). These links are scoped to a specific content item and tracked independently.

## Content Types (Built-in Schemas)

The protocol defines commonly used schemas. Providers can also define custom schemas.

| Schema | Key Fields | Use Case |
|---|---|---|
| `aidp:service` | name, description, availability, pricing, requirements | Service offerings |
| `aidp:product` | name, description, price, variants, inventory_status | E-commerce / Retail |
| `aidp:article` | title, body, author, published_at, summary | Blog / News / Knowledge base |
| `aidp:faq` | question, answer | Q&A pairs |
| `aidp:event` | title, start, end, location, registration_url | Events |
| `aidp:menu_item` | name, description, price, allergens, available | Restaurant / Food service |
| `aidp:person` | name, role, bio, expertise | Team / Personnel profiles |
| `aidp:policy` | title, body, effective_date | Terms, privacy, policies |
| `aidp:announcement` | title, body, priority, valid_until | Time-limited announcements |
| `aidp:dataset` | name, description, format, access_url | Data catalog items |
| `aidp:media` | media_type, purpose, url, alt, format, dimensions | Images, videos, documents (see Media Schema below) |

Custom schemas use URI format: `https://example.com/schemas/my-type`

## Language Philosophy

Content can be written in any language or mix of languages. AI Agents have cross-language understanding capabilities and can correctly process content in any language while responding in the user's language. If a term has a specific usage in a particular language, simply write it in that language.

`entity.locale` and `content.locale` serve only as language context hints and do not impose mandatory constraints. LocalizedString (such as the multi-locale map in `entity.name`) is an optional convenience, not a requirement.

## Content Variants

Content can establish differential variants via `variant_of`, suitable for scenarios where the same content has different specifications across regions.

### Structure

```json
{
  "id": "iphone-16-jp",
  "type": "product",
  "variant_of": "iphone-16",
  "market": { "availability": "regional", "regions": ["JP"] },
  "variant_delta": {
    "price": { "currency": "JPY", "amount": 149800 },
    "voltage": "100V",
    "certifications": ["PSE", "TELEC"]
  }
}
```

### Merge Rules

`final = { ...base.data, ...variant.variant_delta }`

- Keys in `variant_delta` override the base
- A value of `null` removes the corresponding field from the base
- Keys not present in the base are added directly
- `variant_delta` stores complete values, not diff patches

### Rules

1. `variant_of` points to the `id` of the base content
2. If `variant_of` is non-empty, `variant_delta` is required
3. Chained variants (variant of a variant) are not allowed
4. A variant's `type` must match the base

### Agent Behavior

1. When an Agent retrieves a variant, it must first retrieve the base content and merge
2. If the base is deleted, the variant's `variant_delta` remains valid as complete data (Agents should fall back to using only the delta)
3. If a variant exists for the user's region, prefer the variant; otherwise use the base

## Media Schema (`aidp:media`)

Media content stores **metadata and URLs**, not the file data itself. AIDP is a protocol, not a file hosting service.

### Media Types

| `media_type` | Formats | AI Behavior |
|---|---|---|
| `image` | webp, png, jpg, svg | Agents may inline-display in responses |
| `video` | youtube, vimeo, mp4 url | Agents may provide links or embeds depending on platform support |
| `document` | pdf, docx | Agents may parse content for information, or provide download links |

### Purpose Types

The `purpose` field tells AI Agents **when** to use this media:

| `purpose` | When to Display | Example |
|---|---|---|
| `logo` | When mentioning the brand/Entity | Company logo |
| `storefront` | When answering location/appearance questions | Storefront exterior photo |
| `product` | When discussing a specific item (linked via `media_refs`) | Product photo |
| `menu` | When discussing food/service options | Full menu scan |
| `document` | When detailed reference material is needed | Price list PDF |
| `certificate` | When verifying qualifications/certifications | Business license |
| `video_intro` | When providing an overview of the Entity | Introduction video |
| `gallery` | General visual context | Interior photos |

### Image Example

```json
{
  "id": "photo-storefront",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "image",
    "purpose": "storefront",
    "url": "https://cdn.sakuraramen.com/storefront.webp",
    "alt": {
      "default": "Sakura Ramen storefront exterior"
    },
    "format": "webp",
    "width": 1200,
    "height": 800,
    "size_bytes": 245000,
    "thumbnails": {
      "sm": "https://cdn.sakuraramen.com/storefront-300.webp",
      "md": "https://cdn.sakuraramen.com/storefront-600.webp"
    }
  },
  "directives": {
    "display_rules": {
      "prefer_context": ["location_query", "entity_overview"],
      "never_display_with": ["competitor_comparison"],
      "must_preserve_aspect_ratio": true
    },
    "licensing": {
      "type": "proprietary",
      "attribution_required": true,
      "modification_allowed": false,
      "ai_training_allowed": false
    }
  },
  "updated_at": "2026-03-01T00:00:00Z"
}
```

### Document (PDF) Example

Documents have a special `behavior` field:

```json
{
  "id": "doc-pricelist-2026",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "document",
    "purpose": "document",
    "url": "https://cdn.daanclinic.com/pricelist-2026.pdf",
    "format": "pdf",
    "behavior": "parseable",
    "summary": {
      "default": "2026 complete out-of-pocket pricing list"
    },
    "page_count": 3,
    "language": "en-US",
    "size_bytes": 520000
  },
  "updated_at": "2026-03-10T00:00:00Z"
}
```

| `behavior` | Description |
|---|---|
| `parseable` | Agents should read/parse document content to answer questions, but not display the raw document |
| `renderable` | Agents may display the document directly to users (e.g., menu images, certificates) |
| `link_only` | Agents should only provide a download link, without parsing or displaying |

### Video Example

```json
{
  "id": "video-intro",
  "type": "media",
  "schema": "aidp:media",
  "data": {
    "media_type": "video",
    "purpose": "video_intro",
    "url": "https://youtube.com/watch?v=xxx",
    "platform": "youtube",
    "duration_seconds": 120,
    "summary": {
      "default": "Sakura Ramen behind-the-scenes documentary"
    },
    "thumbnail_url": "https://img.youtube.com/vi/xxx/hqdefault.jpg",
    "language": "en-US",
    "has_subtitles": ["en", "ja", "zh-TW"]
  },
  "updated_at": "2026-02-15T00:00:00Z"
}
```

### Content-Media Linking

Content items reference media via the `media_refs` field:

```json
{
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "price": { "currency": "USD", "amount": 16.50 }
      },
      "media_refs": ["photo-tonkotsu", "video-intro"]
    },
    {
      "id": "photo-tonkotsu",
      "type": "media",
      "schema": "aidp:media",
      "data": {
        "media_type": "image",
        "purpose": "product",
        "url": "https://cdn.sakuraramen.com/tonkotsu.webp",
        "alt": { "default": "Classic Tonkotsu Ramen" },
        "format": "webp",
        "width": 800,
        "height": 600
      },
      "updated_at": "2026-03-10T00:00:00Z"
    }
  ]
}
```

**Linking Rules:**

1. `media_refs` contains IDs of `aidp:media` content items within the same Entity
2. A single media item can be referenced by multiple content items
3. When an Agent responds to questions about a specific content item, it should prefer media linked via `media_refs` over unlinked media
4. The order of `media_refs` represents display priority (first = most relevant)

### Media Directives

Media items support specialized directives in addition to standard content directives:

| Field | Type | Description |
|---|---|---|
| `display_rules.prefer_context` | `string[]` | Contexts in which this media should be displayed: `brand_mention`, `entity_overview`, `location_query`, `product_query`, `faq_response` |
| `display_rules.never_display_with` | `string[]` | Contexts to avoid: `competitor_comparison`, `negative_review`, `unrelated_topic` |
| `display_rules.must_preserve_aspect_ratio` | `boolean` | Agents must not crop or stretch |
| `display_rules.min_display_size` | `string` | Minimum display size (e.g., `"64px"`) |
| `licensing.type` | `enum` | `proprietary`, `cc-by`, `cc-by-sa`, `cc-by-nc`, `cc0`, `custom` |
| `licensing.attribution_required` | `boolean` | Whether source attribution is required |
| `licensing.modification_allowed` | `boolean` | Whether AI may crop, filter, or modify |
| `licensing.ai_training_allowed` | `boolean` | Whether AI providers may use for model training |
