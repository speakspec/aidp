# SpeakSpec 平台指南

SpeakSpec（speakspec.com）是 AIDP 協定的參考實作平台，提供完整的網頁儀表板，讓企業主和組織管理者能夠掌控自身在 AI 生態系統中的資訊呈現方式。透過 SpeakSpec，你可以管理 Entity、內容、指令、驗證狀態和數據分析。

## 註冊與登入 {#auth}

SpeakSpec 提供兩種註冊方式：

- **Email 註冊**：輸入 Email 和密碼建立帳號
- **Google OAuth**：使用 Google 帳號一鍵登入

帳號建立後，建議在設定頁面啟用雙重驗證（2FA）以強化安全性。

首次登入時，系統會啟動 Onboarding Wizard，引導你完成基本設定：

1. **基本資訊**：設定 slug（網址識別碼，3-50 字元）、Entity 類型、名稱和描述
2. **聯絡資訊**：設定 domain 和語系
3. **驗證指引**：說明如何進行 DNS 驗證

Slug 設定時系統會即時檢查可用性。若 slug 為保留字，可提出認領申請。

## Entity 管理 {#entity}

Entity 是你在 AIDP 協定中的身份。每個 Entity 代表一個獨立的組織或個人，擁有唯一的 AIDP ID。

### Entity 類型

| 類型 | 說明 |
|------|------|
| business | 商業實體 |
| organization | 非營利組織 |
| individual | 個人 |
| government | 政府機構 |
| academic | 學術機構 |
| media | 媒體機構 |
| bot | 機器人 / AI Agent |

### 基本資料

- **名稱**（支援多語系，依 locale 設定不同語言的顯示名稱）
- **描述**
- **分類標籤**
- **聯絡方式**（支援多筆，類型：phone、email、other，可自訂標籤）
- **Domain**（已驗證的 domain 會被鎖定，不可修改）
- **Locale**（主要語系）

建立完成後，系統會分配唯一的 AIDP ID，格式如 `urn:aidp:entity:sakura-ramen-pdx`。

### 市場範圍

在 Entity 編輯頁面可設定市場範圍（Market），定義營運地區：

- **Global**：全球可用（預設，不設定即為此值）
- **Regional**：限定地區，需指定 ISO 國碼（如 JP、TW、US）
- **Online only**：僅線上服務

此設定為 optional，不設定不影響現有功能。Content 可設定自己的 market 覆蓋 Entity 的預設值。

### 匯出

Entity 資料可在編輯頁面匯出為 JSON 檔案，方便備份或遷移。

### 擁有權與生命週期

Entity 頁面的 Danger Zone 提供擁有權變更與生命週期操作，不同角色看到的選項不同：

- **轉移擁有權（僅 owner）**：從現有 admin 或 editor 中選一位作為新擁有者。轉移後原擁有者降為 admin。
- **解散 Entity（僅 owner）**：需輸入完整 aidp_id 確認，避免誤操作。解散後 14 天內僅原擁有者可還原或以相同 aidp_id / domain 重新建立。
- **離開 Entity（非 owner 成員）**：放棄個人對此 entity 的存取，其他成員仍可繼續使用。Owner 不可直接離開，須先轉移擁有權或解散 entity。

### 解散後的還原與重建

解散後，若您以原擁有者身份回到儀表板，系統會顯示還原 banner：

- **還原**：將 entity 回復到解散前狀態，內容、驗證、directives 等資料一併回復。
- **重新建立（空）**：以相同 aidp_id 建立新的空白 entity，原資料不保留。

14 天冷卻期結束後 banner 失效，slug 與 domain 將公開釋出。

### Slug / Domain 冷卻期

為避免假冒與意外搶註，解散後的 slug 與 domain 進入 14 天冷卻期：

- 冷卻期間，他人嘗試建立同名 slug 或綁定同 domain 會看到提示，說明冷卻結束時間。
- 原擁有者不受限制，可立即重建。
- 冷卻期結束後 slug 與 domain 自動開放給所有人使用。

## 驗證 {#verification}

驗證是建立信任的核心步驟。通過驗證可提升 Entity 的信任等級，讓 AI 系統更傾向引用你的資訊。

### DNS 驗證

1. 在驗證頁面點擊「開始驗證」
2. 系統產生一筆 DNS TXT record，將其複製
3. 到你的域名 DNS 設定中加入該 TXT record
4. 回到驗證頁面點擊「檢查驗證」
5. 通過後 trust_level 升級為 `verified_domain`

驗證頁面會顯示所有驗證嘗試的歷史記錄，包含驗證方法、狀態和時間。

### 信任分數

AIDP 協定使用多個維度的分數來衡量 Entity 的可信度：

| 分數 | 範圍 | 說明 |
|------|------|------|
| trust_score | 0-1 | 基於身份驗證方法計算 |
| consistency_score | 0-1 | 基於內容與外部來源一致性 |
| integrity_score | 0-1 | 基於社群回饋計算 |

分數越高，AI 系統越可能優先採用你的資訊。詳細的信任機制請見 [Verification 規範](/spec/verification)。

## 內容管理 {#content}

內容是你透過 AIDP 協定向 AI 系統傳遞的核心資訊。

### 內容類型

SpeakSpec 支援 11 種內容類型：

| 類型 | 說明 |
|------|------|
| service | 服務 |
| product | 產品 |
| menu_item | 菜單項目 |
| faq | 常見問答 |
| article | 文章 |
| event | 活動 |
| announcement | 公告 |
| person | 人物 |
| policy | 政策 |
| dataset | 資料集 |
| media | 媒體 |

### 建立內容

建立內容時需填寫：

- **Content ID**：內容識別碼，例如 `signature-ramen`
- **類型**：從 11 種類型中選擇
- **結構化資料**：依內容類型而異的欄位（名稱、描述、價格等）
- **標籤**：用於分類和搜尋的關鍵字

建立頁面支援兩種模式：
- **表單模式**：使用結構化表單填寫欄位
- **JSON 匯入模式**：直接貼入 JSON 快速建立，適合從 AI 產生的 JSON 複製貼上

### Content Variants（變體）

當同一產品或內容在不同地區有不同規格時，可從 base content 建立 variant：

1. 在 base content 編輯頁面點擊「建立變體」
2. 系統自動鎖定 type，預填 content_id
3. 設定 variant 的市場範圍（availability + regions）
4. 每個欄位可選擇「繼承」或「覆寫」：
   - **繼承**：沿用 base 的值，不寫入 variant
   - **覆寫**：點擊後預填 base 值，直接在上面修改

儲存時只會記錄被覆寫的欄位作為 `variant_delta`，AI Agent 會自動合併 base 和 variant 資料。

內容列表中，variant 會標記所屬的 base content，base content 旁會顯示 variant 數量。

### 版本控制

每次編輯內容時，系統會要求填寫變更原因。所有變更都會記錄在版本歷史中，你可以：

- 查看每個版本的變更原因和時間
- 還原至先前的版本

### 草稿與發佈

內容支援草稿/發佈流程。草稿狀態的內容不會出現在公開 API 的回應中，可在準備好後再發佈。

### 協作編輯鎖

當有其他團隊成員正在編輯同一筆內容時，系統會顯示鎖定狀態，避免多人同時編輯造成衝突。

### Preview Token

草稿內容可以透過 Preview Token 分享給外部審閱者。在內容編輯頁面產生 token 後，透過 `/preview/:token` URL 即可預覽草稿內容，不需要登入。Token 有時效性。

### 內容級別連結

在內容編輯頁面可以綁定或解除連結，將行動連結（CTA）與特定內容關聯。

## Directives 設定 {#directives}

Directives 是 AIDP 協定的核心功能，讓你精確控制 AI 如何呈現你的資訊。可在 Entity 層級或個別內容層級設定。

### 身份控制

| 指令 | 說明 |
|------|------|
| preferred_name | AI 應使用的名稱 |
| never_call | 禁止 AI 使用的名稱（可設定多個） |

例如：餐廳希望 AI 稱呼為「Sakura Ramen」而非其他變體，可設定 preferred_name。

若身份設定被平台標記審查，可提交 evidence URL 進行申訴。

### 回應規則

| 指令 | 說明 |
|------|------|
| must_include | AI 回應時必須包含的資訊（可設定多個） |
| must_not_say | AI 絕不能說的內容（可設定多個） |
| tone | 語氣設定：professional、friendly、casual、formal |
| formality | 正式程度：high、medium、low |

### 歸屬與新鮮度

| 指令 | 說明 |
|------|------|
| require_source_link | 要求 AI 附上來源連結 |
| canonical_url | 官方網址（已驗證 domain 時會自動提示） |
| default_ttl | 內容有效期限（秒），過期後 AI 應重新取得 |
| stale_action | 過期處理方式：serve_stale、omit、warn |

### 存取控制

| 指令 | 說明 |
|------|------|
| allow_training | 是否允許用於 AI 模型訓練 |
| allow_caching | 是否允許快取 |
| allow_derivative | 是否允許衍生使用 |
| require_attribution | 是否要求標明來源 |

這些設定會自動轉換為回應中的 IETF AIPREF 標頭，讓 AI 系統能夠程式化地遵守你的授權規定。

## 連結管理 {#links}

SpeakSpec 提供 Entity 層級和 Content 層級的行動連結（CTA）管理。

### 建立連結

建立連結時需設定：

- **Target URL**：目標網址
- **Label**：連結標籤（選填）
- **Scope**：Entity 層級或綁定至特定內容
- **Rel 類型**：action（行動連結）、source（來源連結）、related（相關連結）
- **Purpose**：用途分類 -- booking、menu、purchase、contact、info、download、apply、other
- **Sponsored**：是否為贊助連結（確保 AI 系統能正確揭露商業關係）

### 篩選與管理

連結列表支援依範圍篩選：全部、Entity 層級、Content 層級。每個連結可進行：

- 複製短網址
- 編輯標籤、範圍、贊助標記和啟用狀態
- 刪除

### 追蹤機制

所有連結透過 SpeakSpec redirect proxy（`/r/:hash`）運作，自動追蹤點擊次數和來源。重導向時會在目標 URL 附加 `aidp_ref` 和 `aidp_eid` 參數，無需額外設定追蹤碼。

## 輸出預覽 {#output}

SpeakSpec 的核心優勢之一：一份資料自動產出多種格式，覆蓋不同的 AI 和搜尋引擎需求。

### 輸出格式

| 格式 | 用途 |
|------|------|
| AIDP JSON | 完整的 AIDP 協定文件，供支援 AIDP 的系統讀取 |
| Schema.org JSON-LD | SEO 優化的結構化資料，提升搜尋引擎可見度 |
| llms.txt | AI 導航用的 Markdown 格式，適合大型語言模型直接讀取 |
| Open Graph | 社群分享用的 meta tags，優化社群平台預覽 |

輸出預覽頁面可切換各格式檢視輸出內容，並提供複製功能方便匯出。

### 嵌入連結

預覽頁面同時提供你的 Entity 公開 URL 和 HTML `<link>` 標籤程式碼，方便嵌入至你的網站：

```html
<link rel="aidp" href="https://api.speakspec.com/public/entity/your-entity" />
```

### MCP Endpoint

除了 HTTP API，SpeakSpec 也提供 MCP（Model Context Protocol）端點，讓 AI Agent 能透過標準化的 JSON-RPC 協定直接存取你的資料。詳見 [MCP 整合](/developer/mcp-integration)。

## Webhooks {#webhooks}

Webhooks 讓你在特定事件發生時自動通知外部系統。

### 支援的事件

| 事件 | 觸發時機 |
|------|----------|
| `entity.updated` | Entity 資料被更新 |
| `content.created` | 新增內容 |
| `content.published` | 內容被發佈 |
| `content.deleted` | 內容被刪除 |
| `verification.completed` | 驗證完成 |
| `member.joined` | 新成員加入團隊 |

### 管理 Webhooks

- **建立**：設定接收 URL 和訂閱的事件類型
- **測試**：發送測試 payload 到目標 URL
- **啟用/停用**：暫停或恢復 webhook 的投遞
- **刪除**：移除不需要的 webhook
- **投遞歷史**：查看每個 webhook 的投遞記錄，包含事件類型、HTTP 回應碼和投遞狀態（delivered、failed、pending）

## Analytics {#analytics}

SpeakSpec 提供 AI 時代的全新數據分析維度。

### 總覽指標

儀表板首頁顯示四個核心指標卡片：

- **總曝光次數**：Entity 被 AI 系統讀取的總次數
- **本週曝光**：近 7 天的曝光次數
- **MCP 佔比**：透過 MCP 協定存取的比例
- **連結點擊**：透過追蹤連結產生的點擊次數

### 詳細分析

Analytics 頁面提供：

- **日期範圍篩選**：自訂查詢期間（預設 30 天）
- **每日趨勢圖**：曝光次數的時間變化
- **Agent 分佈**：哪些 AI 系統在讀取你的資料（如 ChatGPT、Claude、Gemini 等）
- **內容排行**：最常被 AI 引用的內容項目

### 用量監控

儀表板首頁同時顯示目前方案的用量狀態：

- 成員數量
- 內容數量
- 連結數量

用量條會以顏色標示使用程度（綠色 < 70%、黃色 70-90%、紅色 > 90%）。

## Import/Export {#import-export}

SpeakSpec 支援 JSON 格式的資料匯入匯出（格式版本 v1.1）。

### 匯出

在 Entity 編輯頁面點擊匯出按鈕，即可下載完整的 Entity JSON 檔案，包含 market、variant 等所有欄位。

### 批次匯入

1. 在匯入頁面選擇 JSON 檔案
2. 系統顯示檔案中包含的內容數量和 variant 數量
3. 點擊「Dry Run」預覽匯入結果：會顯示將建立的內容數量、連結數量，以及可能的警告和錯誤
4. 確認無誤後點擊「確認匯入」執行

匯入支援 v1.0 和 v1.1 格式（向下相容）。包含 `variant_of` 的內容會自動排序，確保 base content 先建立。

### 單筆 JSON 匯入

在「建立內容」頁面切換到「JSON 匯入」模式，可直接貼入 JSON 快速建立單筆內容。適合的流程：

1. 請 AI 幫你產生 content JSON
2. 複製 AI 產生的 JSON
3. 在 JSON 匯入模式貼上
4. 預覽確認後一鍵建立

也支援包含 `variant_of` 和 `variant_delta` 的 variant JSON。

Dry Run 功能讓你在正式匯入前預覽變更，避免意外覆蓋現有資料。

## Slug 管理 {#slug}

Slug 是 Entity 在 URL 中的識別碼（例如 `sakura-ramen-pdx`）。

- **Onboarding 時設定**：建立 Entity 時指定初始 slug
- **變更 slug**：在設定頁面可以變更 slug，系統會即時檢查可用性（最少 3 字元）
- **保留 slug 認領**：若 slug 被系統保留，可提出認領申請（reservation_claim）
- **已被使用的 slug**：若 slug 已被他人使用，可提出爭議（dispute）

## Entity Badge {#badge}

SpeakSpec 提供可嵌入的信任驗證徽章，讓你在自己的網站上展示驗證狀態。

### 徽章內容

徽章為 200x60px 的小型元件，包含：

- 盾牌圖示（依驗證狀態顯示不同樣式）
- Entity 名稱
- 信任等級標籤
- SpeakSpec 品牌標識

### 嵌入方式

在輸出預覽或連結管理頁面可取得嵌入程式碼，支援：

- **HTML**：完整的 `<a>` 標籤包含圖片
- **Markdown**：徽章連結語法

徽章頁面位於 `/entity/badge/:aidpId`，點擊後導向 Entity 的公開頁面。

## API Keys {#api-keys}

在設定頁面可以建立和管理 API Keys，用於程式化存取平台管理 API。

### 建立 API Key

- **名稱**：自訂名稱方便識別
- **Scope**：Read（唯讀）或 Write（讀寫）
- **有效期限**：永久、30 天、90 天、365 天

建立成功後系統會顯示完整的 API Key，此時需立即複製保存，之後將無法再次查看完整金鑰。

### 管理

API Key 列表顯示每個金鑰的：

- 名稱和金鑰前綴
- Scope 標籤
- 最後使用時間
- 撤銷按鈕

## 團隊成員 {#members}

SpeakSpec 支援多人協作管理 Entity。

### 角色權限

| 角色 | 權限 |
|------|------|
| owner | 完整權限，包括刪除 Entity、管理所有成員角色、轉移所有權 |
| admin | 管理內容、Directives、邀請成員（不含 owner 角色），不可刪除 Entity |
| editor | 管理內容和 Directives，不可管理成員 |

### 邀請流程

1. 在團隊成員頁面輸入被邀請人的 Email
2. 選擇角色（owner 可指定 admin 或 editor；admin 只能指定 editor）
3. 系統寄送邀請連結
4. 被邀請人點擊連結完成註冊或登入後加入團隊

### 管理成員

- 變更成員角色（owner 和 admin 可操作）
- 移除成員
- 查看待處理的邀請

## 帳號設定 {#settings}

### 個人資料

- 顯示名稱（可編輯）
- Email（唯讀）

### 密碼管理

- 設定或變更密碼（最少 8 字元）
- 需驗證目前密碼

### 雙重驗證（2FA）

啟用 TOTP 雙重驗證的流程：

1. 在設定頁面點擊啟用 2FA
2. 使用 Authenticator App 掃描 QR Code（或手動輸入密鑰）
3. 輸入 6 位數驗證碼完成啟用

停用時同樣需要輸入驗證碼確認。

### Google 帳號連結

可在設定頁面連結或解除 Google 帳號，連結後可使用 Google OAuth 登入。

## 稽核日誌 {#audit-log}

所有對 Entity 的操作都會被記錄在稽核日誌中。公開的變更歷史可透過 [Public API](/api/public) 的 `/public/entity/:aidpId/history` 端點查詢，包含：

- 操作類型（entity.updated、content.published 等）
- 相關的 Content ID
- 變更原因
- 變更前後的資料
- 時間戳記

稽核日誌確保所有變更都可追溯，也讓 AI Agent 能夠了解資料的更新頻率和可靠性。
