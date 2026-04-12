# Static File Deployment

If you do not need to use the SpeakSpec platform, you can deploy the AIDP JSON file directly on your own website to make your data accessible to AI Agents.

## File Location

Place the AIDP JSON at your website root: `/.well-known/aidp.json`

## Deployment Steps

1. Create the AIDP JSON file (refer to the [Full Example](/spec/full-example))
2. Place it at `/.well-known/aidp.json`
3. Configure the correct HTTP headers:
   - `Content-Type: application/aidp+json`
   - `Access-Control-Allow-Origin: *` (allows AI Agents to access cross-origin)
   - `Content-Usage` header (based on access_control settings)
4. Add a DNS TXT record for verification

## Web Server Configuration Examples

### Nginx

```nginx
location /.well-known/aidp.json {
    default_type application/aidp+json;
    add_header Access-Control-Allow-Origin *;
    add_header Content-Usage "disallow=FoundationModelProduction";
}
```

### Caddy

```caddy
handle /.well-known/aidp.json {
    header Content-Type "application/aidp+json"
    header Access-Control-Allow-Origin "*"
    header Content-Usage "disallow=FoundationModelProduction"
}
```

## HTML Discovery

Add a link tag to your HTML pages so Agents can discover the AIDP document:

```html
<link rel="aidp" href="/.well-known/aidp.json" type="application/aidp+json" />
```

## Limitations

Static file deployment has the following limitations:

- Cannot automatically track AI exposure
- Cannot use the MCP endpoint
- Content must be updated manually
- Cannot use the redirect proxy for link click tracking

If you need these features, consider using the [SpeakSpec Platform](/guide/speakspec-guide) or the [REST API](/developer/rest-api).
