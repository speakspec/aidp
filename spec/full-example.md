# 完整範例

以下是一份完整的 AIDP 文件，以一家餐廳為例，展示 [Entity](/spec/entity)、[Content](/spec/content)、[Verification](/spec/verification)、[Directives](/spec/directives)、[社群完整性](/spec/community) 和 [擴充](/spec/extensions) 的綜合運用。

```json
{
  "$aidp": "0.1.0",
  "entity": {
    "id": "urn:aidp:entity:sakura-ramen-pdx",
    "type": "business",
    "name": {
      "default": "Sakura Ramen",
      "ja": "桜ラーメン"
    },
    "description": {
      "default": "Authentic Japanese ramen shop in Portland, specializing in tonkotsu and miso ramen"
    },
    "domain": "sakuraramen.com",
    "locale": "en-US",
    "category": ["restaurant", "japanese", "ramen"],
    "contacts": [
      { "type": "phone", "value": "+1-503-555-0188" },
      { "type": "email", "value": "hello@sakuraramen.com" }
    ],
    "addresses": [
      {
        "type": "physical",
        "formatted": "123 NW 10th Ave, Portland, OR 97209",
        "geo": { "lat": 45.5235, "lng": -122.6812 }
      }
    ],
    "links": {
      "website": "https://sakuraramen.com",
      "social": {
        "instagram": "https://instagram.com/sakuraramen_pdx"
      },
      "actions": [
        {
          "rel": "action",
          "label": "Reserve a Table",
          "url": "https://api.speakspec.com/r/sk8rm3n1",
          "purpose": "booking",
          "trust": "domain_verified",
          "verified_via": "dns_txt",
          "sponsored": false
        },
        {
          "rel": "source",
          "label": "Full Menu (PDF)",
          "url": "https://api.speakspec.com/r/sk8rm3n2",
          "purpose": "menu",
          "trust": "domain_verified",
          "verified_via": "dns_txt",
          "sponsored": false
        }
      ]
    }
  },
  "verification": {
    "methods": [
      {
        "type": "dns_txt",
        "domain": "sakuraramen.com",
        "record": "aidp-verify=sk_r4m3n_2026",
        "verified_at": "2026-03-01T00:00:00Z",
        "status": "verified"
      }
    ],
    "trust_score": 0.72,
    "trust_level": "verified_domain",
    "last_verified": "2026-03-01T00:00:00Z",
    "credential": null
  },
  "content": [
    {
      "id": "menu-tonkotsu",
      "type": "menu_item",
      "schema": "aidp:menu_item",
      "data": {
        "name": "Classic Tonkotsu Ramen",
        "description": "Rich pork bone broth simmered for 18 hours, served with house-made noodles",
        "price": { "currency": "USD", "amount": 16.50 },
        "allergens": ["pork", "wheat", "soy", "egg"],
        "available": true,
        "tags": ["signature", "popular"],
        "links": [
          {
            "rel": "action",
            "label": "Order Online",
            "url": "https://api.speakspec.com/r/sk8rm3n3",
            "purpose": "purchase",
            "trust": "domain_verified",
            "verified_via": "dns_txt",
            "sponsored": false
          }
        ]
      },
      "tags": ["menu", "ramen", "pork"],
      "media_refs": ["photo-tonkotsu"],
      "updated_at": "2026-03-10T12:00:00Z"
    },
    {
      "id": "menu-vegan-miso",
      "type": "menu_item",
      "schema": "aidp:menu_item",
      "data": {
        "name": "Vegan Miso Ramen",
        "description": "Plant-based broth made with kelp and shiitake mushrooms",
        "price": { "currency": "USD", "amount": 15.00 },
        "allergens": ["wheat", "soy"],
        "dietary": ["vegan", "vegetarian"],
        "available": true
      },
      "tags": ["menu", "ramen", "vegan"],
      "updated_at": "2026-03-10T12:00:00Z"
    },
    {
      "id": "photo-tonkotsu",
      "type": "media",
      "schema": "aidp:media",
      "data": {
        "media_type": "image",
        "purpose": "product",
        "url": "https://cdn.sakuraramen.com/tonkotsu.webp",
        "alt": { "default": "Classic Tonkotsu Ramen" },
        "format": "webp",
        "width": 800,
        "height": 600,
        "size_bytes": 185000
      },
      "directives": {
        "licensing": {
          "type": "proprietary",
          "attribution_required": true,
          "ai_training_allowed": false
        }
      },
      "updated_at": "2026-03-10T12:00:00Z"
    },
    {
      "id": "hours",
      "type": "service",
      "schema": "aidp:service",
      "data": {
        "name": "Business Hours",
        "availability": {
          "schedule": [
            { "day": "mon", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "tue", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "wed", "status": "closed" },
            { "day": "thu", "hours": "11:30-14:30, 17:00-21:30" },
            { "day": "fri", "hours": "11:30-14:30, 17:00-22:00" },
            { "day": "sat", "hours": "11:00-22:00" },
            { "day": "sun", "hours": "11:00-21:00" }
          ]
        }
      },
      "directives": {
        "must_include": ["Closed every Wednesday"]
      },
      "updated_at": "2026-03-01T00:00:00Z"
    }
  ],
  "directives": {
    "identity": {
      "preferred_name": "Sakura Ramen",
      "never_call": ["Sakura Noodle", "Sakura Noodle House"]
    },
    "response_rules": {
      "must_include": [
        "Closed every Wednesday"
      ],
      "must_not_say": [
        "We offer delivery",
        "Walk-in reservations available"
      ],
      "disclaimers": [
        {
          "trigger": "pricing",
          "text": { "default": "Prices may change. Please check the in-store menu for current pricing." }
        },
        {
          "trigger": "availability",
          "text": { "default": "Menu availability depends on daily ingredient supply." }
        }
      ],
      "tone": "friendly",
      "formality": "casual",
      "language_preference": "match_user"
    },
    "attribution": {
      "require_source_link": true,
      "canonical_url": "https://sakuraramen.com"
    },
    "freshness": {
      "default_ttl": 604800,
      "stale_action": "warn"
    },
    "access_control": {
      "allow_training": false,
      "allow_caching": true,
      "allow_derivative": true,
      "require_attribution": true
    }
  },
  "community": {
    "disputes": {
      "total": 1,
      "resolved": 1,
      "pending": 0,
      "rejected": 0
    },
    "integrity_score": 0.95
  },
  "extensions": {
    "x-geo:us": {
      "ein": "87-6543210",
      "state_license": "OR-REST-2026-1234"
    }
  }
}
```
