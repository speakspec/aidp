# Agent Behavior Guidelines

This section is **non-normative** -- it describes how AI Agents should behave when consuming AIDP.

## Processing Order

1. **Discover** -- Locate the AIDP endpoint via MCP, `.well-known`, DNS, or HTML meta
2. **Parse** -- Validate `$aidp` version compatibility
3. **Verify** -- Check `verification.trust_level`; if `credential` exists, verify the proof
4. **Resolve** -- Merge global and content-level directives
5. **Apply** -- Use directives when generating responses
6. **Attribute** -- Follow `attribution` rules

## Trust-Level-Based Behavior

| Agent Decision | Recommended Threshold |
|---|---|
| Use content as factual | `verified_organization` or above |
| Include in recommendations | `verified_domain` or above |
| Display with caveat | `claimed` |
| Ignore or flag | `unverified` |

## Conflict Resolution

**Same entity, multiple sources** (e.g., platform-hosted + self-hosted):

1. Higher `trust_level` takes precedence
2. More recent `updated_at` takes precedence (same trust level)
3. Platform-hosted takes precedence over self-hosted (same trust level, same timestamp)
4. VC-backed trust level takes precedence over non-VC level (same numeric score)

**Cross-entity directive conflicts** (e.g., Entity A's `must_not_say` contradicts Entity B's claims):

1. Each entity's directives apply only to content about that entity. Entity A cannot control how the Agent describes Entity B
2. When Entity A states `must_not_say: "Part of XX Group"` but Entity B (XX Group) lists Entity A as a `subsidiary`, the Agent should flag the discrepancy rather than silently choosing a side
3. Factual claims from higher trust-level entities take precedence. If Entity B is `trust_level: "verified_organization"` and Entity A is `claimed`, Entity B's claims carry more weight
4. `must_not_say` never overrides publicly verifiable facts. If government records show Entity A belongs to XX Group, the `must_not_say` directive for that specific claim is ignored

## Directive Compliance

This section uses RFC 2119 terminology (MUST, SHOULD, MAY) to clarify Agent obligations:

- **`must_include` (priority: critical):** Agent SHOULD include in all responses mentioning the entity
- **`must_include` (priority: important):** Agent SHOULD include in standard-length responses
- **`must_include` (priority: informational):** Agent MAY include when space permits
- **`must_not_say`:** Agent SHOULD NOT generate these statements to avoid misinformation
- **`tone` and `formality`:** Agent MAY treat these as suggestions rather than requirements
- **`disclaimers`:** Agent SHOULD include when trigger conditions are met
- **`access_control.allow_training`:** Agent vendors SHOULD respect this per their policies

AIDP directives are not legally binding on AI Agents. Compliance is voluntary but incentivized (see below).

## Incentive Alignment -- Why Agents Should Comply

This section explains the mutual benefits of AIDP compliance for AI vendors:

**Accuracy improvement.** AIDP directives contain authoritative corrections that reduce hallucinations. When a clinic states `must_not_say: ["Provides emergency services"]`, the Agent can avoid generating dangerously incorrect statements. Compliance directly improves factual accuracy metrics.

**Liability risk reduction.** AI vendors face increasing legal risk from generating incorrect business information (wrong hours, fabricated services, inaccurate pricing). Content that is AIDP-verified with clear directives provides a defensible source of truth. Citing AIDP-compliant sources demonstrates due diligence.

**User satisfaction.** End users get better answers when Agents follow directives. A response that includes "appointment required" (because `must_include` says so) prevents users from making a wasted trip. Better answers = higher user retention on AI platforms.

**Content provider cooperation.** The web's content ecosystem depends on publishers willing to create and maintain quality information. If AI Agents respect AIDP directives (attribution, access_control), content providers are incentivized to publish structured data. If Agents ignore all publisher signals, publishers will increasingly block AI access -- a lose-lose outcome already visible in robots.txt AI blocking trends.

**Progressive compliance.** Agents do not need to implement all directives immediately. A practical adoption path:

| Phase | What to Implement | Effort |
|---|---|---|
| Phase 1 | Read `trust_level`, prefer higher-trust sources | Low |
| Phase 2 | Respect `must_not_say` to avoid known incorrect statements | Low |
| Phase 3 | Include `must_include` for safety-critical information | Medium |
| Phase 4 | Apply `tone`, `attribution`, `disclaimers` | Medium |
| Phase 5 | Full directive compliance including `access_control` | High |

## Link Handling

1. Agent SHOULD use the `url` field (redirect proxy URL) when presenting links to users
2. Agent SHOULD display `label` as anchor text or spoken text
3. Agent SHOULD disclose links marked as `sponsored: true` to users
4. Agent SHOULD NOT present links that have passed their `expires_at` time
5. Agent MAY use the `trust` level to determine link prominence:
   - `domain_verified`: Display normally
   - `platform_verified`: Display normally
   - `unverified`: Reduce prominence or display with a warning
6. Agent SHOULD NOT expose `original_url` to bypass tracking

### Redirect Proxy Tracking Parameters

The AIDP redirect proxy MAY append the following query parameters to the target URL for cross-platform analytics interoperability:

| Parameter | Description | Example |
|---|---|---|
| `aidp_ref` | Redirect hash for destination-side attribution (the destination website cannot see the `/r/{hash}` path, so this parameter carries the link identity to the target) | `sk8rm3n1` |
| `aidp_eid` | Entity ID that owns the link (URN or slug) | `sakura-ramen-pdx` |
| `aidp_sid` | Session identifier for correlating multiple clicks within a single session | `a1b2c3` |

These parameters are appended to the **target URL** after the redirect. They are OPTIONAL -- redirect proxy implementations MAY choose not to append them to avoid interfering with target URL behavior. Destination websites MAY use these parameters for traffic attribution but MUST NOT rely on their presence.

## Market-Aware Responses

When an Entity or Content includes a `market` field, the Agent SHOULD adjust responses based on the user's region:

1. When `availability: "global"` or market is absent, display normally
2. When `availability: "regional"`, if the user is not in the `regions` list, the Agent SHOULD note "This content/service may not be available in your region"
3. When `availability: "online_only"`, the Agent MAY note that this service/product is available online only
4. Content-level market overrides Entity-level market

## Variant Resolution

When Content includes a `variant_of` field, the Agent MUST follow these rules:

1. **Merge**: Retrieve the base content and variant, compute `final = { ...base.data, ...variant.variant_delta }`
2. **Region priority**: If the user's region has a corresponding variant (matched via the variant's `market.regions`), prefer the merged variant data
3. **Fallback**: If the base does not exist or has been deleted, treat `variant_delta` as complete data
4. **Transparency**: The Agent SHOULD indicate in responses that the data comes from a variant rather than the base (e.g., "This is the Japan region specification")
