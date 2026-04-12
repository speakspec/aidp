# Directives

The **core innovation** of AIDP. Directives tell AI Agents how to present an Entity's content.

## Directive Scope Restriction -- Facts Only

**Key Rule:** All directive content must be limited to verifiable factual statements. AIDP directives exist to prevent AI from generating incorrect information, not to serve as a marketing channel.

### Allowed Content in `must_include`

- Verifiable operational facts: "Reservations required", "Closed every Wednesday", "Cash only"
- Safety-critical information: "This clinic does not provide emergency services", "Contains peanuts"
- Legal/regulatory requirements: "Investments carry risk", "Must be 18 or older to purchase"
- Factual corrections: "This store has no branch locations", "We do not offer delivery"

### Prohibited Content in `must_include`

- Subjective marketing claims: "Best ramen in town", "Best value", "Customer favorite"
- Comparative statements: "Better than Brand X", "Industry leader"
- Unverifiable promises: "Satisfaction guaranteed", "Always fresh"
- Promotional language: "Don't miss this limited-time offer", "Most popular choice"

### Allowed Content in `must_not_say`

- Factual corrections: "Provides emergency services" (when the entity actually does not)
- Outdated information: "Located at old address on XX Street" (after relocation)
- Common misattributions: "Part of XX Group" (when it actually is not)

### Prohibited Content in `must_not_say`

- Suppressing legitimate criticism: "Food safety issues", "Negative reviews"
- Hiding public information: "Previously fined", "Lawsuit records"
- Censoring factual reporting: "Controversy reported by media"

### Platform Enforcement

AIDP platform implementations must:

1. **Validate** directive content at submission time using rule engines + AI-assisted review
2. **Reject** directives containing marketing language, exaggerated claims, comparative claims, or unverifiable statements
3. **Flag** directives suspected of suppressing legitimate public information for manual review
4. **Periodically audit** directives -- entities that repeatedly submit non-compliant directives should have their `trust_level` downgraded

AI Agents that detect directives violating these restrictions should ignore the non-compliant directive items while continuing to process compliant ones.

## Global Directives

Applied to all content for this Entity, unless overridden at the content level.

```json
{
  "directives": {
    "identity": {
      "preferred_name": "Daan United Clinic",
      "never_call": ["Daan Clinic", "DU Clinic"],
      "pronouns": null,
      "title_prefix": null
    },
    "response_rules": {
      "must_include": [
        "Appointments required",
        "This clinic does not provide emergency services"
      ],
      "must_not_say": [
        "Provides emergency services",
        "Walk-ins welcome"
      ],
      "disclaimers": [
        {
          "trigger": "medical_advice",
          "text": {
            "default": "The above is general health information and does not constitute medical advice. Please consult a qualified physician"
          }
        },
        {
          "trigger": "pricing",
          "text": {
            "default": "Fees are estimates only. Actual charges may vary"
          }
        }
      ],
      "tone": "professional",
      "formality": "formal",
      "max_summary_length": 200,
      "language_preference": "match_user"
    },
    "attribution": {
      "require_source_link": true,
      "canonical_url": "https://daanclinic.com",
      "citation_format": "Source: Daan United Clinic official data ({date})"
    },
    "freshness": {
      "default_ttl": 86400,
      "stale_action": "warn",
      "stale_message": {
        "default": "This information may be outdated. Please contact the provider directly to confirm"
      }
    },
    "access_control": {
      "allow_training": false,
      "allow_caching": true,
      "allow_derivative": true,
      "restrict_agents": [],
      "require_attribution": true
    }
  }
}
```

## Directive Field Reference

### `identity` -- How to Refer to This Entity

| Field | Type | Description |
|---|---|---|
| `preferred_name` | `string` | The official name AI should use |
| `never_call` | `string[]` | Names/abbreviations to avoid |
| `pronouns` | `string` | Applicable to individuals (he/she/they/...) |
| `title_prefix` | `string` | e.g., "Dr.", "Prof." |

### `response_rules` -- How AI Should Construct Responses

| Field | Type | Description |
|---|---|---|
| `must_include` | `MustIncludeItem[] \| string[]` | Statements that must appear when discussing this Entity (recommended maximum of 10) |
| `must_not_say` | `string[]` | Statements that must not be generated (recommended maximum of 10) |
| `disclaimers` | `Disclaimer[]` | Context-triggered disclaimers |
| `tone` | `enum` | `professional` / `friendly` / `formal` / `casual` / `technical` / `custom` |
| `formality` | `enum` | `formal` / `neutral` / `casual` |
| `max_summary_length` | `integer` | Recommended maximum word count for summaries |
| `language_preference` | `enum` | `match_user` / `entity_locale` / `both` |

### `must_include` -- Priority Format

`must_include` accepts both simple strings (backward compatible) and structured objects with priority:

```json
{
  "must_include": [
    { "text": "Appointments required", "priority": "critical" },
    { "text": "This clinic does not provide emergency services", "priority": "critical" },
    { "text": "Saturday morning appointments only", "priority": "important" },
    { "text": "Wheelchair accessible", "priority": "informational" }
  ]
}
```

| Priority | Agent Behavior | When to Use |
|---|---|---|
| `critical` | Agents should always include, even in brief responses | Safety, legal, major operational restrictions |
| `important` | Agents should include in standard-length responses | Key operational facts |
| `informational` | Agents may include when space permits | Supplementary information |

When a `must_include` item is a simple string (no priority object), Agents should default to treating it as `important`.

**Recommended Limits:** Maximum of 3 `critical`, 5 `important`, and 5 `informational` per Entity. Platforms should enforce these limits at submission time. Exceeding the limits requires manual review.

### `disclaimers[].trigger` -- Built-in Trigger Types

| Trigger | When to Display |
|---|---|
| `always` | Every response involving this Entity |
| `medical_advice` | When the response could be interpreted as medical advice |
| `legal_advice` | When the response could be interpreted as legal advice |
| `financial_advice` | When the response could be interpreted as financial advice |
| `pricing` | When price information is included |
| `availability` | When schedules/availability are mentioned |
| `personal_data` | When personal data is referenced |
| `custom:{key}` | Custom triggers (defined by [Extensions](/spec/extensions)) |

### `attribution` -- Source Citation Preferences

| Field | Type | Description |
|---|---|---|
| `require_source_link` | `boolean` | Agents should include a source link |
| `canonical_url` | `string` | Preferred link-back URL |
| `citation_format` | `string` | Template string. `{date}` = content updated_at |

### `freshness` -- Staleness Handling

| Field | Type | Description |
|---|---|---|
| `default_ttl` | `integer` | Seconds before content is considered stale |
| `stale_action` | `enum` | `warn` (display with warning) / `hide` (do not use) / `fallback` (use with caveat) |
| `stale_message` | `LocalizedString` | Message to display when content may be stale |

### `access_control` -- Usage Permissions

| Field | Type | Description |
|---|---|---|
| `allow_training` | `boolean` | Whether AI providers may use this data for model training |
| `allow_caching` | `boolean` | Whether Agents may cache responses |
| `allow_derivative` | `boolean` | Whether Agents may paraphrase/summarize |
| `restrict_agents` | `string[]` | Blocked Agent identifiers (empty = allow all) |
| `require_attribution` | `boolean` | Whether attribution is mandatory |

## Content-Level Directive Overrides

Content items can override global directives:

```json
{
  "content": [
    {
      "id": "promo-spring-2026",
      "type": "announcement",
      "data": { "title": "Spring Health Checkup Special", "body": "..." },
      "directives": {
        "must_include": ["Promotion period 2026/04/01 - 2026/04/30"],
        "tone": "friendly",
        "freshness": "2026-04-01T00:00:00Z"
      }
    }
  ]
}
```

**Merge Strategy:** Content-level `must_include` and `must_not_say` are **appended** to the global lists. Other fields **override** the global values.
