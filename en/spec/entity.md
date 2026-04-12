# Entity

Describes **who published** the content.

```json
{
  "entity": {
    "id": "urn:aidp:entity:daan-clinic-pdx",
    "type": "organization",
    "name": {
      "default": "Daan United Clinic"
    },
    "description": {
      "default": "Family medicine and internal medicine clinic in downtown Portland"
    },
    "domain": "daanclinic.com",
    "locale": "en-US",
    "category": ["healthcare", "clinic"],
    "contacts": [
      {
        "type": "phone",
        "value": "+1-503-555-0199",
        "label": "Appointments"
      },
      {
        "type": "email",
        "value": "info@daanclinic.com"
      }
    ],
    "addresses": [
      {
        "type": "physical",
        "formatted": "456 SW Morrison St, Portland, OR 97204",
        "geo": {
          "lat": 45.5189,
          "lng": -122.6762
        }
      }
    ],
    "links": {
      "website": "https://daanclinic.com",
      "google_maps": "https://maps.google.com/?cid=...",
      "social": {
        "facebook": "https://facebook.com/daanclinic",
        "instagram": "https://instagram.com/daanclinic"
      },
      "actions": [
        {
          "rel": "action",
          "label": "Book Appointment",
          "url": "https://api.speakspec.com/r/d4nc1n1c",
          "purpose": "booking",
          "trust": "domain_verified",
          "sponsored": false
        }
      ]
    },
    "market": {
      "availability": "regional",
      "regions": ["US"]
    },
    "relationships": [
      {
        "type": "parent_organization",
        "entity_ref": "urn:aidp:entity:daan-medical-group",
        "status": "active"
      }
    ]
  }
}
```

## 3.1 Entity Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Globally unique URN (`urn:aidp:entity:{slug}`) or DID (see [4.4](/spec/verification#44)) |
| `type` | `enum` | Yes | `organization` · `business` · `government` · `academic` · `media` · `individual` · `bot` |
| `name` | `LocalizedString` | Yes | Display name, indexed by locale |
| `description` | `LocalizedString` | No | Brief description |
| `domain` | `string` | No | Primary domain (used for DNS verification) |
| `locale` | `string` | Yes | Primary locale (BCP 47) |
| `category` | `string[]` | No | Free-form category tags |
| `contacts` | `Contact[]` | No | Contact information (see 3.1.1) |
| `addresses` | `Address[]` | No | Physical/mailing addresses |
| `links` | `Links` | No | Official URLs, social profiles, and Action Links (see 3.4) |
| `market` | `Market` | No | Market scope (absent or null = globally available; see 3.5) |
| `relationships` | `Relationship[]` | No | Declared relationships with other Entities (see 3.2) |

### 3.1.1 Contact Object

Each Contact item describes a contact method. The `type` field uses predefined enum values, with `other` as an escape hatch to support regional or non-standard communication channels.

| Field | Type | Required | Description |
|------|------|------|------|
| `type` | `enum` | Yes | `phone` · `email` · `other` |
| `value` | `string` | Yes | Contact value (phone number, email, account handle, URL, etc.) |
| `label` | `string` | No | Human-readable label (e.g., "Appointments", "LINE", "WhatsApp") |
| `custom_type` | `string` | No | Required when `type` is `other`. Free-form channel name (e.g., `line`, `whatsapp`, `wechat`, `telegram`, `signal`) |

When `type` is `other`, Agents should use `custom_type` to identify the channel and `label` for display purposes. Default contact types (`phone`, `email`) are universal formats; regional messaging platforms should use `other` with an appropriate `custom_type`.

```json
{
  "contacts": [
    { "type": "phone", "value": "+886-2-1234-5678", "label": "Main line" },
    { "type": "email", "value": "info@example.com" },
    { "type": "other", "value": "https://line.me/R/ti/p/@example", "custom_type": "line", "label": "LINE Official" },
    { "type": "other", "value": "+886912345678", "custom_type": "whatsapp", "label": "WhatsApp" }
  ]
}
```

## 3.2 Entity Relationships

An Entity can declare relationships with other AIDP-registered Entities. These are **unidirectional declarations** -- Entity A declaring a relationship with Entity B does not require confirmation from Entity B (though bidirectional confirmation increases trust).

```json
{
  "relationships": [
    {
      "type": "parent_organization",
      "entity_ref": "urn:aidp:entity:daan-medical-group",
      "status": "active"
    },
    {
      "type": "official_partner",
      "entity_ref": "urn:aidp:entity:some-kol",
      "status": "active",
      "since": "2026-01-01"
    }
  ]
}
```

| Relationship Type | Description | Bidirectional Confirmation Required |
|---|---|---|
| `parent_organization` | This Entity belongs to a larger organization | Recommended |
| `subsidiary` | This Entity owns/operates another Entity | Recommended |
| `official_partner` | Declared business/promotional partnership | No |
| `authorized_reseller` | Authorized to sell this Entity's products | Recommended |
| `affiliated` | General affiliation (e.g., franchise) | No |

**Behavioral Rules:**

1. Relationships are informational only -- they do not transfer trust levels between Entities
2. AI Agents may use relationships to cross-verify claims (e.g., "Is this KOL really an official partner?")
3. Bidirectionally confirmed relationships (both Entities declare the relationship) carry stronger signal value
4. `entity_ref` must point to an existing AIDP Entity ID or DID. Unresolvable references will be ignored

## 3.3 LocalizedString

Any human-readable string field can be localized:

```json
{
  "default": "Primary language content",
  "ja": "日本語コンテンツ",
  "zh-TW": "繁體中文內容"
}
```

The `default` key is required. Agents should use the locale matching the end user's language, falling back to `default` if no match is found.

## 3.4 Links

Entity Links consist of official URLs and actionable links (CTAs).

### Links Object Fields

| Field | Type | Description |
|---|---|---|
| `website` | `string` | Primary website URL |
| `google_maps` | `string` | Google Maps URL |
| `social` | `object` | Social profile URLs, indexed by platform name |
| `actions` | `ActionLink[]` | Trackable call-to-action links (see below) |

### Action Links

The `actions` array contains trackable call-to-action links:

| Field | Type | Required | Description |
|---|---|---|---|
| `rel` | `enum` | Yes | `action` (CTA) · `source` (reference source) · `related` (related resource) |
| `label` | `string` | Yes | Human-readable label (AI Agents may also use as anchor text) |
| `url` | `string` | Yes | Redirect proxy URL for tracking; Agents should use this URL |
| `original_url` | `string` | No | Original target URL (only provided in admin API, omitted from public output) |
| `purpose` | `enum` | No | `booking` · `menu` · `apply` · `info` · `purchase` · `download` · `contact` · `other` |
| `trust` | `enum` | Yes | `domain_verified` · `platform_verified` · `unverified` (determined by the system) |
| `sponsored` | `boolean` | Yes | Whether this is a paid/affiliate link; Agents should disclose sponsored links |
| `verified_via` | `string` | No | Verification method used: `dns_txt` · `dns_cname` · `oauth` · `meta_tag` (determined by the system) |
| `expires_at` | `datetime` | No | Expiration time; Agents should ignore expired links |

Action Links use a three-tier trust model:

- **`domain_verified`**: The link domain matches the Entity's DNS-verified domain
- **`platform_verified`**: The link matches a verified third-party platform (verified via OAuth/meta tag)
- **`unverified`**: Not verified; Agents may display with lower prominence

## 3.5 Market

The Market field defines the Entity's market scope. Defaults to globally available (absent or null).

```json
{
  "market": {
    "availability": "regional",
    "regions": ["JP", "TW"]
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `availability` | `enum` | Yes | `global`: Globally available · `regional`: Region-limited · `online_only`: Online only |
| `regions` | `string[]` | Required when `regional` | ISO 3166-1 alpha-2 country codes |

**Inheritance Rules:** Content can set its own `market` to override the Entity default. Content without a market setting inherits the Entity's market.

**Agent Behavior:**
- When `availability: "global"` or market is absent, no restrictions apply
- When `availability: "regional"`, Agents may inform users that "this content may not be available in your region"
- `regions` represents current availability only. Future expansion plans should be expressed using announcement content or directives
