# AIDP — AI Directive Protocol

> **Version:** 0.1.0
> **Status:** Released
> **Author:** Otis / SpeakSpec
> **License:** MIT (or CC-BY-4.0 for spec text)
> **Last Updated:** 2026-04-04

## 1. Overview

AIDP (AI Directive Protocol) defines a standard format for content providers — businesses, institutions, individuals — to publish structured information **intended for consumption by AI Agents**, along with **directives** that guide how AI should represent that information in responses.

Think of it as:

- **Schema.org** → tells search engines *what* your content is
- **AIDP** → tells AI agents *what* your content is, *how* to talk about it, and *how much to trust it*

### 1.1 Design Principles

| Principle | Description |
|---|---|
| **Core-strict, Edge-open** | Core fields are tightly defined; everything else is extensible |
| **Machine-first, Human-debuggable** | Output is JSON, but readable by developers |
| **Trust is verifiable, not self-declared** | Trust level is derived from verification methods, not user input |
| **Protocol-agnostic transport** | Can be served via MCP, REST, static file, DNS TXT, or embedded in HTML |
| **Backwards-compatible evolution** | New versions MUST NOT break parsers of older versions |
| **Multi-format output** | One AIDP source document can be projected into Schema.org, llms.txt, Open Graph, and other formats |
| **Build on existing standards** | Leverage W3C VC/DID, IETF AIPREF, C2PA where applicable rather than reinventing |
| **First-party factual only** | Directives carry verifiable facts, not marketing claims or subjective opinions |
| **Multi-signal trust** | Trust is assessed across identity, content integrity, and community consensus — not a single score |

### 1.2 Terminology

| Term | Definition |
|---|---|
| **Entity** | The business, person, or organization that owns the content |
| **Directive** | An instruction to AI on how to handle/present content |
| **Agent** | Any AI system that reads AIDP data |
| **Provider** | The platform or system hosting the AIDP endpoint |
| **Projection** | The transformation of an AIDP document into another format (e.g., Schema.org, llms.txt) |

### 1.3 Minimal Profile (Quick Start)

The smallest valid AIDP document. A business owner can start with just this:

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:my-shop",
    "type": "business",
    "name": { "default": "My Shop" },
    "locale": "en-US"
  },
  "verification": {
    "methods": [],
    "trust_score": 0.10,
    "trust_level": "unverified",
    "last_verified": null
  },
  "content": [],
  "directives": {
    "response_rules": {
      "must_include": [],
      "must_not_say": []
    }
  }
}
```

This is a valid AIDP document with zero content. The entity can then progressively add:

1. **Domain + DNS verification** → `trust_level` upgrades to `verified_domain`
2. **Content items** → services, products, FAQ, media
3. **Directives** → `must_include`, `must_not_say`, tone, disclaimers
4. **Business registration** → `trust_level` upgrades to `verified_organization`

Every field beyond the minimal profile is optional. The platform UI should guide users through this progression, not require everything upfront.

---

## 2. Document Structure

An AIDP document is a single JSON object with the following top-level structure:

```json
{
  "$aidp": "0.1.0",
  "entity": { },
  "verification": { },
  "content": [ ],
  "directives": { },
  "community": { },
  "extensions": { }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `$aidp` | `string` | ✅ | Protocol version (semver) |
| `entity` | `Entity` | ✅ | Identity of the content owner |
| `verification` | `Verification` | ✅ | How this entity's identity is verified |
| `content` | `Content[]` | ✅ | The actual structured content entries |
| `directives` | `Directives` | ❌ | Global response directives for AI |
| `community` | `Community` | ❌ | Disputes, cross-references, and integrity signals (see Section 10) |
| `extensions` | `object` | ❌ | Namespaced third-party extensions |

---

## 3. Entity

Describes **who** is publishing this content.

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
    "relationships": [
      {
        "type": "parent_organization",
        "entity_ref": "urn:aidp:entity:daan-medical-group",
        "status": "active"
      }
    ],
    "market": {
      "availability": "regional",
      "regions": ["US"]
    }
  }
}
```

### 3.1 Entity Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Globally unique URN (`urn:aidp:entity:{slug}`) or DID (see 4.4) |
| `type` | `enum` | ✅ | `organization` · `business` · `government` · `academic` · `media` · `individual` · `bot` |
| `name` | `LocalizedString` | ✅ | Display name(s), keyed by locale |
| `description` | `LocalizedString` | ❌ | Short description |
| `domain` | `string` | ❌ | Primary domain (used for DNS verification) |
| `locale` | `string` | ✅ | Primary locale (BCP 47) |
| `category` | `string[]` | ❌ | Free-form category tags |
| `contacts` | `Contact[]` | ❌ | Contact information (see 3.1.1) |
| `addresses` | `Address[]` | ❌ | Physical/mailing addresses |
| `links` | `Links` | ❌ | Canonical URLs, social profiles, and action links (see 3.4) |
| `relationships` | `Relationship[]` | ❌ | Declared relationships to other entities (see 3.2) |
| `market` | `Market \| null` | ❌ | Market availability (see 3.5). Absent or null = global |

### 3.1.1 Contact Object

Each contact entry describes a single point of contact. The `type` field uses a predefined enum with an `other` escape hatch for region-specific or non-standard channels.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `enum` | Yes | `phone` · `email` · `other` |
| `value` | `string` | Yes | Contact value (phone number, email address, handle, URL, etc.) |
| `label` | `string` | No | Human-readable label (e.g., "Appointments", "LINE", "WhatsApp") |
| `custom_type` | `string` | No | Required when `type` is `other`. Free-form channel name (e.g., `line`, `whatsapp`, `wechat`, `telegram`, `signal`) |

When `type` is `other`, agents SHOULD use `custom_type` for channel identification and `label` for display. Default contact types (`phone`, `email`) are universally understood; region-specific messaging platforms should use `other` with an appropriate `custom_type`.

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

### 3.2 Entity Relationships

Entities can declare relationships to other AIDP-registered entities. These are **unidirectional declarations** — entity A declaring a relationship to entity B does NOT require entity B's confirmation (though mutual confirmation increases trust).

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

| Relationship Type | Description | Requires Mutual Confirmation |
|---|---|---|
| `parent_organization` | This entity belongs to a larger organization | Recommended |
| `subsidiary` | This entity owns/operates another entity | Recommended |
| `official_partner` | Declared business/promotional partnership | No |
| `authorized_reseller` | Authorized to sell this entity's products | Recommended |
| `affiliated` | General affiliation (e.g., franchise) | No |

**Behavior rules:**

1. Relationships are informational only — they do NOT transfer trust levels between entities
2. AI agents MAY use relationships to cross-reference claims (e.g., "Is this KOL really an official partner?")
3. Mutually confirmed relationships (both entities declare the relationship) carry higher signal value
4. `entity_ref` MUST point to an existing AIDP entity ID or DID. Unresolvable references are ignored

### 3.3 LocalizedString

Any human-readable string field can be localized:

```json
{
  "default": "Primary language content",
  "ja": "日本語コンテンツ",
  "zh-TW": "繁體中文內容"
}
```

The `default` key is required. Agents SHOULD use the locale matching the end-user's language, falling back to `default`.

### 3.4 Links

Entity links consist of canonical URLs and actionable links (CTAs).

#### Links Object Fields

| Field | Type | Description |
|---|---|---|
| `website` | `string` | Primary website URL |
| `google_maps` | `string` | Google Maps URL |
| `social` | `object` | Social profile URLs, keyed by platform name |
| `actions` | `ActionLink[]` | Trackable call-to-action links (see below) |

#### Action Links

The `actions` array contains trackable call-to-action links:

| Field | Type | Required | Description |
|---|---|---|---|
| `rel` | `enum` | ✅ | `action` (CTA) · `source` (reference) · `related` (related resource) |
| `label` | `string` | ✅ | Human-readable label (also usable as anchor text by AI agents) |
| `url` | `string` | ✅ | Redirect proxy URL for tracking; agents SHOULD use this URL |
| `original_url` | `string` | ❌ | Original destination URL (only in management API, omitted in public output) |
| `purpose` | `enum` | ❌ | `booking` · `menu` · `apply` · `info` · `purchase` · `download` · `contact` · `other` |
| `trust` | `enum` | ✅ | `domain_verified` · `platform_verified` · `unverified` (system-determined) |
| `sponsored` | `boolean` | ✅ | Whether this is a paid/affiliate link; agents SHOULD disclose sponsored links |
| `verified_via` | `string` | ❌ | Verification method used: `dns_txt` · `dns_cname` · `oauth` · `meta_tag` (system-determined) |
| `expires_at` | `datetime` | ❌ | Expiration time; agents SHOULD ignore expired links |

Action links use a three-tier trust model:

- **`domain_verified`**: URL domain matches entity's DNS-verified domain
- **`platform_verified`**: URL matches a verified third-party platform (OAuth/meta tag verified)
- **`unverified`**: No verification; agents MAY display with lower prominence

### 3.5 Market

Defines the geographic/market availability of an entity and its content. This field is **optional** — when absent or null, the entity is considered globally available.

```json
{
  "entity": {
    "market": {
      "availability": "regional",
      "regions": ["JP", "TW"]
    }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `market.availability` | `enum` | ✅ (when market is set) | `global` · `regional` · `online_only` |
| `market.regions` | `string[]` | When `regional` | ISO 3166-1 alpha-2 country codes |

**Availability values:**

| Value | Meaning |
|---|---|
| `global` | Available worldwide; `regions` is optional and ignored |
| `regional` | Available only in specified regions; `regions` is required |
| `online_only` | Online service with no geographic restriction |

**Inheritance rule:** Content items inherit the entity's `market` unless they specify their own (see 5.1). This allows an entity to declare a default market while individual content items can override it (e.g., a Japan-only business offering a globally available online course).

**Agent behavior:** When an agent knows the end-user's region and the content's effective market is `regional`, the agent SHOULD note availability limitations. Agents MUST NOT present `regional` content as universally available.

**Future plans as content:** Market expansion plans (e.g., "launching in US in Q3 2026") should be expressed as `announcement` content or via `directives.response_rules.must_include`, not by adding unserved regions to `market.regions`. The `regions` field represents current factual availability.

---

## 4. Verification

Defines **how the entity's identity is verified** and produces a computed trust level.

```json
{
  "verification": {
    "platform": {
      "id": "urn:aidp:platform:speakspec",
      "url": "https://api.speakspec.com",
      "name": "AIDP Official Platform"
    },
    "methods": [
      {
        "type": "dns_txt",
        "domain": "daanclinic.com",
        "record": "aidp-verify=abc123xyz",
        "verified_at": "2026-03-20T08:00:00Z",
        "status": "verified"
      },
      {
        "type": "business_registration",
        "country": "US",
        "registration_id": "OR-12345678",
        "verified_at": "2026-03-18T10:00:00Z",
        "status": "verified"
      }
    ],
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "last_verified": "2026-03-20T08:00:00Z",
    "credential": null
  }
}
```

### 4.1 Verification Methods

| `type` | Description | Trust Weight |
|---|---|---|
| `dns_txt` | TXT record on domain pointing to AIDP entity ID | High |
| `dns_cname` | CNAME subdomain delegation (e.g., `_aidp.example.com`) | High |
| `meta_tag` | `<meta name="aidp-verify">` in website HTML | Medium |
| `business_registration` | Government business registration number verified | High |
| `domain_whois` | Domain WHOIS matches entity info | Medium |
| `email_domain` | Verified email on matching domain | Low |
| `social_verification` | Linked social account with matching identity | Low |
| `manual_review` | Platform staff manual verification | High |
| `third_party` | External verification provider (extensible) | Varies |
| `verifiable_credential` | W3C Verifiable Credential presented (see 4.4) | High |

### 4.2 Trust Levels (Computed)

Trust level is **derived by the platform**, not self-declared. The enum values are ordered:

| Level | Typical Entity | Min Score |
|---|---|---|
| `sovereign` | Government agencies, .gov domains | 0.95 |
| `institutional` | Universities, research bodies, medical associations | 0.90 |
| `verified_organization` | DNS-verified businesses with registration | 0.80 |
| `verified_domain` | DNS-verified but no business registration | 0.65 |
| `claimed` | Account created, email verified, no DNS | 0.40 |
| `unverified` | Anonymous or newly registered | 0.10 |

### 4.3 Trust Score Computation

The `trust_score` is a `float` between 0 and 1. The platform computes it based on:

```
trust_score = Σ(method_weight × method_status) / max_possible_score
```

This is intentionally **not rigidly specified** in v0.1 — different platform implementations MAY use different weighting algorithms, but MUST expose the resulting `trust_level` enum so agents have a standardized signal.

### 4.4 Verifiable Credential Integration (Optional, Forward-Looking)

AIDP is designed to integrate with the **W3C Verifiable Credentials 2.0** ecosystem. This section defines the bridge between AIDP's native verification and the VC/DID infrastructure.

#### 4.4.1 Entity ID as DID

The `entity.id` field MAY use a W3C Decentralized Identifier instead of the default URN format:

```json
{
  "entity": {
    "id": "did:web:daanclinic.com"
  }
}
```

Supported DID methods:

| DID Method | Use Case | Notes |
|---|---|---|
| `did:web` | Domain-verified entities | Resolves via HTTPS, ties to existing domain |
| `did:key` | Lightweight / self-issued | No external resolution needed |
| `did:wba` | Agent Network Protocol compatible | For interop with ANP ecosystem |

When `entity.id` is a DID, agents MAY resolve the DID Document to obtain public keys for signature verification.

Parsers MUST accept both `urn:aidp:*` and `did:*` formats. If the parser does not support DID resolution, it MUST treat the DID as an opaque identifier.

#### 4.4.2 Credential Field

The `verification.credential` field carries a W3C Verifiable Credential that cryptographically attests to the entity's verified identity:

```json
{
  "verification": {
    "methods": [ ... ],
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "last_verified": "2026-03-20T08:00:00Z",
    "credential": {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://speakspec.com/ns/v1"
      ],
      "type": ["VerifiableCredential", "AIDPEntityCredential"],
      "issuer": "did:web:api.speakspec.com",
      "validFrom": "2026-03-20T08:00:00Z",
      "validUntil": "2027-03-20T08:00:00Z",
      "credentialSubject": {
        "id": "did:web:daanclinic.com",
        "aidpTrustLevel": "verified_organization",
        "aidpVerificationMethods": ["dns_txt", "business_registration"],
        "domain": "daanclinic.com",
        "registrationCountry": "US"
      },
      "proof": {
        "type": "DataIntegrityProof",
        "cryptosuite": "ecdsa-jcs-2019",
        "verificationMethod": "did:web:api.speakspec.com#key-1",
        "proofPurpose": "assertionMethod",
        "created": "2026-03-20T08:00:00Z",
        "proofValue": "z58DAdFfa9..."
      }
    }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `credential` | `VerifiableCredential \| null` | ❌ | W3C VC 2.0 attesting entity identity |

**Behavior rules:**

1. `credential` is OPTIONAL in v0.1. When absent or `null`, agents fall back to `trust_level` enum
2. When present, agents that support VC verification SHOULD validate the `proof` before trusting `trust_level`
3. If `proof` validation fails, agents MUST downgrade `trust_level` to `unverified` regardless of the claimed value
4. The `issuer` identifies the AIDP platform that performed verification. Multiple issuers MAY be supported in future versions
5. `validUntil` expiry MUST be respected — expired credentials are treated as absent

#### 4.4.3 C2PA Content Provenance (Reserved)

For content items that include media (images, documents), AIDP reserves the `content[].provenance` field for future **C2PA Content Credentials** integration:

```json
{
  "content": [
    {
      "id": "photo-storefront",
      "type": "media",
      "data": { "url": "https://..." },
      "provenance": {
        "type": "c2pa",
        "manifest_url": "https://...",
        "signer": "did:web:daanclinic.com"
      }
    }
  ]
}
```

This field is reserved and NOT active in v0.1. Agents MUST ignore it until a future version activates the schema.

### 4.5 Anti-Impersonation Rules

AIDP platforms MUST implement the following safeguards to prevent entity impersonation.

#### 4.5.1 Mandatory Checks

The following checks are **required** for all AIDP platform implementations:

**Domain-Name Binding:** If `entity.domain` is set, the `entity.name` MUST correspond to the domain owner. Platform MUST reject registrations where the claimed name is a well-known brand (e.g., "Apple", "Google", "Nike") but the domain does not match the brand's known domains.

**Name Similarity Detection:** On registration, `entity.name` (all locale variants) MUST be checked against all existing entities with `trust_level` ≥ `verified_domain` using fuzzy matching (Levenshtein distance, phonetic similarity, translation equivalence). If similarity exceeds threshold AND domain does not match, the registration MUST be either rejected or routed to manual review.

**Type Restriction:** `entity.type` values `government` and `institutional` MUST require manual platform review. Self-service registration for these types is prohibited.

**Trust Ceiling:** If an entity's name matches an existing `verified_organization` or above entity AND the domain differs, `trust_level` is **hard-capped** at `unverified` regardless of other verification scores. This cap can only be lifted by manual platform review.

#### 4.5.2 Identity Binding Record

Platforms SHOULD expose impersonation check results in the verification object:

```json
{
  "verification": {
    "identity_binding": {
      "domain_name_match": "strict",
      "name_similarity_checked": true,
      "similar_entities_found": [],
      "impersonation_risk": "low",
      "reviewed_at": "2026-03-25T00:00:00Z"
    }
  }
}
```

| Field | Type | Description |
|---|---|---|
| `domain_name_match` | `enum` | `strict` (domain matches name), `partial` (related), `none` (no domain), `mismatch` (suspicious) |
| `name_similarity_checked` | `boolean` | Whether fuzzy matching was performed |
| `similar_entities_found` | `string[]` | IDs of similar existing entities (empty = no conflicts) |
| `impersonation_risk` | `enum` | `low` · `medium` · `high` · `blocked` |
| `reviewed_at` | `datetime` | When the last impersonation check was performed |

Agents SHOULD treat entities with `impersonation_risk: "high"` the same as `trust_level: "unverified"`.

### 4.6 Cross-Reference Verification

Platforms MAY perform automated cross-referencing of AIDP self-reported data against public third-party sources. This provides an independent consistency signal separate from identity trust.

```json
{
  "verification": {
    "cross_reference": {
      "sources_checked": [
        {
          "source": "google_maps",
          "entity_match": true,
          "checked_at": "2026-03-25T00:00:00Z"
        },
        {
          "source": "oregon_sos",
          "entity_match": true,
          "registration_id_match": true,
          "checked_at": "2026-03-25T00:00:00Z"
        }
      ],
      "discrepancies": [
        {
          "field": "content.hours.schedule[day=sat]",
          "aidp_value": "11:00-22:00",
          "external_value": "11:00-20:00",
          "source": "google_maps",
          "severity": "minor",
          "detected_at": "2026-03-25T00:00:00Z"
        }
      ],
      "consistency_score": 0.85,
      "last_checked": "2026-03-25T00:00:00Z"
    }
  }
}
```

#### 4.6.1 Cross-Reference Sources

| Source ID | Data Checked | Region |
|---|---|---|
| `google_maps` | Hours, address, phone, reviews sentiment | Global |
| `oregon_sos` | Business registration, company name, status | Oregon, US |
| `fda_food_safety` | Food safety certifications, violations | US |
| `state_medical_board` | Medical licenses, specialties | US |
| `whois` | Domain registration data | Global |
| `social_profile` | Profile name, bio consistency | Global |

Platforms MAY add custom sources. Source IDs for custom sources MUST be prefixed with `x-`.

#### 4.6.2 Consistency Score

`consistency_score` is a `float` between 0 and 1, independent of `trust_score`:

- `trust_score` answers: **"Are you who you claim to be?"** (identity)
- `consistency_score` answers: **"Does what you say match what others say?"** (content accuracy)

AI agents SHOULD consider both dimensions when determining how much to rely on an entity's content:

| trust_score | consistency_score | Agent Recommendation |
|---|---|---|
| High | High | Treat as reliable source |
| High | Low | Identity confirmed but content may be outdated or biased — show with caveat |
| Low | High | Content seems accurate but identity unverified — show with caveat |
| Low | Low | Unreliable — prefer other sources |

### 4.7 Platform-Hosted vs Self-Hosted Trust

An AIDP document can be served from a trusted platform or self-hosted at `/.well-known/aidp.json`. The trust implications differ significantly.

#### 4.7.1 Platform Field

The `verification.platform` field identifies whether and which platform performed the verification:

```json
{
  "verification": {
    "platform": {
      "id": "urn:aidp:platform:speakspec",
      "url": "https://api.speakspec.com",
      "name": "AIDP Official Platform"
    }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `platform` | `Platform \| null` | ❌ | The platform that hosts and verifies this AIDP document |
| `platform.id` | `string` | ✅ | Platform identifier |
| `platform.url` | `string` | ✅ | Platform URL (for agent to verify platform legitimacy) |
| `platform.name` | `string` | ❌ | Human-readable platform name |

#### 4.7.2 Trust Implications

| Hosting Mode | `platform` value | Trust Behavior |
|---|---|---|
| **Platform-hosted** | Present, resolvable | Agent can verify trust scores with the platform. All verification fields (trust_score, consistency_score, integrity_score) are platform-attested |
| **Self-hosted** | `null` or absent | Agent MUST treat all verification fields as self-declared. Effective `trust_level` SHOULD be capped at `claimed` unless agent independently verifies DNS records |
| **Self-hosted + VC** | `null` but `credential` present with valid proof | Agent can cryptographically verify the credential. Trust level from VC is trustworthy even without a platform |

**Critical rule:** When `platform` is `null` and `credential` is absent, agents MUST NOT trust `trust_score`, `trust_level`, `consistency_score`, or `integrity_score` values — they are unverifiable self-declarations. The only signal agents can independently verify from a self-hosted AIDP is DNS record presence.

---

## 5. Content

The `content` array holds the actual structured data entries.

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
            { "day": "mon", "hours": "09:00-12:00, 14:00-17:00" },
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

### 5.1 Content Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique within this entity |
| `type` | `string` | ✅ | Semantic type: `service`, `product`, `article`, `faq`, `event`, `person`, `menu_item`, `policy`, `announcement`, `dataset`, or custom |
| `schema` | `string` | ❌ | Schema reference (`aidp:{type}` for built-in, or custom URI) |
| `locale` | `string` | ❌ | Override entity locale for this content |
| `data` | `object` | ✅ | The actual content payload (schema-dependent) |
| `directives` | `ContentDirectives` | ❌ | Content-level directives (override global) |
| `tags` | `string[]` | ❌ | Searchable tags |
| `updated_at` | `datetime` | ✅ | Last content modification time |
| `expires_at` | `datetime` | ❌ | Content expiration (agent SHOULD ignore after) |
| `provenance` | `Provenance \| null` | ❌ | Reserved for C2PA integration (see 4.4.3) |
| `media_refs` | `string[]` | ❌ | IDs of related `aidp:media` content items (see 5.3) |
| `market` | `Market \| null` | ❌ | Override entity market for this content (see 3.5). Absent = inherit entity market |
| `variant_of` | `string \| null` | ❌ | Content ID of the base content this is a variant of (see 5.4) |
| `variant_delta` | `object \| null` | When `variant_of` is set | Only the fields that differ from the base content's `data` (see 5.4) |

Content `data` objects MAY include a `links` array following the same Action Links schema defined in Section 3.4. These links are scoped to the specific content item and tracked independently.

#### Language Philosophy

Content MAY be written in any language or mix of languages. AI agents possess cross-language understanding and can process content in any language, translating for end-users as needed. If a term has a specific meaning in a particular language, it is acceptable and encouraged to use that language directly.

The `entity.locale` and `content.locale` fields serve as **contextual hints** to help agents understand the primary language of the content. They do not impose restrictions on what languages may appear in the content.

`LocalizedString` (the multi-locale map used by `entity.name`) is an **optional convenience** for providing official translations of display names. It is not required — a single-language `default` value is sufficient.

### 5.2 Content Types (Built-in Schemas)

The protocol defines common schemas. Providers MAY define custom schemas.

| Schema | Key Fields | Use Case |
|---|---|---|
| `aidp:service` | name, description, availability, pricing, requirements | Service offerings |
| `aidp:product` | name, description, price, variants, inventory_status | E-commerce / retail |
| `aidp:article` | title, body, author, published_at, summary | Blog / news / knowledge |
| `aidp:faq` | question, answer | Q&A pairs |
| `aidp:event` | title, start, end, location, registration_url | Events / activities |
| `aidp:menu_item` | name, description, price, allergens, available | Restaurant / food |
| `aidp:person` | name, role, bio, expertise | Team / staff profiles |
| `aidp:policy` | title, body, effective_date | Terms, privacy, policies |
| `aidp:announcement` | title, body, priority, valid_until | Time-sensitive notices |
| `aidp:dataset` | name, description, format, access_url | Data catalog entry |
| `aidp:media` | media_type, purpose, url, alt, format, dimensions | Images, videos, documents (see 5.3) |

Custom schemas use URI format: `https://example.com/schemas/my-type`

### 5.3 Media Schema (`aidp:media`)

Media content stores **metadata and URLs**, not file data. AIDP is a protocol, not a file hosting service.

#### 5.3.1 Media Types

| `media_type` | Formats | AI Behavior |
|---|---|---|
| `image` | webp, png, jpg, svg | Agent MAY display inline in responses |
| `video` | youtube, vimeo, mp4 url | Agent MAY link or embed depending on platform support |
| `document` | pdf, docx | Agent MAY parse for information or link for download |

#### 5.3.2 Purpose Types

The `purpose` field tells AI agents **when** to use this media:

| `purpose` | When to Display | Example |
|---|---|---|
| `logo` | When mentioning the brand/entity | Company logo |
| `storefront` | When answering location/appearance questions | Shop exterior photo |
| `product` | When discussing specific items (linked via `media_refs`) | Product photo |
| `menu` | When discussing food/service options | Full menu scan |
| `document` | When detailed reference is needed | Price list PDF |
| `certificate` | When verifying credentials/qualifications | Business license |
| `video_intro` | When giving an overview of the entity | Introduction video |
| `gallery` | General visual context | Interior photos |

#### 5.3.3 Image Example

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

#### 5.3.4 Document (PDF) Example

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
| `parseable` | Agent SHOULD read/parse the document content to answer questions, but not display the raw document |
| `renderable` | Agent MAY display the document directly to the user (e.g., menu image, certificate) |
| `link_only` | Agent SHOULD only provide a download link, not parse or display |

#### 5.3.5 Video Example

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

#### 5.3.6 Content-Media Linking

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

**Linking rules:**

1. `media_refs` contains IDs of `aidp:media` content items within the same entity
2. A single media item MAY be referenced by multiple content items
3. Agents SHOULD prefer media linked via `media_refs` over unlinked media when responding about a specific content item
4. `media_refs` order indicates display priority (first = most relevant)

#### 5.3.7 Media Directives

Media items support specialized directives in addition to standard content directives:

| Field | Type | Description |
|---|---|---|
| `display_rules.prefer_context` | `string[]` | Contexts where this media should be shown: `brand_mention`, `entity_overview`, `location_query`, `product_query`, `faq_response` |
| `display_rules.never_display_with` | `string[]` | Contexts to avoid: `competitor_comparison`, `negative_review`, `unrelated_topic` |
| `display_rules.must_preserve_aspect_ratio` | `boolean` | Agent MUST NOT crop or stretch |
| `display_rules.min_display_size` | `string` | Minimum display dimensions (e.g., `"64px"`) |
| `licensing.type` | `enum` | `proprietary` · `cc-by` · `cc-by-sa` · `cc-by-nc` · `cc0` · `custom` |
| `licensing.attribution_required` | `boolean` | Whether source credit is required |
| `licensing.modification_allowed` | `boolean` | Whether AI may crop, filter, or modify |
| `licensing.ai_training_allowed` | `boolean` | Whether AI providers may use for model training |

### 5.4 Content Variants

Content variants allow a single logical content item to have region-specific or market-specific versions. A **variant** is a content item that declares a `variant_of` relationship to a **base** content item and stores only the fields that differ.

#### 5.4.1 Structure

```json
{
  "content": [
    {
      "id": "iphone-16",
      "type": "product",
      "data": {
        "name": "iPhone 16",
        "storage": "128GB",
        "price": "USD 999",
        "voltage": "120V",
        "certifications": ["FCC"],
        "warranty": "1 year limited warranty"
      }
    },
    {
      "id": "iphone-16-jp",
      "type": "product",
      "variant_of": "iphone-16",
      "market": {
        "availability": "regional",
        "regions": ["JP"]
      },
      "variant_delta": {
        "price": "JPY 149,800",
        "voltage": "100V",
        "certifications": ["PSE", "TELEC"],
        "warranty": "1年間保証",
        "felica": true
      }
    }
  ]
}
```

#### 5.4.2 Merge Rules

To resolve a variant's effective data, agents apply:

```
effective_data = { ...base.data, ...variant.variant_delta }
```

1. Keys in `variant_delta` **override** the same key in `base.data`
2. Keys in `base.data` not present in `variant_delta` are **preserved**
3. New keys in `variant_delta` not in `base.data` are **added**
4. A key set to `null` in `variant_delta` means **remove** that field from the effective data

#### 5.4.3 Rules

1. `variant_of` MUST reference a content ID within the same entity
2. `variant_delta` is REQUIRED when `variant_of` is set
3. The variant's `type` MUST match the base content's `type`
4. **No chaining:** a variant MUST NOT reference another variant (i.e., the base content's `variant_of` MUST be null)
5. If the base content is deleted, the variant's `variant_delta` is treated as the complete `data` (agents SHOULD fallback to using `variant_delta` as standalone data)
6. Variants inherit the base content's `directives`, `tags`, and `media_refs` unless they specify their own

#### 5.4.4 Agent Behavior

1. When an agent knows the end-user's region and a variant exists for that region (via `market.regions`), the agent SHOULD prefer the variant over the base
2. When no region-matching variant exists, the agent SHOULD use the base content
3. Agents SHOULD merge `base.data` + `variant.variant_delta` rather than presenting both separately
4. Agents MAY note that regional variants exist (e.g., "pricing varies by region")

---

## 6. Directives

The **core innovation** of AIDP. Directives tell AI agents how to represent this entity's content.

### 6.0 Directive Scope Constraint — Factual Only

**CRITICAL RULE:** All directive content MUST be limited to verifiable factual statements. AIDP directives exist to prevent AI from generating incorrect information — not to serve as a marketing channel.

#### Allowed in `must_include`:

- Verifiable operational facts: "Reservations required", "Closed every Wednesday", "Cash only"
- Safety-critical information: "This clinic does not provide emergency services", "Contains peanuts"
- Legal/regulatory requirements: "Investing involves risk", "Must be 18 or older to purchase"
- Factual corrections: "We have no branch locations", "We do not offer delivery"

#### Prohibited in `must_include`:

- Subjective marketing claims: "Best ramen in town", "Best value", "Customer favorite"
- Comparative statements: "Better than brand X", "Industry leader"
- Unverifiable promises: "Satisfaction guaranteed", "Always fresh"
- Promotional language: "Don't miss this limited-time offer", "The most popular choice"

#### Allowed in `must_not_say`:

- Factual corrections: "Provides emergency services" (when the entity does NOT provide it)
- Outdated information: "Located at old address on XX Street" (after relocation)
- Common misattributions: "Part of XX Group" (when it does not)

#### Prohibited in `must_not_say`:

- Suppressing legitimate criticism: "Food safety issues", "Negative reviews"
- Hiding public information: "Previously fined", "Litigation record"
- Censoring factual reporting: "Controversies reported by media"

#### Platform Enforcement

AIDP platform implementations MUST:

1. **Validate** directive content at submission time using rule-based + AI-assisted review
2. **Reject** directives that contain marketing language, superlatives, comparative claims, or unverifiable statements
3. **Flag** directives that appear to suppress legitimate public information for manual review
4. **Audit** directives periodically — entities that repeatedly submit non-compliant directives SHOULD have their `trust_level` downgraded

AI agents that detect directives violating these constraints SHOULD ignore the offending directive items while still processing compliant ones.

### 6.1 Global Directives

Applied to ALL content from this entity unless overridden at content level.

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

### 6.2 Directive Fields Reference

#### `identity` — How to refer to this entity

| Field | Type | Description |
|---|---|---|
| `preferred_name` | `string` | The canonical name AI should use |
| `never_call` | `string[]` | Names/abbreviations to avoid |
| `pronouns` | `string` | For individuals (he/she/they/...) |
| `title_prefix` | `string` | e.g., "Dr.", "Prof." |

#### `response_rules` — How AI should construct responses

| Field | Type | Description |
|---|---|---|
| `must_include` | `MustIncludeItem[] \| string[]` | Statements that MUST appear when discussing this entity (max 10 recommended) |
| `must_not_say` | `string[]` | Statements that MUST NOT be generated (max 10 recommended) |
| `disclaimers` | `Disclaimer[]` | Context-triggered disclaimers |
| `tone` | `enum` | `professional` · `friendly` · `formal` · `casual` · `technical` · `custom` |
| `formality` | `enum` | `formal` · `neutral` · `casual` |
| `max_summary_length` | `integer` | Suggested max chars when summarizing |
| `language_preference` | `enum` | `match_user` · `entity_locale` · `both` |

#### `must_include` — Priority Format

`must_include` accepts both simple strings (for backward compatibility) and structured objects with priority:

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

| Priority | Agent Behavior | When to Include |
|---|---|---|
| `critical` | Agent SHOULD always include, even in brief responses | Safety, legal, major operational constraints |
| `important` | Agent SHOULD include in standard-length responses | Key operational facts |
| `informational` | Agent MAY include when space permits | Nice-to-know details |

When `must_include` items are simple strings (no priority object), agents SHOULD treat them as `important` by default.

**Recommended limits:** Max 3 `critical`, 5 `important`, 5 `informational` items per entity. Platforms SHOULD enforce these limits at submission time. Exceeding the limits requires manual review.

#### `disclaimers[].trigger` — Built-in trigger types

| Trigger | When to show |
|---|---|
| `always` | Every response involving this entity |
| `medical_advice` | When response could be interpreted as medical advice |
| `legal_advice` | When response could be interpreted as legal advice |
| `financial_advice` | When response could be interpreted as financial advice |
| `pricing` | When pricing information is included |
| `availability` | When schedule/availability is mentioned |
| `personal_data` | When personal data is referenced |
| `custom:{key}` | Custom trigger (defined by extensions) |

#### `attribution` — Source citation preferences

| Field | Type | Description |
|---|---|---|
| `require_source_link` | `boolean` | Agent SHOULD include link to source |
| `canonical_url` | `string` | Preferred URL to link back to |
| `citation_format` | `string` | Template string. `{date}` = content updated_at |

#### `freshness` — Staleness handling

| Field | Type | Description |
|---|---|---|
| `default_ttl` | `integer` | Seconds before content is considered stale |
| `stale_action` | `enum` | `warn` (show with warning) · `hide` (don't use) · `fallback` (use with caveat) |
| `stale_message` | `LocalizedString` | Message to show when content may be stale |

#### `access_control` — Usage permissions

| Field | Type | Description |
|---|---|---|
| `allow_training` | `boolean` | Whether AI providers may use this data for model training |
| `allow_caching` | `boolean` | Whether agents may cache responses |
| `allow_derivative` | `boolean` | Whether agents may paraphrase/summarize |
| `restrict_agents` | `string[]` | Agent identifiers that are blocked (empty = allow all) |
| `require_attribution` | `boolean` | Whether attribution is mandatory |

### 6.3 Content-Level Directive Override

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

**Merge strategy:** Content-level `must_include` and `must_not_say` are **appended** to global lists. Other fields **override** global values.

---

## 7. Extensions

AIDP is designed to be extended by third parties without modifying the core spec.

### 7.1 Extension Namespace

Extensions live under the `extensions` key, namespaced by reverse-domain or short identifier:

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

### 7.2 Extension Rules

1. All extension keys MUST be prefixed with `x-`
2. Core spec fields MUST NOT be placed in extensions
3. Agents that don't understand an extension MUST ignore it (no errors)
4. Extension authors SHOULD publish their own schema documentation
5. Extensions MUST NOT override core directive behavior
6. Nested namespacing uses `:` separator (e.g., `x-industry:healthcare`)

### 7.3 Well-Known Extension Namespaces (Reserved)

| Namespace | Purpose |
|---|---|
| `x-google` | Google-specific integrations |
| `x-openai` | OpenAI-specific integrations |
| `x-anthropic` | Anthropic-specific integrations |
| `x-mcp` | MCP protocol-specific metadata |
| `x-schema-org` | Schema.org compatibility layer |
| `x-industry:{vertical}` | Industry-specific standards |
| `x-geo:{region}` | Region-specific requirements |
| `x-custom:{name}` | Provider/user-defined extensions |

---

## 8. Transport

AIDP is transport-agnostic. The same document can be served via multiple methods simultaneously. Implementations SHOULD support at least one of MCP or Static File.

### 8.1 MCP Transport (Recommended)

AIDP integrates with the **Model Context Protocol** as a content and directive layer. MCP handles the connection; AIDP handles the payload semantics.

#### 8.1.1 Mode A: AIDP as MCP Resource

The simplest integration. The AIDP document is exposed as a read-only MCP Resource:

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

**Agent reads the resource:**

```json
{
  "method": "resources/read",
  "params": {
    "uri": "aidp://entity/daan-clinic-pdx"
  }
}
```

**Server responds with complete AIDP document:**

```json
{
  "contents": [
    {
      "uri": "aidp://entity/daan-clinic-pdx",
      "mimeType": "application/aidp+json",
      "text": "{ \"$aidp\": \"0.3.0\", \"entity\": { ... }, ... }"
    }
  ]
}
```

Use this mode when: the entity has a manageable amount of content (< 100 items), and the agent needs the full picture including all directives.

#### 8.1.2 Mode B: AIDP as MCP Tool

For entities with large content sets, expose query tools that return filtered AIDP content with directives attached:

**Tool definition:**

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

**Example tool call:**

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

**Response includes content + merged directives:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"$aidp\":\"0.3.0\",\"entity\":{\"id\":\"urn:aidp:entity:sakura-ramen-pdx\",\"name\":{\"default\":\"Sakura Ramen\"},\"type\":\"business\"},\"verification\":{\"trust_level\":\"verified_domain\",\"trust_score\":0.72},\"content\":[{\"id\":\"menu-vegan-miso\",\"type\":\"menu_item\",\"data\":{\"name\":\"Vegan Miso Ramen\",\"price\":{\"currency\":\"USD\",\"amount\":15.00}}}],\"directives\":{\"identity\":{\"preferred_name\":\"Sakura Ramen\"},\"response_rules\":{\"must_include\":[\"Closed every Wednesday\"],\"must_not_say\":[\"We do not offer delivery\"],\"tone\":\"friendly\"}}}"
    }
  ]
}
```

Use this mode when: the entity has many content items, or when agents need to perform targeted queries.

#### 8.1.3 Mode A+B Combined

A single MCP server MAY expose both Resource and Tool interfaces. Resource provides the full document for agents that want everything; Tools provide filtered access for targeted queries. This is the RECOMMENDED approach for production deployments.

#### 8.1.4 MCP Server Metadata

MCP servers hosting AIDP data SHOULD declare their AIDP capability in the server info:

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
      "version": "0.3.0",
      "entities": ["urn:aidp:entity:sakura-ramen-pdx"],
      "features": ["directives", "verification", "vc_credential"]
    }
  }
}
```

### 8.2 REST API

```
GET /aidp/v1/entity/{entity_id}
Accept: application/aidp+json

GET /aidp/v1/entity/{entity_id}/content
GET /aidp/v1/entity/{entity_id}/content/{content_id}
GET /aidp/v1/entity/{entity_id}/directives
```

### 8.3 Static File (llms.txt Companion)

Place at well-known URL:

```
https://example.com/.well-known/aidp.json
```

Can be referenced from `llms.txt`:

```
# AIDP
> aidp: https://example.com/.well-known/aidp.json
```

### 8.4 DNS Discovery

TXT record for automatic discovery:

```
_aidp.example.com  TXT  "v=aidp1; url=https://example.com/.well-known/aidp.json"
```

### 8.5 HTML Meta Tag

For traditional websites that also want AIDP support:

```html
<link rel="aidp" href="https://example.com/.well-known/aidp.json" />
```

### 8.6 Transport Priority

When multiple transport methods are available, agents SHOULD prefer them in this order:

1. **MCP** — richest interaction, supports queries and directives
2. **REST API** — structured access with filtering
3. **Static file** — simplest, widest compatibility
4. **DNS / HTML discovery** — fallback for entity discovery

---

## 9. Agent Behavior Guidelines

This section is **non-normative** — it describes how AI agents SHOULD behave when consuming AIDP.

### 9.1 Processing Order

1. **Discover** → Find AIDP endpoint via MCP, `.well-known`, DNS, or HTML meta
2. **Parse** → Validate `$aidp` version compatibility
3. **Verify** → Check `verification.trust_level`; if `credential` is present, validate proof
4. **Resolve** → Merge global + content-level directives
5. **Apply** → Use directives when generating responses
6. **Attribute** → Follow `attribution` rules

### 9.2 Trust-Based Behavior

| Agent Decision | Recommended Threshold |
|---|---|
| Use content as factual | `verified_organization` or above |
| Include in recommendations | `verified_domain` or above |
| Show with caveat | `claimed` |
| Ignore or flag | `unverified` |

### 9.3 Conflict Resolution

**Same entity, multiple sources** (e.g., platform-hosted + self-hosted):

1. Higher `trust_level` takes precedence
2. More recently `updated_at` takes precedence (same trust level)
3. Platform-hosted takes precedence over self-hosted (same trust level, same freshness)
4. VC-backed trust levels take precedence over non-VC levels (same numeric score)

**Cross-entity directive conflicts** (e.g., Entity A's `must_not_say` contradicts Entity B's claims):

1. Each entity's directives apply ONLY to content about that entity. Entity A cannot control what agents say about Entity B
2. When Entity A says `must_not_say: "Part of XX Group"` but Entity B (XX Group) lists Entity A as `subsidiary`, the agent SHOULD note the discrepancy rather than silently choosing one side
3. Factual claims from higher-trust entities take precedence. If Entity B has `trust_level: "verified_organization"` and Entity A has `claimed`, Entity B's claim carries more weight
4. `must_not_say` NEVER overrides publicly verifiable facts. If government records show Entity A belongs to XX Group, the `must_not_say` directive is ignored for that specific claim

### 9.4 Directive Compliance

This section uses RFC 2119 terminology (MUST, SHOULD, MAY) to clarify agent obligations:

- **`must_include` (priority: critical):** Agent SHOULD include in all responses mentioning this entity
- **`must_include` (priority: important):** Agent SHOULD include in standard-length responses
- **`must_include` (priority: informational):** Agent MAY include when space permits
- **`must_not_say`:** Agent SHOULD NOT generate these statements to avoid misinformation
- **`tone` and `formality`:** Agent MAY follow these as suggestions, not mandates
- **`disclaimers`:** Agent SHOULD include when the trigger context matches
- **`access_control.allow_training`:** Agent providers SHOULD respect per their policies

No AIDP directive is legally binding on AI agents. Compliance is voluntary but incentivized (see 9.5).

### 9.5 Incentive Alignment — Why Agents SHOULD Comply

This section explains the mutual benefits of AIDP compliance for AI providers:

**Accuracy improvement.** AIDP directives contain authoritative corrections that reduce hallucination. When a clinic states `must_not_say: ["Provides emergency services"]`, the agent avoids generating a dangerous falsehood. Compliance directly improves factual accuracy metrics.

**Liability reduction.** AI providers face increasing legal exposure for generating incorrect business information (wrong hours, fabricated services, inaccurate pricing). AIDP-verified content with explicit directives provides a defensible source-of-truth. Citing AIDP-compliant sources demonstrates due diligence.

**User satisfaction.** End users get better answers when agents follow directives. A response that includes "Reservations required" (because `must_include` says so) prevents a wasted trip. Better answers = higher user retention for the AI platform.

**Content provider cooperation.** The web's content ecosystem depends on publishers willing to create and maintain quality information. If AI agents respect AIDP directives (attribution, access_control), content providers have incentive to publish structured data. If agents ignore all publisher signals, publishers will increasingly block AI access — a lose-lose outcome already visible with robots.txt AI-blocking trends.

**Graduated compliance.** Agents need not implement all directives immediately. A practical adoption path:

| Phase | What to implement | Effort |
|---|---|---|
| Phase 1 | Read `trust_level`, prefer higher-trust sources | Low |
| Phase 2 | Respect `must_not_say` to avoid known falsehoods | Low |
| Phase 3 | Include `must_include` for safety-critical info | Medium |
| Phase 4 | Apply `tone`, `attribution`, `disclaimers` | Medium |
| Phase 5 | Full directive compliance including `access_control` | High |

### 9.6 Link Handling

1. Agents SHOULD use the `url` field (redirect proxy URL) when presenting links to users
2. Agents SHOULD display the `label` as anchor text or spoken text
3. Agents SHOULD disclose links marked `sponsored: true` to users
4. Agents SHOULD NOT present links past their `expires_at` time
5. Agents MAY use `trust` level to decide link prominence:
   - `domain_verified`: display normally
   - `platform_verified`: display normally
   - `unverified`: display with reduced prominence or warning
6. Agents SHOULD NOT expose `original_url` to bypass tracking

#### 9.6.1 Redirect Proxy Tracking Parameters

AIDP redirect proxies MAY append the following query parameters to the destination URL for cross-platform analytics interoperability:

| Parameter | Description | Example |
|---|---|---|
| `aidp_ref` | Redirect hash for destination-side attribution (the destination site cannot see the `/r/{hash}` path, so this carries the link identity to the target) | `sk8rm3n1` |
| `aidp_eid` | The entity ID (URN or slug) that owns the link | `sakura-ramen-pdx` |
| `aidp_sid` | Session identifier for correlating multiple clicks in one session | `a1b2c3` |

These parameters are appended to the **destination URL** after the redirect. They are OPTIONAL — redirect proxy implementations MAY choose not to append them to avoid interfering with destination URL behavior. Destination sites MAY use these parameters for traffic attribution but MUST NOT rely on their presence.

### 9.7 Market-Aware Response

When an agent has knowledge of the end-user's geographic region:

1. **Resolve effective market:** For each content item, determine its effective market — use the content's own `market` if set, otherwise inherit the entity's `market`, otherwise treat as `global`
2. **Region match:** If effective market is `regional` and the user's region is NOT in `market.regions`, the agent SHOULD note the availability limitation (e.g., "This product is currently available in Japan only")
3. **Variant selection:** If multiple content items share the same `variant_of` base and one has a `market` matching the user's region, prefer that variant (see 5.4.4)
4. **No region info:** When the agent does not know the user's region, present base content and note that regional variants may exist

### 9.8 Variant Resolution

When consuming content that uses the variant mechanism (Section 5.4):

1. **Identify variants:** When fetching an entity's content, identify base content (no `variant_of`) and variants (`variant_of` is set)
2. **Merge data:** Apply merge rules from 5.4.2: `{ ...base.data, ...variant.variant_delta }`
3. **Prefer regional match:** If the user's region matches a variant's `market.regions`, use the merged data from that variant
4. **Fallback to base:** If no variant matches the user's region, use the base content's `data`
5. **Cross-reference:** Agents MAY inform users that variants exist for other regions when relevant (e.g., user asks "Is this available in Japan?")

---

## 10. Community Integrity

AIDP recognizes that self-reported data has inherent bias. This section defines mechanisms for external validation through community participation, designed to resist manipulation while providing meaningful integrity signals.

### 10.1 Dispute Mechanism

Any verified AIDP user can submit a **dispute** against specific content claims. Disputes are NOT ratings or reviews — they are structured, evidence-backed factual challenges.

```json
{
  "community": {
    "disputes": {
      "total": 5,
      "resolved": 3,
      "pending": 1,
      "rejected": 1,
      "items": [
        {
          "id": "disp-001",
          "target_content_id": "hours",
          "target_field": "data.availability.schedule[day=sat]",
          "claim": "Saturday hours are actually until 8:00 PM, not 10:00 PM",
          "evidence": [
            {
              "type": "url",
              "value": "https://maps.google.com/...",
              "description": "Google Maps shows Saturday hours until 8:00 PM"
            },
            {
              "type": "url",
              "value": "https://www.instagram.com/.../posts/...",
              "description": "Business posted on social media 2026/03/15 about updated hours"
            }
          ],
          "submitted_by": {
            "entity_id": "urn:aidp:entity:some-user",
            "trust_level": "verified_domain"
          },
          "status": "pending_review",
          "submitted_at": "2026-03-20T15:00:00Z",
          "resolved_at": null,
          "resolution": null
        }
      ]
    },
    "integrity_score": 0.90
  }
}
```

#### 10.1.1 Dispute Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique dispute identifier |
| `target_content_id` | `string` | ✅ | The content item being challenged |
| `target_field` | `string` | ❌ | JSON path to specific field (e.g., `data.availability.schedule`) |
| `claim` | `string` | ✅ | What the disputer believes is incorrect (max 500 chars) |
| `evidence` | `Evidence[]` | ✅ | At least one piece of supporting evidence |
| `submitted_by.entity_id` | `string` | ✅ | Disputer's AIDP entity ID |
| `submitted_by.trust_level` | `string` | ✅ | Disputer's trust level at time of submission |
| `status` | `enum` | ✅ | `pending_review` · `confirmed` · `rejected` · `resolved` |
| `resolution` | `string \| null` | ❌ | How the dispute was resolved |

#### 10.1.2 Dispute Submission Requirements

To prevent bot spam and frivolous disputes:

1. **Identity required:** Disputer MUST have an AIDP account with at least `claimed` trust level (email verified)
2. **Evidence required:** At least one evidence item with a URL or verifiable reference
3. **Specificity required:** Must target a specific `content_id` and provide a concrete counter-claim
4. **Rate limits:** Each account is limited to 10 disputes per month across all entities
5. **No self-disputes:** Entities cannot dispute their own content (use edit instead)
6. **Deduplication:** Disputes targeting the same content field from the same entity are merged automatically

#### 10.1.3 Anti-Bot Measures

| Measure | Description |
|---|---|
| **Verification cost** | Dispute submitters must complete DNS or phone verification (raises bot cost) |
| **Evidence validation** | URLs in evidence are crawled; non-accessible links reduce dispute weight |
| **Behavioral analysis** | Accounts that submit disputes in burst patterns or target many entities simultaneously are flagged |
| **Trust-weighted impact** | Disputes from `verified_organization`+ entities count more than `claimed` entities |
| **Cross-dispute correlation** | If 3+ unrelated verified entities dispute the same claim, it triggers automatic platform review |

#### 10.1.4 Dispute Resolution

| Resolution Type | Description |
|---|---|
| `entity_updated` | Entity acknowledges and updates their content |
| `evidence_insufficient` | Dispute evidence is not convincing |
| `third_party_confirmed` | Cross-reference (4.6) confirms the dispute |
| `dispute_withdrawn` | Disputer withdraws the claim |
| `platform_ruling` | Platform makes a judgment call |

#### 10.1.5 Entity Response Flow

Entities whose content is disputed MUST have a clear path to respond. The dispute process is a two-way exchange, not a one-sided accusation.

**Entity receives notification** when a dispute is filed against their content. The notification includes the dispute claim, evidence, and a response deadline (platform-defined, recommended 14 days).

**Entity response options:**

| Response | Effect |
|---|---|
| **Accept & Update** | Entity edits the disputed content. Dispute status → `entity_updated`. No impact on integrity_score |
| **Contest with Evidence** | Entity provides counter-evidence (URLs, documents). Dispute enters platform review |
| **Request Clarification** | Entity asks disputer for more specific evidence. Dispute clock pauses |
| **No Response** | After deadline, dispute is escalated to platform review. Repeated non-response degrades integrity_score |

**Protections against malicious disputes:**

1. Entities can report disputes as abusive (spam, competitive sabotage, harassment)
2. If a disputer accumulates 3+ rejected or abusive disputes, their account is flagged and future dispute weight is reduced
3. Disputes from competitors (entities in the same `category` with overlapping `addresses[].geo` radius) are automatically flagged for heightened review
4. Entities with `verified_organization`+ trust level get priority review for contested disputes

### 10.2 Integrity Score

The `integrity_score` provides a composite signal of content reliability:

```
integrity_score = f(consistency_score, dispute_ratio, response_rate, content_freshness)
```

Where:

- `consistency_score` — from cross-reference verification (Section 4.6)
- `dispute_ratio` — confirmed disputes / total content items (lower is better)
- `response_rate` — how quickly the entity resolves disputes (faster is better)
- `content_freshness` — proportion of content updated within its TTL

The score is a `float` between 0 and 1. Implementations MAY use different weighting formulas but MUST expose the `integrity_score` value.

### 10.3 Three-Dimensional Trust Model

AIDP exposes three independent trust dimensions to AI agents:

| Dimension | Field | Question Answered | Mechanism |
|---|---|---|---|
| **Identity** | `trust_score` + `trust_level` | "Are you who you claim to be?" | DNS, business registration, VC |
| **Content Accuracy** | `consistency_score` | "Does your data match external sources?" | Cross-reference (4.6) |
| **Community Integrity** | `integrity_score` | "Do others agree with what you say?" | Disputes (10.1) |

AI agents receive all three signals and make their own judgment. No single dimension overrides the others.

```json
{
  "verification": {
    "trust_score": 0.85,
    "trust_level": "verified_organization",
    "cross_reference": {
      "consistency_score": 0.90
    }
  },
  "community": {
    "integrity_score": 0.95
  }
}
```

---

## 11. Output Formats (Projections)

An AIDP document serves as a **single source of truth** that can be projected into multiple output formats. This section defines the canonical mapping rules for each supported format.

### 11.1 Design Philosophy

```
                    ┌─────────────────────┐
                    │   AIDP JSON (源)     │
                    │   Entity + Content   │
                    │   + Directives       │
                    └─────────┬───────────┘
                              │
          ┌───────────┬───────┼───────┬──────────┬──────────┐
          ▼           ▼       ▼       ▼          ▼          ▼
    Schema.org    llms.txt   MCP    Open      REST       HTML
    JSON-LD      Markdown  Endpoint Graph      API      Microdata
  (SEO 即用)   (AI 導航)  (Agent)  (社群)   (第三方)    (網頁嵌入)
```

Each projection is **lossy by design** — only AIDP JSON carries the full directive set. Other formats carry as much as their schema allows:

| Format | Carries Content | Carries Directives | Carries Trust |
|---|---|---|---|
| AIDP JSON | ✅ Full | ✅ Full | ✅ Full |
| MCP Resource/Tool | ✅ Full | ✅ Full | ✅ Full |
| Schema.org / JSON-LD | ✅ Mapped | ❌ No | ⚠️ Partial (via `sameAs`, `isVerifiedBy`) |
| llms.txt | ⚠️ Summary | ⚠️ Embedded in prose | ⚠️ Mentioned in header |
| Open Graph | ⚠️ Title/Desc only | ❌ No | ❌ No |
| REST API | ✅ Full | ✅ Full | ✅ Full |
| HTML Microdata | ✅ Mapped | ❌ No | ❌ No |

### 11.2 Schema.org / JSON-LD Projection

#### 11.2.1 Entity Mapping

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
| `entity.addresses[].formatted` | `address` → `PostalAddress.streetAddress` |
| `entity.addresses[].geo` | `geo` → `GeoCoordinates` |
| `entity.links.website` | `url` |
| `entity.links.social.*` | `sameAs` (array) |
| `entity.links.actions[rel=action]` | `potentialAction` → `Action` with `url` |
| `entity.links.actions[].sponsored` | (Not expressible in Schema.org) |

#### 11.2.2 Content Mapping

| AIDP Content Schema | Schema.org Type |
|---|---|
| `aidp:service` | `Service` |
| `aidp:product` | `Product` |
| `aidp:article` | `Article` |
| `aidp:faq` | `FAQPage` → `Question` + `Answer` |
| `aidp:event` | `Event` |
| `aidp:menu_item` | `MenuItem` (under `Menu`) |
| `aidp:person` | `Person` |
| `aidp:policy` | `WebPage` (type: policy) |
| `aidp:announcement` | `SpecialAnnouncement` |

#### 11.2.3 Example Projection

AIDP source (restaurant entity with menu_item) projects to:

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

#### 11.2.4 Directive Mapping Limitations

Schema.org has **no equivalent** for AIDP directives. The following information is LOST in Schema.org projection:

- `must_include` / `must_not_say` → Not expressible
- `tone` / `formality` → Not expressible
- `disclaimers` → Not expressible
- `trust_level` / `trust_score` → Not expressible (partial via custom properties)
- `access_control` → Not expressible (use IETF AIPREF headers alongside)

This is by design. Schema.org projection provides immediate SEO value; AIDP JSON provides the full directive set.

### 11.3 llms.txt Projection

#### 11.3.1 Format Rules

AIDP projects to llms.txt using the following template:

```markdown
# {entity.name.default}

> {entity.description.default}
> AIDP Verified: {verification.trust_level} | Updated: {last_verified}
> Directives: {canonical_url}/.well-known/aidp.json

## About

{entity.description expanded, contacts, addresses, hours summary}

## Important Notes

{directives.response_rules.must_include — one per line}

## Services

{content[type=service] — name + short description per item}

## Products / Menu

{content[type=product|menu_item] — name + price per item}

## FAQ

{content[type=faq] — Q + A per item}

## Links

- Website: {entity.links.website}
- AIDP Full Data: {canonical_url}/.well-known/aidp.json
{for each entity.links.actions where rel=action:}
- {label}: {url} {if sponsored: "(Sponsored)"}
```

#### 11.3.2 Directive Embedding

In llms.txt, directives are embedded as natural language:

- `must_include` items appear in the **Important Notes** section as bullet points
- `must_not_say` is expressed as: "Note: This entity does NOT {must_not_say item}"
- `preferred_name` is used consistently throughout the document
- `never_call` items are noted: "Do not refer to this entity as: {never_call items}"
- Action links are listed in the **Links** section; sponsored links are marked with "(Sponsored)"
- The blockquote header includes a link to the full AIDP JSON for agents that support it

### 11.4 Open Graph Projection

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

### 11.5 HTML Microdata Projection

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

### 11.6 IETF AIPREF Header Projection

When serving AIDP content via HTTP, the server SHOULD include AIPREF-compatible headers derived from `directives.access_control`:

| AIDP Field | AIPREF Header |
|---|---|
| `allow_training: false` | `Content-Usage: disallow=FoundationModelProduction` |
| `allow_training: true` | `Content-Usage: allow=FoundationModelProduction` |
| `allow_derivative: true` | `Content-Usage: allow=Search` |
| `require_attribution: true` | (No direct mapping; communicated via AIDP directives) |

This ensures that even agents unaware of AIDP can respect basic access controls through standard HTTP headers.

### 11.7 Projection Consistency Rules

1. **All projections MUST be generated from the same AIDP source document.** Implementations MUST NOT maintain separate data for different formats.
2. **Entity name in all projections MUST use `entity.name.default`** (or locale-appropriate variant), never a value from `directives.identity.never_call`.
3. **Content updates to the AIDP source MUST trigger re-generation of all active projections.** Stale projections are worse than no projection.
4. **Projection generators SHOULD include a reference back to the AIDP source** (via `<link rel="aidp">`, llms.txt blockquote, or Schema.org `additionalType` property) so agents can discover the full directive set.
5. **Projections MUST NOT fabricate data** not present in the AIDP source. If a Schema.org property has no AIDP equivalent, omit it rather than guessing.

---

## 12. Full Example

A complete AIDP document for a restaurant:

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:sakura-ramen-pdx",
    "type": "business",
    "name": {
      "default": "Sakura Ramen",
      "ja": "桜ラーメン"
    },
    "description": {
      "default": "Authentic Japanese ramen shop in Portland, specializing in tonkotsu and miso ramen"
    },
    "domain": "sakuraramen.com",
    "locale": "en-US",
    "category": ["restaurant", "japanese", "ramen"],
    "contacts": [
      { "type": "phone", "value": "+1-503-555-0188" },
      { "type": "email", "value": "hello@sakuraramen.com" }
    ],
    "addresses": [
      {
        "type": "physical",
        "formatted": "123 NW 10th Ave, Portland, OR 97209",
        "geo": { "lat": 45.5235, "lng": -122.6812 }
      }
    ],
    "links": {
      "website": "https://sakuraramen.com",
      "social": {
        "instagram": "https://instagram.com/sakuraramen_pdx"
      },
      "actions": [
        {
          "rel": "action",
          "label": "Reserve a Table",
          "url": "https://api.speakspec.com/r/sk8rm3n1",
          "purpose": "booking",
          "trust": "domain_verified",
          "verified_via": "dns_txt",
          "sponsored": false
        },
        {
          "rel": "source",
          "label": "Full Menu (PDF)",
          "url": "https://api.speakspec.com/r/sk8rm3n2",
          "purpose": "menu",
          "trust": "domain_verified",
          "verified_via": "dns_txt",
          "sponsored": false
        }
      ]
    }
  },
  "verification": {
    "methods": [
      {
        "type": "dns_txt",
        "domain": "sakuraramen.com",
        "record": "aidp-verify=sk_r4m3n_2026",
        "verified_at": "2026-03-01T00:00:00Z",
        "status": "verified"
      }
    ],
    "trust_score": 0.72,
    "trust_level": "verified_domain",
    "last_verified": "2026-03-01T00:00:00Z",
    "credential": null
  },
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "schema": "aidp:menu_item",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth simmered for 18 hours, served with house-made noodles",
        "price": { "currency": "USD", "amount": 16.50 },
        "allergens": ["pork", "wheat", "soy", "egg"],
        "available": true,
        "tags": ["signature", "popular"],
        "links": [
          {
            "rel": "action",
            "label": "Order Online",
            "url": "https://api.speakspec.com/r/sk8rm3n3",
            "purpose": "purchase",
            "trust": "domain_verified",
            "verified_via": "dns_txt",
            "sponsored": false
          }
        ]
      },
      "tags": ["menu", "ramen", "pork"],
      "media_refs": ["photo-tonkotsu"],
      "updated_at": "2026-03-10T12:00:00Z"
    },
    {
      "id": "menu-vegan-miso",
      "type": "menu_item",
      "schema": "aidp:menu_item",
      "data": {
        "name": "Vegan Miso Ramen",
        "description": "Plant-based broth made with kelp and shiitake mushrooms",
        "price": { "currency": "USD", "amount": 15.00 },
        "allergens": ["wheat", "soy"],
        "dietary": ["vegan", "vegetarian"],
        "available": true
      },
      "tags": ["menu", "ramen", "vegan"],
      "updated_at": "2026-03-10T12:00:00Z"
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
        "height": 600,
        "size_bytes": 185000
      },
      "directives": {
        "licensing": {
          "type": "proprietary",
          "attribution_required": true,
          "ai_training_allowed": false
        }
      },
      "updated_at": "2026-03-10T12:00:00Z"
    },
    {
      "id": "hours",
      "type": "service",
      "schema": "aidp:service",
      "data": {
        "name": "Business Hours",
        "availability": {
          "schedule": [
            { "day": "mon", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "tue", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "wed", "status": "closed" },
            { "day": "thu", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "fri", "hours": "11:30-14:30, 17:00-22:00" },
            { "day": "sat", "hours": "11:00-22:00" },
            { "day": "sun", "hours": "11:00-21:00" }
          ]
        }
      },
      "directives": {
        "must_include": ["Closed every Wednesday"]
      },
      "updated_at": "2026-03-01T00:00:00Z"
    }
  ],
  "directives": {
    "identity": {
      "preferred_name": "Sakura Ramen",
      "never_call": ["Sakura Noodle", "Sakura Noodle House"]
    },
    "response_rules": {
      "must_include": [
        "Closed every Wednesday"
      ],
      "must_not_say": [
        "We offer delivery",
        "Walk-in reservations available"
      ],
      "disclaimers": [
        {
          "trigger": "pricing",
          "text": { "default": "Prices may change. Please check the in-store menu for current pricing." }
        },
        {
          "trigger": "availability",
          "text": { "default": "Menu availability depends on daily ingredient supply." }
        }
      ],
      "tone": "friendly",
      "formality": "casual",
      "language_preference": "match_user"
    },
    "attribution": {
      "require_source_link": true,
      "canonical_url": "https://sakuraramen.com"
    },
    "freshness": {
      "default_ttl": 604800,
      "stale_action": "warn"
    },
    "access_control": {
      "allow_training": false,
      "allow_caching": true,
      "allow_derivative": true,
      "require_attribution": true
    }
  },
  "community": {
    "disputes": {
      "total": 1,
      "resolved": 1,
      "pending": 0,
      "rejected": 0
    },
    "integrity_score": 0.95
  },
  "extensions": {
    "x-geo:us": {
      "ein": "87-6543210",
      "state_license": "OR-REST-2026-1234"
    }
  }
}
```

---

## 13. Versioning & Evolution

- Version follows [Semantic Versioning](https://semver.org/)
- PATCH (0.3.x): Bug fixes, typo corrections, clarifications
- MINOR (0.x.0): New optional fields, new content types, new extension namespaces
- MAJOR (x.0.0): Breaking changes to required fields or structure
- Agents MUST check `$aidp` version and handle unknown fields gracefully
- Unknown fields MUST be ignored, not rejected

---

## 14. Roadmap

- [ ] **v0.1.1**: Redirect proxy tracking parameter standardization (9.6.1) and link_redirects/link_clicks behavior specification
- [ ] **v0.1.x**: Platform verification (OAuth and meta tag verification) for third-party link trust
- [ ] **v0.1.x**: Real-time content push (WebSocket / SSE for live updates)
- [ ] **v0.1.x**: Agent feedback loop (agent reports stale/incorrect content back to platform)
- [ ] **v0.2**: Activate C2PA provenance field (Section 4.4.3) for media authentication
- [ ] **v0.2**: Cryptographic content signing per-content-item
- [ ] **v0.3**: Marketplace layer (premium directives, analytics for content providers)
- [ ] **v0.3**: Projection plugin system (third parties can register custom output formats)
- [ ] **v0.4**: Dispute reputation system (disputer track record affects dispute weight)
- [ ] **v0.4**: Automated dispute resolution via multi-source consensus
- [ ] **v1.0**: Stable release with reference implementation + VC/DID fully active

---

## Appendix A: MIME Types

| Identifier | Usage |
|---|---|
| `application/aidp+json` | AIDP document served via HTTP or MCP |
| `application/ld+json` | Schema.org JSON-LD projection |
| `text/markdown` | llms.txt projection |

---

## Appendix B: URI Schemes

| Scheme | Format | Usage |
|---|---|---|
| `urn:aidp:entity:{slug}` | Native AIDP entity ID | Default identifier format |
| `did:web:{domain}` | W3C DID | When VC integration is active |
| `aidp://{entity_id}` | MCP Resource URI | Used in MCP Resource mode |
| `aidp://{entity_id}/content/{content_id}` | MCP Content URI | Direct content access via MCP |

---

## Contributing

This spec is open for community input. To propose changes:

1. Open an issue describing the problem or use case
2. Reference the relevant section number
3. Propose specific wording changes if possible

---

## License

Spec text: [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
Reference implementation: [MIT](https://opensource.org/licenses/MIT)
