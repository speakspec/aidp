# Verification

Defines **how an Entity's identity is verified** and produces a computed trust level.

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

## Verification Methods

| `type` | Description | Trust Weight |
|---|---|---|
| `dns_txt` | Set a TXT record on the domain pointing to the AIDP Entity ID | High |
| `dns_cname` | CNAME subdomain delegation (e.g., `_aidp.example.com`) | High |
| `meta_tag` | `<meta name="aidp-verify">` in the website HTML | Medium |
| `business_registration` | Government-issued business registration number verified | High |
| `domain_whois` | Domain WHOIS information matches Entity information | Medium |
| `email_domain` | Verified email on a matching domain | Low |
| `social_verification` | Linked social accounts match the identity | Low |
| `manual_review` | Manual verification by platform staff | High |
| `third_party` | External verification provider (extensible) | Varies |
| `verifiable_credential` | W3C Verifiable Credential provided (see 4.4) | High |

## Trust Levels (Computed Values)

Trust levels are **derived by the platform**, not self-claimed. Enum values are listed in order:

| Level | Typical Entity |
|---|---|
| `sovereign` | Government agencies, .gov domains |
| `institutional` | Universities, research institutions, medical associations |
| `verified_organization` | Businesses with DNS verification and business registration |
| `verified_domain` | DNS-verified but no business registration |
| `claimed` | Account created, email verified, no DNS |
| `unverified` | Anonymous or newly registered |

## Trust Score Calculation

`trust_score` is a `float` between 0 and 1. Platforms calculate the score based on the weighted accumulation of verification methods and map it to the trust levels above.

The specific weighting algorithm and thresholds are determined by each platform's implementation. The AIDP protocol **intentionally does not prescribe strict rules** -- different platforms may use different weighting strategies, but they must expose the resulting `trust_level` enum value so that Agents have a standardized signal to work with.

## Verifiable Credential Integration (Optional, Forward-Looking)

AIDP is designed to integrate with the **W3C Verifiable Credentials 2.0** ecosystem. This section defines the bridge between AIDP native verification and VC/DID infrastructure.

### Entity ID as DID

The `entity.id` field can use a W3C Decentralized Identifier instead of the default URN format:

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
| `did:web` | Entities with verified domains | Resolved via HTTPS, bound to existing domain |
| `did:key` | Lightweight / self-issued | No external resolution required |
| `did:wba` | Agent Network Protocol compatible | For interoperability with the ANP ecosystem |

When `entity.id` is a DID, Agents can resolve the DID Document to obtain public keys for signature verification.

Resolvers must accept both `urn:aidp:*` and `did:*` formats. If a resolver does not support DID resolution, it must treat the DID as an opaque identifier.

### Credential Field

The `verification.credential` field carries a W3C Verifiable Credential that cryptographically proves the Entity's verified identity:

```json
{
  "verification": {
    "methods": [ "..." ],
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
| `credential` | `VerifiableCredential \| null` | No | W3C VC 2.0 proving the Entity's identity |

**Behavioral Rules:**

1. `credential` is optional in v0.1. When absent or `null`, Agents fall back to the `trust_level` enum value
2. When present, Agents that support VC verification should verify the `proof` before trusting the `trust_level`
3. If `proof` verification fails, Agents must downgrade `trust_level` to `unverified` regardless of the claimed value
4. `issuer` identifies the AIDP platform that performed verification. Future versions may support multiple issuers
5. The `validUntil` expiration must be respected -- expired credentials are treated as non-existent

### C2PA Content Provenance (Reserved Field)

For [Content](/en/spec/content) items that include media (images, documents), AIDP reserves the `content[].provenance` field for future **C2PA Content Credentials** integration:

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

This is a reserved field and is not yet active in v0.1. Agents must ignore this field until a future version activates the schema.

## Anti-Impersonation Rules

AIDP platforms must implement the following safeguards to prevent Entity impersonation.

### Mandatory Checks

The following checks are **required** for all AIDP platform implementations:

**Domain-Name Binding:** If `entity.domain` is set, `entity.name` must correspond to the domain owner. Platforms must reject registrations that claim the name of a well-known brand (e.g., "Apple", "Google", "Nike") but whose domain does not match the brand's known domain.

**Name Similarity Detection:** At registration, `entity.name` (all locale variants) must be fuzzy-matched against all existing [Entities](/en/spec/entity) with `trust_level` >= `verified_domain`. If similarity exceeds the threshold and the domains do not match, registration must be rejected or escalated to manual review.

**Type Restrictions:** `entity.type` values of `government` and `institutional` must undergo platform manual review. Self-service registration is prohibited for these types.

**Trust Cap:** If an Entity's name matches an existing Entity with `verified_organization` or higher trust level and the domains differ, `trust_level` is **hard-capped** at `unverified` regardless of other verification scores. This cap can only be lifted through platform manual review.

### Identity Binding Record

Platforms should expose impersonation check results in the verification object:

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
| `name_similarity_checked` | `boolean` | Whether fuzzy matching has been performed |
| `similar_entities_found` | `string[]` | IDs of similar existing Entities (empty array = no conflicts) |
| `impersonation_risk` | `enum` | `low`, `medium`, `high`, `blocked` |
| `reviewed_at` | `datetime` | When the last impersonation check was performed |

Agents should treat Entities with `impersonation_risk: "high"` as equivalent to `trust_level: "unverified"`.

## Cross-Reference Verification

Platforms can automatically cross-reference AIDP self-reported data against public third-party sources. This provides a consistency signal independent of identity trust.

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

### Cross-Reference Sources

| Source ID | Data Checked | Region |
|---|---|---|
| `google_maps` | Business hours, address, phone, review sentiment | Global |
| `oregon_sos` | Business registration, company name, status | US - Oregon |
| `fda_food_safety` | Food safety certifications, violation records | US |
| `state_medical_board` | Medical licenses, specialties | US |
| `whois` | Domain registration data | Global |
| `social_profile` | Profile name, bio consistency | Global |

Platforms may add custom sources. Custom source IDs must be prefixed with `x-`.

### Consistency Score

`consistency_score` is a `float` between 0 and 1, independent of `trust_score`:

- `trust_score` answers the question: **"Are you who you claim to be?"** (identity)
- `consistency_score` answers the question: **"Does what you say match what others say?"** (content accuracy)

AI Agents should consider both dimensions when deciding how much to rely on an Entity's [Content](/en/spec/content):

| trust_score | consistency_score | Agent Recommendation |
|---|---|---|
| High | High | Treat as a reliable source |
| High | Low | Identity confirmed but content may be outdated or biased -- display with caveats |
| Low | High | Content appears accurate but identity is unverified -- display with caveats |
| Low | Low | Unreliable -- prefer other sources |

## Platform-Hosted vs. Self-Hosted Trust

AIDP documents can be served from a trusted platform or self-hosted at `/.well-known/aidp.json`. The trust implications differ significantly.

### Platform Field

The `verification.platform` field identifies whether a platform -- and which platform -- performed the verification:

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
| `platform` | `Platform \| null` | No | The platform that hosts and verifies this AIDP document |
| `platform.id` | `string` | Yes | Platform identifier |
| `platform.url` | `string` | Yes | Platform URL (for Agents to verify platform legitimacy) |
| `platform.name` | `string` | No | Human-readable platform name |

### Trust Implications

| Hosting Mode | `platform` Value | Trust Behavior |
|---|---|---|
| **Platform-hosted** | Present and resolvable | Agents can verify trust scores with the platform. All verification fields (trust_score, consistency_score, integrity_score) are platform-endorsed |
| **Self-hosted** | `null` or absent | Agents must treat all verification fields as self-claimed. Effective `trust_level` should be capped at `claimed` or below, unless the Agent independently verifies DNS records |
| **Self-hosted + VC** | `null` but `credential` present with valid proof | Agents can cryptographically verify the credential. Trust levels from the VC are trustworthy even without a platform |

**Key Rule:** When `platform` is `null` and `credential` is absent, Agents must not trust the values of `trust_score`, `trust_level`, `consistency_score`, or `integrity_score` -- they are unverifiable self-claims. The only signal an Agent can independently verify from a self-hosted AIDP is whether DNS records exist.
