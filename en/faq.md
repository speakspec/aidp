---
title: FAQ
description: Common questions about SpeakSpec and AIDP, review process, rejection reasons, and resolutions
---

# Frequently Asked Questions

This page covers the most common questions when using SpeakSpec and the AIDP protocol. Use the search box at the top right of the page; it tolerates minor typos.

If your answer is not here, let us know via the [contact form](https://speakspec.com/contact).

---

## About AIDP and SpeakSpec

### What is AIDP?

AIDP (AI Directive Protocol) is an open standard that lets content owners publish structured information for AI agents to read, plus directives that tell agents how to present that information. See [What is AIDP](/en/guide/what-is-aidp).

### How is AIDP different from schema.org?

schema.org describes "what this is" (name, address, price); AIDP additionally describes "please use it this way" (do not name discontinued products, prefer the formal name, not available in certain regions, etc.). AIDP is **complementary** to schema.org — the same entity can publish both markups.

### What is the relationship between SpeakSpec and AIDP?

AIDP is the **open protocol** (CC-BY-4.0). SpeakSpec is a commercial platform that implements AIDP, providing a dashboard, verification, review, public API, and MCP integration. You can implement AIDP yourself or host with SpeakSpec.

### Which languages are currently supported?

UI and content are bilingual: **Traditional Chinese, English**. Content itself can be written in any language (AIDP's `locale` field accepts any BCP-47 language tag).

### Are the AIDP version and the SpeakSpec product version separate?

Yes. The AIDP protocol version (currently `0.1.0`) is the spec version, written into every AIDP document's `$aidp` field. SpeakSpec has its own product version that is independent of the spec version.

---

## Account and Subscription

### Can I use it for free?

Yes. The Free plan covers basic entity and content creation. Quota limits are listed on the [pricing page](https://speakspec.com/pricing).

### How do I upgrade or change plan?

Go to [Pricing](https://speakspec.com/pricing) or Dashboard → Settings → Plan. Enterprise is requested via the [contact form](https://speakspec.com/contact).

### What if I forget my password?

Click "Forgot password" on the login page and enter your email; you will receive a reset link. The link is valid for 30 minutes.

### I did not receive the verification or reset email — what now?

Check the following first:
1. Spam / promotions folder
2. Whether your email is spelled correctly (visible after login in Settings)
3. Whether your email provider blocks `no-reply@speakspec.com` (you can add it to your contacts)

If it still does not arrive, [contact support](https://speakspec.com/contact) and include the email address you registered with.

### How do I delete my account?

**Self-service deletion** is supported:

1. After logging in, go to Dashboard → **Settings**
2. Scroll to the bottom of the page to **Danger Zone**
3. Click "Delete account" and complete verification:
   - Tick "I understand this action is irreversible"
   - Re-enter your account email
   - Enter your login password
   - If two-step verification is enabled, enter the 6-digit TOTP
   - (Optional) Choose a deletion reason to help us improve the product
4. After submission the account enters a **30-day grace period**:
   - All entities are immediately removed from the public API
   - All API keys are immediately invalidated
   - The account can only access the settings page to cancel the deletion
   - We send a "deletion request confirmed" email and a "deletion imminent" reminder on day 23
5. **Changed your mind?** Log in any time within 30 days and click "Cancel deletion" on the settings page or the top banner to restore the account (entities must be re-published manually)
6. **After 30 days**: the system automatically purges all your personal data

If you cannot log in or need other help, you can still email `support@speakspec.com`.

Data handling follows the [Privacy Policy](https://speakspec.com/privacy):
- Account personal data is purged when the 30-day grace period ends
- Public AIDP data is removed from the Public API at the moment the deletion request is submitted
- Anonymised usage records are retained for up to 24 months as policy allows

---

## Creating an Entity

### What is an entity?

An entity represents an organization, brand, person, or product. Each entity has a unique `aidp_id` (e.g. `speakspec`), the primary key AI agents use to refer to you.

### Can I change the `aidp_id` after creation?

**No**. The `aidp_id` is the permanent identifier AI agents use to refer to you and cannot be modified once created. Choose carefully before creating.

### How many entities can one account create?

One per account, **regardless of plan**. To run multiple brands or subsidiaries, register a separate account for each entity and link them via Entity Relationships (`parent_organization` / `subsidiary`).

### Can an individual create an entity?

Yes. `entity_type` accepts `organization`, `person`, `product`, and others. Personal brands, independent creators, and professionals all qualify.

### How do I find the entity I created?

After logging in, the Dashboard home page is your entity.

### I already own an entity — can I also accept an invitation to another entity's team?

No. An account can only be bound to one entity at a time (whether self-created or joined via invitation). If you already own an entity and receive a team invitation, you must first do one of the following:

- **Transfer ownership** to another member of your entity, demote yourself to a regular member, then leave
- **Dissolve the entity** (owner only; requires typing the full aidp_id to confirm)

Only then can you accept the new team invitation.

---

## Content and Directives

### What is the difference between Content and Directive?

- **Content**: describes facts. Examples: product specs, services, contact information, media assets.
- **Directive**: tells AI how to handle the content. Examples: "use the formal full name, not the old brand name", "this service is only available in Taiwan".

### Does every Directive update need review? What about Content?

**No.** Routine Directive updates take effect immediately (status `approved`). Only when the system detects **prohibited language or high-risk patterns** (marketing copy, unverified claims, misleading wording) is the update **automatically set to `flagged` and sent for human review**. While flagged, the previously approved Directive remains active; the new version takes effect only after review passes.

**Content currently has no review process** — it is the latest state immediately after saving.

### How long does review take?

Generally 1–3 business days. Complex cases or those requiring additional documents take longer. You can track status in the dashboard after submission.

### Can I edit a submission after sending it for review?

While in review (`pending_review`), edits are not allowed. You can edit and resubmit only after receiving a rejection or approval.

### Can I see version history?

Yes. Each Content has a "History" tab in the dashboard showing the diff for every version; the public page also shows reader-facing change history for entity and content.

### How do I withdraw a submission?

Self-service withdrawal is not currently supported. Please [contact support](https://speakspec.com/contact) and include the entity ID.

---

## Verification

### Why do I need to verify my domain?

Verification displays a "Verified" badge on your public page and lets AI agents confirm that the data really comes from the domain owner. Unverified entities can still be used, but AI may present them at a lower trust level.

### How do I do DNS verification?

1. Dashboard → Verification → choose "DNS verification" and enter your domain
2. The system gives you a TXT record (similar to `aidp-verify=xxxxxxxx`)
3. Add that TXT record in your domain DNS management console
4. Return to SpeakSpec and click "Check"

### How long does DNS verification take?

After adding the DNS record, usually a few minutes to a few hours (depending on DNS propagation). Clicking "Check" manually triggers verification; it completes immediately if the TXT record is already live.

### Are there other verification methods besides DNS?

Currently SpeakSpec primarily offers DNS verification. For special situations (e.g. business registration), please ask via the [contact form](https://speakspec.com/contact).

### What happens when verification expires?

After expiry the badge turns grey and the trust level on the AI side is downgraded, but the data remains. Re-submit verification to restore it.

### Can I retry after a failed verification?

Yes. Rejections include a reason (see the next section); fix the issue and resubmit.

---

## Review and Rejection Reasons

> The reasons and explanations below come from a built-in system list. Rejection notification emails carry the reason title and explanation in English; the dashboard and public page display them in your UI language.

### Directive Rejection Reasons

#### Marketing language (`marketing_language`)

**Why rejected**: Directives are factual governance instructions. If they contain marketing language ("industry-leading", "best in class", "revolutionary"), AI representing you may produce biased or untruthful sales talk.

**How to fix**: Use neutral, verifiable descriptions. Replace "industry-leading XX service" with "providing XX service since 2018" or "handling XX cases per year".

#### Unverified claim (`unverified_claim`)

**Why rejected**: The directive contains data or claims that cannot be verified ("certified by OOO", "60% market share") without supporting evidence.

**How to fix**:
- Provide a verifiable third-party source link (government registry, public report, news coverage)
- Or rewrite as an objective fact that needs no supporting evidence
- Or mark it in Content as a "self-declared" item rather than a Directive

#### Insufficient evidence / dead link (`insufficient_evidence`)

**Why rejected**: The directive includes an evidence link, but the link is broken, not public, or its content is insufficient to support the claim.

**How to fix**:
- Make sure the link is publicly accessible (no login required)
- Linked content should directly correspond to the claim
- For images or PDFs, use a stable URL (not a one-time short URL)

#### Policy violation (`policy_violation`)

**Why rejected**: Content violates the SpeakSpec [Acceptable Use](https://speakspec.com/acceptable-use) policy (illegal content, hate speech, malicious attempts to make AI produce harmful output).

**How to fix**: Read the acceptable use policy and revise. If you believe this is a misjudgment, file an appeal via the [contact form](https://speakspec.com/contact) and include the directive ID.

#### Misleading content (`misleading_content`)

**Why rejected**: The directive may mislead users via AI (implying a discontinued product is still on sale, deliberately erasing legal disclosures, leading AI to make commitments you cannot keep).

**How to fix**: Replace with neutral descriptions, avoid comparing competitors, avoid absolute wording; required disclosures should be stated explicitly in Content fields.

#### Other (`other`)

**Why rejected**: Does not fit the categories above. The admin will state the specific reason in the rejection notice.

**How to fix**: Address the specific feedback. If unclear, email `support@speakspec.com` or ask via the [contact form](https://speakspec.com/contact) (system notification emails are **one-way** and cannot be replied to).

### Verification Rejection Reasons

#### Document unreadable (`document_unreadable`)

**Why rejected**: The uploaded registration document has poor scan quality, a skewed angle, glare, or occlusion, so the system or reviewer cannot clearly read the key fields.

**How to fix**:
- Use a scanner instead of a phone photo
- Make sure all four corners are intact, text is clear, no occlusion
- Output PDFs at 300 DPI or higher; image edges should be at least 1600 px

#### Document expired (`document_expired`)

**Why rejected**: The issue date of the registration document is older than what we accept (typically within 12 months).

**How to fix**: Obtain the latest version from the original issuing authority (government, business registry) and resubmit.

#### Information mismatch (`info_mismatch`)

**Why rejected**: The company name, registration number, country code, and other information on the submission form do not match the uploaded document or the official registry.

**How to fix**:
- The company name must match the registration document **exactly** (including suffixes like "Co., Ltd.", "Ltd.")
- Check the registration number for added or missing characters
- The country code (ISO 3166-1 alpha-2, e.g. `TW`, `US`) must correspond to the country of registration

#### Unsupported jurisdiction (`unsupported_jurisdiction`)

**Why rejected**: The jurisdiction is not on our verification support list. This is a platform limitation, not a document problem.

**How to fix**:
- The currently supported countries are listed in the dashboard dropdown
- If your region is not on the list, [contact support](https://speakspec.com/contact) to register the request; we evaluate additions
- In the meantime you can create the entity in an unverified state and verify later when the region becomes supported

#### Suspected forgery (`suspected_forgery`)

**Why rejected**: The document is judged to have forgery indicators (incorrect watermark, abnormal registration number format, mismatch with public registry data). **The associated entity and account are flagged and suspended**.

**How to fix**: If this is a misjudgment, [contact support](https://speakspec.com/contact) and provide:
- The original PDF or a high-resolution version of the document
- A supporting third-party source (e.g. a link to the government registry lookup)
- We will assist in cross-checking with the issuing authority if necessary

#### Not an official document (`not_official`)

**Why rejected**: The upload is not a formal document issued by the government or a business registry (e.g. internal articles of association, an invoice, a contract, a website screenshot).

**How to fix**: Provide one of the following:
- Registration certificate issued by a business registry
- Tax registration record issued by a government tax authority
- Court-registered company summary
- An official document of equivalent standing

#### Other (`other`)

**Why rejected**: Does not fit the categories above. Refer to the dashboard rejection note or the specific content of the notification email.

**How to fix**: Address the specific feedback. If unclear, email `support@speakspec.com` or use the [contact form](https://speakspec.com/contact) (notification emails are one-way; please do not reply directly).

---

## Integration

### How do I add an AIDP link on my site?

Add the following to `<head>`:

```html
<link rel="aidp" href="https://api.speakspec.com/public/entity/<your-aidp-id>" />
```

When AI agents read your page they follow this link to fetch the AIDP document. See [Developer Integration](/en/developer/integration).

### What is MCP and how can I use it?

Model Context Protocol lets Claude Desktop and MCP-capable agents query your entity directly via the SpeakSpec MCP server. Configuration is described in [MCP Integration](/en/developer/mcp-integration).

### Does the public API require an API key?

- Public read routes such as `/public/entity/:aidpId`: **no** API key required, call directly
- Dashboard API (create / update entity, content, directive): requires login or an API key, generated from Dashboard → Settings → API Keys

### Can I export data or import an existing schema.org payload?

Yes. Dashboard → Output offers four formats: AIDP JSON, schema.org, llms.txt, OG tags. Import format and workflow are described in [Import / Export](/en/developer/import-export).

### Can I publish to my own site and SpeakSpec at the same time?

Yes, and we recommend doing both: SpeakSpec hosts the authoritative source, and your own site uses `<link rel="aidp">` to point back. AI agents treat the domain-verified version as authoritative.

---

## Privacy and Data

### Will all my data become public?

Only entities, content, and directives marked `public` appear at the public URL (`/public/entity/<aidp_id>`). Drafts, unpublished items, and content that has not passed review are **not** made public.

### Will personal information (name, email) be made public?

Your SpeakSpec account email and login records are not public. A `person`-type entity only appears on the public page if you choose to publish it. Confirm the disclosure scope before publishing.

### How long is data retained after I delete my account?

Per the [Privacy Policy](https://speakspec.com/privacy) §5:
- Account personal data is purged within **30 days** of deletion
- Published AIDP data is removed from the Public API within **24 hours**
- Anonymised usage analytics and access logs are retained for up to **24 months**

### What is the privacy compliance status?

SpeakSpec is a global platform and operates under different regional data protection regulations. The privacy policy describes the common data subject rights (access, correction, deletion, portability, withdrawal of consent — see [Privacy Policy §6](https://speakspec.com/privacy)). Cross-border transfers use appropriate safeguards (§8).

For privacy questions, email `privacy@speakspec.com`; for general support, use `support@speakspec.com` or the [contact form](https://speakspec.com/contact).

### Will you use my data to train AI?

**No**. SpeakSpec does not use your content to train AI models. AIDP is designed to make you correctly represented **outwards** by AI, not to be used as training data.

---

## Did not find your answer?

- Technical and integration: [Developer documentation](/en/developer/integration)
- Protocol specification: [AIDP Spec](/en/spec/overview)
- Other questions: [Contact us](https://speakspec.com/contact)
