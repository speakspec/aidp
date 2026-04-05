# 文件結構

AIDP 文件是一個 JSON 物件，具有以下頂層結構：

```json
{
  "$aidp": "0.3.0",
  "entity": { },
  "verification": { },
  "content": [ ],
  "directives": { },
  "community": { },
  "extensions": { }
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `$aidp` | `string` | ✅ | 協議版本（semver） |
| `entity` | `Entity` | ✅ | 內容擁有者的身份 |
| `verification` | `Verification` | ✅ | 該 Entity 的身份如何被驗證 |
| `content` | `Content[]` | ✅ | 實際的結構化內容項目 |
| `directives` | `Directives` | ❌ | 給 AI 的全域回應指令 |
| `community` | `Community` | ❌ | 異議、交叉參考和完整性訊號（見 [社群完整性](/spec/community)） |
| `extensions` | `object` | ❌ | 命名空間化的第三方擴充（見 [Extensions](/spec/extensions)） |
