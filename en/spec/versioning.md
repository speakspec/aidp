# Versioning

- Versions follow [Semantic Versioning](https://semver.org/)
- **PATCH** (0.3.x): Bug fixes, typo corrections, clarifications
- **MINOR** (0.x.0): New optional fields, new content types, new extension namespaces
- **MAJOR** (x.0.0): Breaking changes to required fields or structure
- Agents must check the `$aidp` version and gracefully handle unknown fields
- Unknown fields must be ignored, not rejected
