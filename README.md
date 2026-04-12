# AIDP - AI Directive Protocol

AIDP defines a standard format for content providers to publish structured information intended for consumption by AI Agents, along with directives that guide how AI should represent that information in responses.

```
Schema.org  ->  tells search engines what your content is
AIDP        ->  tells AI agents what your content is + how to talk about it + how much to trust it
```

**Full Spec:** [AIDP-SPEC-v0.4.0-draft.md](./AIDP-SPEC-v0.4.0-draft.md)

**Docs:** [docs.speakspec.com](https://docs.speakspec.com)

**Platform:** [speakspec.com](https://speakspec.com)

## Key Features

- **First-party fact control** -- `must_include` / `must_not_say` directives for AI responses
- **Verifiable trust** -- DNS verification, business registration, multi-signal trust model
- **Multi-format output** -- One AIDP source produces JSON, Schema.org, llms.txt, Open Graph
- **AI Agent friendly** -- MCP, REST API, static file, DNS TXT, HTML meta tag transport
- **Content integrity** -- Community dispute mechanism for factual corrections
- **Content variants** -- Region-specific content with `variant_of` / `variant_delta`

## Quick Start

Minimal valid AIDP document:

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

## Documentation

| Section | Description |
|---------|-------------|
| [What is AIDP](https://docs.speakspec.com/guide/what-is-aidp) | Problem statement and core concepts |
| [Getting Started](https://docs.speakspec.com/guide/getting-started) | Three paths to start using AIDP |
| [Spec Overview](https://docs.speakspec.com/spec/overview) | Protocol specification |
| [Developer Guide](https://docs.speakspec.com/developer/integration) | MCP, REST API, static file integration |
| [API Reference](https://docs.speakspec.com/api/) | Public API and MCP API docs |
| [Changelog](https://docs.speakspec.com/spec/changelog) | Version history |

## Current Version

**v0.4.0-draft** -- [Full Changelog](https://docs.speakspec.com/spec/changelog)

## License

Spec text: [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
