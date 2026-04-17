# SpeakSpec Platform Guide

SpeakSpec (speakspec.com) is the reference implementation platform for the AIDP protocol, providing a complete web dashboard that enables business owners and organization managers to control how their information is presented in the AI ecosystem. Through SpeakSpec, you can manage Entities, content, directives, verification status, and analytics.

## Registration and Login {#auth}

SpeakSpec offers two registration methods:

- **Email registration**: Create an account with your email and password
- **Google OAuth**: One-click login with your Google account

After creating your account, it is recommended to enable two-factor authentication (2FA) in the settings page for enhanced security.

On your first login, the system will launch the Onboarding Wizard to guide you through the initial setup:

1. **Basic information**: Set your slug (URL identifier, 3-50 characters), Entity type, name, and description
2. **Contact information**: Configure your domain and locale
3. **Verification guide**: Instructions for completing DNS verification

The system checks slug availability in real time during setup. If a slug is reserved, you can submit a claim request.

## Entity Management {#entity}

An Entity is your identity within the AIDP protocol. Each Entity represents a distinct organization or individual and has a unique AIDP ID.

### Entity Types

| Type | Description |
|------|-------------|
| business | Business entity |
| organization | Nonprofit organization |
| individual | Individual |
| government | Government agency |
| academic | Academic institution |
| media | Media organization |
| bot | Bot / AI Agent |

### Basic Information

- **Name** (supports multiple locales, with different display names per locale setting)
- **Description**
- **Category tags**
- **Contact methods** (supports multiple entries; types: phone, email, other; custom labels supported)
- **Domain** (verified domains are locked and cannot be modified)
- **Locale** (primary locale)

After creation, the system assigns a unique AIDP ID in the format `urn:aidp:entity:sakura-ramen-pdx`.

### Market Scope

On the Entity edit page, you can configure the Market Scope to define your operating regions:

- **Global**: Available worldwide (default when not specified)
- **Regional**: Limited to specific regions; requires ISO country codes (e.g., JP, TW, US)
- **Online only**: Online services only

This setting is optional and does not affect existing functionality if left unset. Content can set its own market to override the Entity default.

### Export

Entity data can be exported as a JSON file from the edit page for backup or migration purposes.

### Ownership and Lifecycle

The Danger Zone on the Entity page offers ownership and lifecycle actions. Available options depend on your role:

- **Transfer ownership (owner only)**: Pick an existing admin or editor as the new owner. After transfer, the original owner is demoted to admin.
- **Dissolve entity (owner only)**: Type the full aidp_id to confirm and avoid accidental dissolution. For 14 days after dissolution, only the original owner can restore the entity or recreate it with the same aidp_id / domain.
- **Leave entity (non-owner members)**: Give up your personal access while other members continue to use the entity. Owners cannot leave directly — transfer ownership or dissolve the entity first.

### Restoring or Recreating After Dissolution

After dissolution, when the original owner returns to the dashboard, a restore banner is displayed:

- **Restore**: Reverts the entity to its pre-dissolution state. Content, verification, and directives are all restored.
- **Recreate (empty)**: Creates a new empty entity with the same aidp_id. Previous data is discarded.

Once the 14-day cooldown expires the banner disappears, and the slug and domain are released publicly.

### Slug / Domain Cooldown

To prevent impersonation and accidental reclaiming, the slug and domain of a dissolved entity enter a 14-day cooldown:

- During the cooldown, other users attempting to create the same slug or bind the same domain see a notice indicating when the cooldown ends.
- The original owner is not restricted and can recreate immediately.
- After the cooldown ends, the slug and domain are automatically released for anyone to use.

## Verification {#verification}

Verification is the core step in establishing trust. Completing verification raises your Entity's trust level, making AI systems more likely to reference your information.

### DNS Verification

1. Click "Start Verification" on the verification page
2. The system generates a DNS TXT record -- copy it
3. Add the TXT record to your domain's DNS settings
4. Return to the verification page and click "Check Verification"
5. Once verified, your trust_level upgrades to `verified_domain`

The verification page displays a history of all verification attempts, including the method, status, and timestamp.

### Trust Scores

The AIDP protocol uses multiple dimensions to measure an Entity's trustworthiness:

| Score | Range | Description |
|-------|-------|-------------|
| trust_score | 0-1 | Calculated based on identity verification methods |
| consistency_score | 0-1 | Based on consistency between content and external sources |
| integrity_score | 0-1 | Calculated based on community feedback |

Higher scores make AI systems more likely to prioritize your information. For details on the trust mechanism, see [Verification Specification](/en/spec/verification).

## Content Management {#content}

Content is the core information you deliver to AI systems through the AIDP protocol.

### Content Types

SpeakSpec supports 11 content types:

| Type | Description |
|------|-------------|
| service | Service |
| product | Product |
| menu_item | Menu item |
| faq | Frequently asked question |
| article | Article |
| event | Event |
| announcement | Announcement |
| person | Person |
| policy | Policy |
| dataset | Dataset |
| media | Media |

### Creating Content

When creating content, you need to fill in:

- **Content ID**: A content identifier, e.g., `signature-ramen`
- **Type**: Choose from the 11 content types
- **Structured data**: Fields specific to the content type (name, description, price, etc.)
- **Tags**: Keywords for categorization and search

The creation page supports two modes:
- **Form mode**: Fill in fields using a structured form
- **JSON import mode**: Paste JSON directly for quick creation -- ideal for copying and pasting AI-generated JSON

### Content Variants

When the same product or content has different specifications across regions, you can create a variant from the base content:

1. Click "Create Variant" on the base content edit page
2. The system automatically locks the type and pre-fills the content_id
3. Set the variant's market scope (availability + regions)
4. Each field can be set to "inherit" or "override":
   - **Inherit**: Uses the base value; not written to the variant
   - **Override**: Click to pre-fill with the base value, then modify directly

On save, only overridden fields are stored as `variant_delta`. AI Agents automatically merge base and variant data.

In the content list, variants are labeled with their associated base content, and base content items display their variant count.

### Version Control

Each time you edit content, the system prompts you to enter a change reason. All changes are recorded in the version history, where you can:

- View the change reason and timestamp for each version
- Revert to a previous version

### Drafts and Publishing

Content supports a draft/publish workflow. Draft content does not appear in public API responses and can be published when ready.

### Collaborative Edit Lock

When another team member is editing the same content item, the system displays a lock status to prevent conflicts from simultaneous editing.

### Preview Token

Draft content can be shared with external reviewers via a Preview Token. Generate a token on the content edit page, then use the `/preview/:token` URL to preview draft content without logging in. Tokens have an expiration time.

### Content-Level Links

On the content edit page, you can bind or unbind links, associating call-to-action (CTA) links with specific content items.

## Directives Configuration {#directives}

Directives are the core feature of the AIDP protocol, allowing you to precisely control how AI presents your information. They can be configured at the Entity level or at the individual content level.

### Identity Control

| Directive | Description |
|-----------|-------------|
| preferred_name | The name AI should use |
| never_call | Names AI must never use (multiple entries supported) |

For example: if a restaurant wants AI to refer to it as "Sakura Ramen" rather than other variations, it can set preferred_name accordingly.

If an identity setting is flagged for review by the platform, you can submit an evidence URL to appeal.

### Response Rules

| Directive | Description |
|-----------|-------------|
| must_include | Information AI must include in responses (multiple entries supported) |
| must_not_say | Content AI must never mention (multiple entries supported) |
| tone | Tone setting: professional, friendly, casual, formal |
| formality | Formality level: high, medium, low |

### Attribution and Freshness

| Directive | Description |
|-----------|-------------|
| require_source_link | Require AI to include a source link |
| canonical_url | Official URL (auto-suggested when domain is verified) |
| default_ttl | Content time-to-live in seconds; AI should re-fetch after expiration |
| stale_action | Expiration handling: serve_stale, omit, warn |

### Access Control

| Directive | Description |
|-----------|-------------|
| allow_training | Whether to allow use for AI model training |
| allow_caching | Whether to allow caching |
| allow_derivative | Whether to allow derivative use |
| require_attribution | Whether to require source attribution |

These settings are automatically converted to IETF AIPREF headers in responses, enabling AI systems to programmatically comply with your licensing terms.

## Link Management {#links}

SpeakSpec provides call-to-action (CTA) link management at both the Entity level and Content level.

### Creating Links

When creating a link, you need to configure:

- **Target URL**: The destination URL
- **Label**: Link label (optional)
- **Scope**: Entity-level or bound to a specific content item
- **Rel type**: action (call-to-action link), source (source link), related (related link)
- **Purpose**: Usage category -- booking, menu, purchase, contact, info, download, apply, other
- **Sponsored**: Whether this is a sponsored link (ensures AI systems can properly disclose commercial relationships)

### Filtering and Management

The link list supports filtering by scope: all, Entity-level, Content-level. Each link supports:

- Copy short URL
- Edit label, scope, sponsored flag, and active status
- Delete

### Tracking Mechanism

All links operate through the SpeakSpec redirect proxy (`/r/:hash`), which automatically tracks click counts and sources. The redirect appends `aidp_ref` and `aidp_eid` parameters to the target URL -- no additional tracking code setup is required.

## Output Preview {#output}

One of SpeakSpec's core advantages: a single data source automatically generates multiple formats, covering different AI and search engine requirements.

### Output Formats

| Format | Purpose |
|--------|---------|
| AIDP JSON | Complete AIDP protocol document for AIDP-compatible systems |
| Schema.org JSON-LD | SEO-optimized structured data to improve search engine visibility |
| llms.txt | Markdown format for AI navigation, designed for direct consumption by large language models |
| Open Graph | Meta tags for social sharing, optimizing social platform previews |

The output preview page lets you switch between formats to inspect the output, with a copy function for easy export.

### Embed Links

The preview page also provides your Entity's public URL and HTML `<link>` tag code for embedding on your website:

```html
<link rel="aidp" href="https://api.speakspec.com/public/entity/your-entity" />
```

### MCP Endpoint

In addition to the HTTP API, SpeakSpec also provides an MCP (Model Context Protocol) endpoint, allowing AI Agents to access your data directly via the standardized JSON-RPC protocol. See [MCP Integration](/en/developer/mcp-integration) for details.

## Webhooks {#webhooks}

Webhooks allow you to automatically notify external systems when specific events occur.

### Supported Events

| Event | Trigger |
|-------|---------|
| `entity.updated` | Entity data is updated |
| `content.created` | New content is created |
| `content.published` | Content is published |
| `content.deleted` | Content is deleted |
| `verification.completed` | Verification is completed |
| `member.joined` | A new member joins the team |

### Managing Webhooks

- **Create**: Set the receiving URL and subscribe to event types
- **Test**: Send a test payload to the target URL
- **Enable/Disable**: Pause or resume webhook delivery
- **Delete**: Remove webhooks that are no longer needed
- **Delivery history**: View the delivery log for each webhook, including event type, HTTP response code, and delivery status (delivered, failed, pending)

## Analytics {#analytics}

SpeakSpec provides an entirely new analytics dimension for the AI era.

### Overview Metrics

The dashboard home page displays four core metric cards:

- **Total impressions**: Total number of times your Entity has been read by AI systems
- **This week's impressions**: Impressions over the past 7 days
- **MCP share**: Percentage of access via the MCP protocol
- **Link clicks**: Clicks generated through tracked links

### Detailed Analysis

The Analytics page provides:

- **Date range filter**: Custom query period (default 30 days)
- **Daily trend chart**: Impression count over time
- **Agent distribution**: Which AI systems are reading your data (e.g., ChatGPT, Claude, Gemini)
- **Content ranking**: Most frequently cited content items by AI

### Usage Monitoring

The dashboard home page also displays usage status for your current plan:

- Member count
- Content count
- Link count

Usage bars are color-coded to indicate utilization levels (green < 70%, yellow 70-90%, red > 90%).

## Import/Export {#import-export}

SpeakSpec supports JSON data import and export (format version v1.1).

### Export

Click the export button on the Entity edit page to download the complete Entity JSON file, including market, variant, and all other fields.

### Batch Import

1. Select a JSON file on the import page
2. The system displays the number of content items and variants in the file
3. Click "Dry Run" to preview the import results: shows the number of content items and links to be created, along with any warnings and errors
4. Click "Confirm Import" to execute after reviewing

Import supports both v1.0 and v1.1 formats (backward compatible). Content with `variant_of` is automatically sorted to ensure base content is created first.

### Single JSON Import

On the "Create Content" page, switch to "JSON Import" mode to paste JSON directly for quick single-item creation. Recommended workflow:

1. Ask AI to generate content JSON for you
2. Copy the AI-generated JSON
3. Paste it in JSON import mode
4. Preview, confirm, and create with one click

Variant JSON containing `variant_of` and `variant_delta` is also supported.

The Dry Run feature lets you preview changes before the actual import, preventing accidental overwrites of existing data.

## Slug Management {#slug}

A slug is the Entity's identifier in URLs (e.g., `sakura-ramen-pdx`).

- **Set during onboarding**: Specify the initial slug when creating your Entity
- **Change slug**: Change the slug on the settings page; the system checks availability in real time (minimum 3 characters)
- **Claim reserved slugs**: If a slug is reserved by the system, you can submit a claim request (reservation_claim)
- **Slug already in use**: If a slug is already taken by someone else, you can submit a dispute

## Entity Badge {#badge}

SpeakSpec provides an embeddable trust verification badge that lets you display your verification status on your own website.

### Badge Content

The badge is a compact 200x60px widget that includes:

- Shield icon (styled according to verification status)
- Entity name
- Trust level label
- SpeakSpec branding

### Embedding

You can obtain the embed code from the output preview or link management page. Supported formats:

- **HTML**: Complete `<a>` tag with image
- **Markdown**: Badge link syntax

The badge page is located at `/entity/badge/:aidpId` and clicking it navigates to the Entity's public page.

## API Keys {#api-keys}

You can create and manage API Keys on the settings page for programmatic access to the platform management API.

### Creating an API Key

- **Name**: Custom name for identification
- **Scope**: Read (read-only) or Write (read-write)
- **Expiration**: Permanent, 30 days, 90 days, or 365 days

After creation, the system displays the full API Key. You must copy and save it immediately -- the full key cannot be viewed again afterward.

### Management

The API Key list displays for each key:

- Name and key prefix
- Scope label
- Last used time
- Revoke button

## Team Members {#members}

SpeakSpec supports multi-user collaborative Entity management.

### Role Permissions

| Role | Permissions |
|------|-------------|
| owner | Full permissions, including deleting the Entity, managing all member roles, and transferring ownership |
| admin | Manage content, Directives, and invite members (except owner role); cannot delete the Entity |
| editor | Manage content and Directives; cannot manage members |

### Invitation Process

1. Enter the invitee's email on the team members page
2. Select a role (owners can assign admin or editor; admins can only assign editor)
3. The system sends an invitation link
4. The invitee clicks the link to register or log in and join the team

### Managing Members

- Change member roles (available to owner and admin)
- Remove members
- View pending invitations

## Account Settings {#settings}

### Profile

- Display name (editable)
- Email (read-only)

### Password Management

- Set or change password (minimum 8 characters)
- Current password verification required

### Two-Factor Authentication (2FA)

Steps to enable TOTP two-factor authentication:

1. Click "Enable 2FA" on the settings page
2. Scan the QR code with your Authenticator App (or manually enter the secret key)
3. Enter the 6-digit verification code to complete activation

Disabling 2FA also requires entering a verification code for confirmation.

### Google Account Linking

You can link or unlink a Google account on the settings page. Once linked, you can use Google OAuth to log in.

## Audit Log {#audit-log}

All operations on an Entity are recorded in the audit log. The public change history is accessible via the [Public API](/en/api/public) endpoint `/public/entity/:aidpId/history`, which includes:

- Operation type (entity.updated, content.published, etc.)
- Related Content ID
- Change reason
- Data before and after the change
- Timestamp

The audit log ensures all changes are traceable and allows AI Agents to understand data update frequency and reliability.
