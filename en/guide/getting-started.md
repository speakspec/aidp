---
description: Get started with AIDP quickly -- use the SpeakSpec platform or API to ensure AI represents your brand correctly
---

# Getting Started

AIDP (AI Directive Protocol) enables businesses to control how AI presents their brand information. Depending on your needs and technical background, there are three ways to get started.

## Choose Your Path

| Path | Best For | Technical Requirement |
| --- | --- | --- |
| SpeakSpec Platform | Business owners, marketing teams | No coding required |
| API Integration | Developers, technical teams | Programming skills required |
| Static Files | Technical users who want full control | Server management skills required |

## Path 1: Use the SpeakSpec Platform (Recommended) {#speakspec}

Best for business owners who want to get up and running quickly without writing code.

1. Go to [SpeakSpec](https://speakspec.com) and create an account
2. Create your Entity -- fill in your business name, type, contact information, and other basic details
3. Complete DNS verification -- add a TXT record to your domain to prove ownership
4. Add content -- including services, products, FAQs, business hours, and more
5. Configure Directives -- define rules for what AI must say, must not say, response tone, and more
6. Publish -- the platform automatically generates AIDP JSON, Schema.org, llms.txt, and MCP endpoint

Once complete, all AIDP-compatible AI assistants will be able to accurately present your brand information.

For a detailed platform walkthrough, see the [SpeakSpec Platform Guide](/en/guide/speakspec-guide).

## Path 2: API Integration {#api}

Best for developers who need to integrate AIDP into their own systems.

1. Register and create an Entity on [SpeakSpec](https://speakspec.com)
2. Configure Content and Directives through the platform
3. Access published AIDP data via the public API

### Retrieve an AIDP Document

```bash
curl https://api.speakspec.com/public/entity/my-shop
```

Use the Accept header to retrieve different formats:

```bash
curl https://api.speakspec.com/public/entity/my-shop \
  -H "Accept: application/ld+json"
```

The response includes the complete AIDP JSON document, including Entity, Content, Directives, and verification information.

For complete public API documentation, see the [API Reference](/en/api/).

## Path 3: Manually Create Static Files {#static}

Best for technical users who want full control without depending on a third-party platform.

### 1. Create an AIDP File

Create `.well-known/aidp.json` in your website's root directory. Here is a minimal valid AIDP document:

```json
{
  "$aidp": "0.4.0",
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

### 2. Set Up DNS Verification

Add a TXT record to your domain for verification:

```
_aidp.yourdomain.com TXT "aidp-verify=urn:aidp:entity:my-shop"
```

### 3. Gradually Expand Your Content

Start with the minimal document and progressively add:

- `content` -- Structured data such as services, products, FAQs, and business hours
- `directives` -- AI response rules, including must-include and must-not-say items
- `verification.methods` -- Additional verification methods to increase your trust score

For a complete static file deployment guide, see [Static File Deployment](/en/developer/static-file).

## Next Steps

- Learn the full protocol specification: [Protocol Overview](/en/spec/overview)
- Explore individual features: [Entity](/en/spec/entity), [Content](/en/spec/content), [Directives](/en/spec/directives), and more
- View a complete example: [Full Example](/en/spec/full-example)
