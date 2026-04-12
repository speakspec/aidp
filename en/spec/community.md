# Community Integrity

AIDP recognizes the inherent bias in self-reported data. This section defines mechanisms for external validation through community participation, designed to resist manipulation while providing meaningful integrity signals.

## Dispute Mechanism

Any verified AIDP user can submit a **dispute** against a specific content claim. Disputes are not ratings or reviews -- they are structured, evidence-backed factual challenges.

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

### Dispute Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique dispute identifier |
| `target_content_id` | `string` | Yes | The content item being challenged |
| `target_field` | `string` | No | JSON path pointing to a specific field (e.g., `data.availability.schedule`) |
| `claim` | `string` | Yes | What the disputant believes is incorrect (max 500 characters) |
| `evidence` | `Evidence[]` | Yes | At least one piece of supporting evidence |
| `submitted_by.entity_id` | `string` | Yes | The disputant's AIDP entity ID |
| `submitted_by.trust_level` | `string` | Yes | The disputant's trust level at time of submission |
| `status` | `enum` | Yes | `pending_review` / `confirmed` / `rejected` / `resolved` |
| `resolution` | `string \| null` | No | How the dispute was resolved |

### Dispute Submission Requirements

To prevent bot spam and frivolous disputes:

1. **Identity required:** Disputants must have an AIDP account with at least `claimed` trust level (verified email)
2. **Evidence required:** At least one evidence item containing a URL or verifiable reference
3. **Specificity required:** Must target a specific `content_id` and provide a concrete counter-claim
4. **Rate limiting:** Each account has a reasonable limit on dispute submissions
5. **No self-disputes:** Entities cannot file disputes against their own content (use the edit function instead)
6. **Deduplication:** Disputes from the same entity targeting the same content field are automatically merged

### Anti-Abuse Measures

The platform employs multi-layered defenses to prevent abuse of the dispute system, including:

- **Verification cost** -- Dispute submitters must complete identity verification
- **Evidence validation** -- URLs in evidence are validated for validity
- **Behavioral analysis** -- Anomalous submission patterns are detected and flagged
- **Trust weighting** -- Disputes from higher trust-level entities carry more weight
- **Cross-dispute correlation** -- When multiple independent sources dispute the same claim, platform review is triggered

### Dispute Resolution

| Resolution Type | Description |
|---|---|
| `entity_updated` | Entity acknowledged and updated its content |
| `evidence_insufficient` | Dispute evidence was not convincing |
| `third_party_confirmed` | Cross-referencing ([Verification](/spec/verification) 4.6) confirmed the dispute |
| `dispute_withdrawn` | Disputant withdrew the claim |
| `platform_ruling` | Platform made a ruling |

### Entity Response Process

Entities whose content is disputed must have a clear response pathway. The dispute process is a two-way exchange, not a one-sided accusation.

**Entity receives notification:** Entities are notified when their content is disputed. The notification includes the dispute claim, evidence, and response deadline.

**Entity response options:**

| Response | Effect |
|---|---|
| **Accept and update** | Entity edits the disputed content. Dispute status becomes `entity_updated`. No impact on integrity_score |
| **Rebut with evidence** | Entity provides counter-evidence (URLs, documents). Dispute enters platform review |
| **Request clarification** | Entity asks the disputant for more specific evidence. Dispute clock is paused |
| **No response** | After the deadline, the dispute escalates to platform review. Repeated non-responses lower integrity_score |

**Protections against malicious disputes:**

1. Entities can report disputes as abusive (spam, competitive sabotage, harassment)
2. Disputants with accumulated rejected or abusive disputes will have reduced weight on future disputes
3. Disputes with potential conflicts of interest are automatically flagged for enhanced review
4. Higher trust-level entities receive priority review when disputed

## Integrity Score

`integrity_score` provides a composite signal of content reliability:

```
integrity_score = f(consistency_score, dispute_ratio, response_rate, content_freshness)
```

Where:

- `consistency_score` -- From cross-reference verification ([Verification](/spec/verification) Section 4.6)
- `dispute_ratio` -- Confirmed disputes / total content items (lower is better)
- `response_rate` -- How quickly the entity resolves disputes (faster is better)
- `content_freshness` -- Proportion of content updated within TTL

The score is a `float` between 0 and 1. Implementors may use different weighting formulas but must expose the `integrity_score` value.

## Three-Dimensional Trust Model

AIDP exposes three independent trust dimensions to AI agents:

| Dimension | Field | Question Answered | Mechanism |
|---|---|---|---|
| **Identity** | `trust_score` + `trust_level` | "Are you who you claim to be?" | DNS, business registration, VC |
| **Content Accuracy** | `consistency_score` | "Does your data match external sources?" | Cross-referencing (4.6) |
| **Community Integrity** | `integrity_score` | "Do others agree with what you say?" | Disputes (10.1) |

AI agents receive all three signals and make their own judgment. No single dimension can override the others.

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
