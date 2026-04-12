# Document Structure

An AIDP document is a JSON object with the following top-level structure:

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
| `$aidp` | `string` | Yes | Protocol version (semver) |
| `entity` | `Entity` | Yes | Identity of the content owner |
| `verification` | `Verification` | Yes | How this Entity's identity has been verified |
| `content` | `Content[]` | Yes | The actual structured content items |
| `directives` | `Directives` | No | Global response directives for AI |
| `community` | `Community` | No | Disputes, cross-references, and integrity signals (see [Community Integrity](/en/spec/community)) |
| `extensions` | `object` | No | Namespaced third-party extensions (see [Extensions](/en/spec/extensions)) |
