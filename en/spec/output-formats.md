# Output Formats

The AIDP document serves as the **single source of truth** and can be projected into multiple output formats. This section defines the standard mapping rules for each supported format.

## Design Philosophy

```
                    ┌─────────────────────┐
                    │   AIDP JSON (Source) │
                    │   Entity + Content   │
                    │   + Directives       │
                    └─────────┬───────────┘
                              │
          ┌───────────┬───────┼───────┬──────────┬──────────┐
          ▼           ▼       ▼       ▼          ▼          ▼
    Schema.org    llms.txt   MCP    Open      REST       HTML
    JSON-LD      Markdown  Endpoint Graph      API      Microdata
  (SEO-ready)  (AI nav)  (Agent)  (Social)  (3rd-party) (Web embed)
```

Each projection is **lossy by design** -- only the AIDP JSON carries the complete [directive](/spec/directives) set. Other formats carry only what their schema permits:

| Format | Carries Content | Carries Directives | Carries Trust Info |
|---|---|---|---|
| AIDP JSON | Full | Full | Full |
| MCP Resource/Tool | Full | Full | Full |
| Schema.org / JSON-LD | Mapped | None | Partial (via `sameAs`, `isVerifiedBy`) |
| llms.txt | Summary | Embedded in prose | Mentioned in header |
| Open Graph | Title/description only | None | None |
| REST API | Full | Full | Full |
| HTML Microdata | Mapped | None | None |

## Schema.org / JSON-LD Projection

### Entity Mapping

| AIDP Field | Schema.org Type/Property |
|---|---|
| `entity` (type: business) | `LocalBusiness` |
| `entity` (type: organization) | `Organization` |
| `entity` (type: individual) | `Person` |
| `entity` (type: government) | `GovernmentOrganization` |
| `entity` (type: academic) | `EducationalOrganization` |
| `entity` (type: media) | `NewsMediaOrganization` |
| `entity.name.default` | `name` |
| `entity.name.{locale}` | `name` with `@language` |
| `entity.description.default` | `description` |
| `entity.domain` | `url` (as `https://{domain}`) |
| `entity.contacts[type=phone]` | `telephone` |
| `entity.contacts[type=email]` | `email` |
| `entity.addresses[].formatted` | `address` -> `PostalAddress.streetAddress` |
| `entity.addresses[].geo` | `geo` -> `GeoCoordinates` |
| `entity.links.website` | `url` |
| `entity.links.social.*` | `sameAs` (array) |
| `entity.links.actions[rel=action]` | `potentialAction` -> `Action` with `url` |
| `entity.links.actions[].sponsored` | (Cannot be expressed in Schema.org) |

### Content Mapping

| AIDP Content Schema | Schema.org Type |
|---|---|
| `aidp:service` | `Service` |
| `aidp:product` | `Product` |
| `aidp:article` | `Article` |
| `aidp:faq` | `FAQPage` -> `Question` + `Answer` |
| `aidp:event` | `Event` |
| `aidp:menu_item` | `MenuItem` (under `Menu`) |
| `aidp:person` | `Person` |
| `aidp:policy` | `WebPage` (type: policy) |
| `aidp:announcement` | `SpecialAnnouncement` |

### Projection Example

An AIDP source (restaurant entity with menu_item) projects to:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Sakura Ramen",
  "description": "Authentic Japanese ramen shop in Portland, specializing in tonkotsu and miso ramen",
  "url": "https://sakuraramen.com",
  "telephone": "+1-503-555-0188",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 NW 10th Ave, Portland, OR 97209",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.5235,
    "longitude": -122.6812
  },
  "sameAs": [
    "https://instagram.com/sakuraramen_pdx"
  ],
  "hasMenu": {
    "@type": "Menu",
    "hasMenuItem": [
      {
        "@type": "MenuItem",
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth simmered for 18 hours, served with house-made noodles",
        "offers": {
          "@type": "Offer",
          "price": 16.50,
          "priceCurrency": "USD"
        },
        "suitableForDiet": []
      },
      {
        "@type": "MenuItem",
        "name": "Vegan Miso Ramen",
        "description": "Plant-based broth made with kelp and shiitake mushrooms",
        "offers": {
          "@type": "Offer",
          "price": 15.00,
          "priceCurrency": "USD"
        },
        "suitableForDiet": [
          "https://schema.org/VeganDiet",
          "https://schema.org/VegetarianDiet"
        ]
      }
    ]
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "11:30", "closes": "14:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "17:00", "closes": "21:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "11:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "11:00", "closes": "21:00" }
  ]
}
```

### Directive Mapping Limitations

Schema.org has **no equivalent** for AIDP directives. The following information is lost in Schema.org projections:

- `must_include` / `must_not_say` -- Cannot be expressed
- `tone` / `formality` -- Cannot be expressed
- `disclaimers` -- Cannot be expressed
- `trust_level` / `trust_score` -- Cannot be expressed (partially possible via custom properties)
- `access_control` -- Cannot be expressed (requires companion IETF AIPREF headers)

This is by design. The Schema.org projection provides immediate SEO value; the AIDP JSON provides the complete directive set.

## llms.txt Projection

### Format Rules

AIDP projects to llms.txt using the following template:

```markdown
# {entity.name.default}

> {entity.description.default}
> AIDP Verified: {verification.trust_level} | Updated: {last_verified}
> Directives: {canonical_url}/.well-known/aidp.json

## About

{entity.description expanded, contacts, addresses, hours summary}

## Important Notes

{directives.response_rules.must_include -- one per line}

## Services

{content[type=service] -- name + short description per item}

## Products / Menu

{content[type=product|menu_item] -- name + price per item}

## FAQ

{content[type=faq] -- Q + A per item}

## Links

- Website: {entity.links.website}
- AIDP Full Data: {canonical_url}/.well-known/aidp.json
{for each entity.links.actions where rel=action:}
- {label}: {url} {if sponsored: "(Sponsored)"}
```

### Directive Embedding

In llms.txt, directives are embedded as natural language:

- `must_include` items appear as bullet points in the **Important Notes** section
- `must_not_say` is expressed as: "Note: This entity does NOT {must_not_say item}"
- `preferred_name` is used consistently throughout the document
- `never_call` items are noted as: "Do not refer to this entity as: {never_call items}"
- Action links are listed in the **Links** section; sponsored links are marked "(Sponsored)"
- The blockquote header includes a link to the full AIDP JSON for agents that support it

## Open Graph Projection

Minimal projection for social sharing:

```html
<meta property="og:title" content="{entity.name.default}" />
<meta property="og:description" content="{entity.description.default}" />
<meta property="og:url" content="{entity.links.website}" />
<meta property="og:type" content="business.business" />
<meta property="og:locale" content="{entity.locale}" />
<meta property="business:contact_data:street_address" content="{addresses[0].formatted}" />
<meta property="business:contact_data:phone_number" content="{contacts[type=phone].value}" />
<meta property="place:location:latitude" content="{addresses[0].geo.lat}" />
<meta property="place:location:longitude" content="{addresses[0].geo.lng}" />
```

## HTML Microdata Projection

For embedding structured data directly in HTML page markup:

```html
<div itemscope itemtype="https://schema.org/LocalBusiness">
  <meta itemprop="name" content="{entity.name.default}" />
  <meta itemprop="description" content="{entity.description.default}" />
  <link itemprop="url" href="{entity.links.website}" />
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <meta itemprop="streetAddress" content="{addresses[0].formatted}" />
  </div>
</div>
```

## IETF AIPREF Header Projection

When serving AIDP content over HTTP, servers should include AIPREF-compatible headers derived from `directives.access_control`:

| AIDP Field | AIPREF Header |
|---|---|
| `allow_training: false` | `Content-Usage: disallow=FoundationModelProduction` |
| `allow_training: true` | `Content-Usage: allow=FoundationModelProduction` |
| `allow_derivative: true` | `Content-Usage: allow=Search` |
| `require_attribution: true` | (No direct mapping; conveyed through AIDP directives) |

This ensures that even agents unaware of AIDP can respect basic access controls through standard HTTP headers.

## Projection Consistency Rules

1. **All projections must be generated from the same AIDP source document.** Implementors must not maintain separate data for different formats.
2. **Entity names across all projections must use `entity.name.default`** (or the locale-appropriate variant), never values from `directives.identity.never_call`.
3. **Content updates to the AIDP source must trigger regeneration of all active projections.** Stale projections are worse than no projections.
4. **Projection generators should include a reference back to the AIDP source** (via `<link rel="aidp">`, llms.txt blockquote, or Schema.org `additionalType` property) so agents can discover the complete directive set.
5. **Projections must not fabricate data not present in the AIDP source.** If a Schema.org property has no corresponding AIDP equivalent, it should be omitted rather than guessed.
