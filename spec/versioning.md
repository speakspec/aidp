# 版本演進

- 版本遵循 [Semantic Versioning](https://semver.org/)
- **PATCH** (0.3.x)：錯誤修正、錯字更正、釐清說明
- **MINOR** (0.x.0)：新的選填欄位、新的內容類型、新的 extension 命名空間
- **MAJOR** (x.0.0)：必填欄位或結構的破壞性變更
- Agent 必須檢查 `$aidp` 版本並優雅地處理未知欄位
- 未知欄位必須被忽略，而非拒絕
