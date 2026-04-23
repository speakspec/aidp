---
title: 常見問題
description: SpeakSpec 與 AIDP 的常見問題、審核流程、駁回原因與解決方式
---

# 常見問題（FAQ）

本頁涵蓋使用 SpeakSpec 與 AIDP 協議時最常遇到的問題。搜尋功能位於頁面右上角，支援模糊查找（可容忍少量拼字差異）。

如果這裡找不到你的答案，歡迎透過 [聯絡表單](https://speakspec.com/contact) 告訴我們。

---

## 一、關於 AIDP 與 SpeakSpec

### AIDP 是什麼？

AIDP（AI Directive Protocol）是一套開放標準協議，讓內容擁有者發布結構化資訊供 AI 代理讀取，並透過「指令（directive）」告訴 AI 該如何呈現這些資訊。詳見 [AIDP 是什麼](/guide/what-is-aidp)。

### AIDP 和 schema.org 有什麼不同？

schema.org 描述「這是什麼」（名稱、地址、價格）；AIDP 額外描述「請這樣使用」（禁止使用已停售產品名稱、正式名稱優先、特定地區不適用等指令）。AIDP 與 schema.org **互補**，同一個實體可以同時提供兩種標記。

### SpeakSpec 和 AIDP 是什麼關係？

AIDP 是**開放協議**（CC-BY-4.0）。SpeakSpec 是實作 AIDP 協議的商業平台，提供 Dashboard、驗證、審核、Public API 與 MCP 整合。你可以自己實作 AIDP 或用 SpeakSpec 托管。

### 目前支援哪些語言？

介面與內容雙語支援：**繁體中文、英文**。內容本身可用任意語言（AIDP 的 `locale` 欄位接受任何 BCP-47 語言代碼）。

### AIDP 的版本和 SpeakSpec 網站的版本是兩件事嗎？

是。AIDP 協議版本（目前 `0.1.0`）代表 spec 版本，寫在每份 AIDP 文件的 `$aidp` 欄位；SpeakSpec 網站有另一個獨立的產品版本號，兩者互不連動。

---

## 二、帳號與訂閱

### 可以免費使用嗎？

可以。Free 方案提供基本建立 entity 與 content 的能力，額度限制請見 [方案頁面](https://speakspec.com/pricing)。

### 付費方案有哪些？

目前有 Free、Pro、Enterprise 三個公開方案，以及給早期使用者的 Beta 方案（不公開）。**目前尚未啟用付費金流，顯示的價格僅供參考**；Enterprise 由我們手動開通。

### 如何升級或更換方案？

前往 [Pricing](https://speakspec.com/pricing) 或 Dashboard → 設定 → 方案。Enterprise 需透過 [聯絡表單](https://speakspec.com/contact) 申請。

### 忘記密碼怎麼辦？

在登入頁點「忘記密碼」，輸入 email 後會收到重設連結。連結有效期 30 分鐘。

### 沒收到驗證信或重設信？

請先確認：
1. 垃圾郵件 / 促銷資料夾
2. Email 拼字是否正確（登入後在設定可看到）
3. 信箱供應商是否封鎖 `no-reply@speakspec.com`（可將該地址加入聯絡人）

若仍未收到，[聯絡客服](https://speakspec.com/contact) 並附上註冊使用的 email。

### 如何刪除帳號？

目前支援 **自助刪除**：

1. 登入後進入 Dashboard → **設定（Settings）**
2. 捲到頁面最下方的 **危險操作（Danger Zone）**
3. 點「刪除帳號」，依指示完成驗證：
   - 勾選「我了解此操作不可逆」
   - 再次輸入您的帳號 Email
   - 輸入登入密碼
   - 若已啟用兩步驟驗證，另需輸入 6 位數 TOTP
   - （選填）選擇刪除原因，幫助我們改善產品
4. 送出後，帳號進入 **30 天寬限期**：
   - 所有 entity 立即從公開 API 下架
   - 所有 API Key 立即失效
   - 帳號僅能訪問設定頁以取消刪除
   - 我們會寄發「刪除請求確認」信，並在第 23 天寄發「即將刪除」提醒
5. **若反悔**：30 天內隨時登入，於設定頁或頂部橫幅點「取消刪除」即可復原帳號（entity 需手動重新上架）
6. **30 天後**：系統會自動清除您所有個人資料

若無法登入或需要其他協助，仍可來信 `support@speakspec.com`。

資料處理方式依 [隱私權政策](https://speakspec.com/privacy)：
- 帳號個資於 30 天寬限期結束後清除
- 公開的 AIDP 資料於刪除請求當下立即從 Public API 下架
- 匿名化的使用紀錄依政策最長保留 24 個月

---

## 三、建立 Entity（組織實體）

### Entity 是什麼？

Entity 代表一個組織、品牌、人物或產品。每個 entity 有唯一的 `aidp_id`（例：`speakspec`），這是 AI 代理引用你時的主鍵。

### `aidp_id` 建立後可以改嗎？

**不行**。`aidp_id` 是 AI 代理引用你的永久 ID，一旦建立不可修改。建立前請謹慎考慮。

### 一個帳號可以建幾個 entity？

依方案而定：Free 通常 1 個，Pro 較多，Enterprise 可客製。實際數量請見 Dashboard → 設定 → 方案。

### 個人可以建 entity 嗎？

可以。`entity_type` 可選 `organization`、`person`、`product` 等。個人品牌、獨立創作者、專業人士都適用。

### 如何找到自己已建立的 entity？

登入後 Dashboard 首頁即為當前 entity。若有多個，可在左側切換器切換。

---

## 四、內容（Content）與指令（Directive）

### Content 和 Directive 差在哪？

- **Content**：描述事實。例：產品規格、服務項目、聯絡資訊、媒體素材。
- **Directive**：告訴 AI 該怎麼處理。例：「請用正式全名、不要用舊品牌名」、「此服務僅限台灣地區」。

### Directive 每次更新都要送審嗎？Content 呢？

**不用。** Directive 一般更新直接生效（狀態 `approved`）。只有當系統偵測到**違規字眼或高風險模式**（例：行銷話術、未經驗證的宣稱、誤導性敘述），才會**自動轉為 `flagged` 狀態送人工審核**，這時原本的 Directive 仍維持在最近一次核可的版本，新版在通過審核後才會生效。

**Content 目前沒有審核機制**，儲存後即為最新狀態。

### 審核大概要多久？

一般 1–3 個工作日。複雜案件或需補件會延長。送審後可在 Dashboard 追蹤狀態。

### 送審後可以修改嗎？

送審中（pending_review）無法修改。收到駁回或核准結果後才能再編輯與重送。

### 可以看到歷史版本嗎？

可以。每個 Content 在 Dashboard 有「歷史」分頁，顯示每個版本的 diff；公開頁也提供讀者端的 entity 與 content 變更紀錄。

### 如何撤回送審？

目前不支援自助撤回。請 [聯絡客服](https://speakspec.com/contact) 並附上 entity ID。

---

## 五、驗證（Verification）

### 為什麼要做網域驗證？

驗證可以在你的公開頁面展示「已驗證」徽章，並讓 AI 代理辨識這份資料確實來自網域擁有者。未驗證的 entity 仍可使用，但 AI 可能以較低的信任層級呈現。

### DNS 驗證怎麼做？

1. Dashboard → 驗證 → 選擇「DNS 驗證」並輸入網域
2. 系統給一筆 TXT 紀錄（類似 `aidp-verify=xxxxxxxx`）
3. 登入網域 DNS 管理後台新增該 TXT 紀錄
4. 回 SpeakSpec 點「檢查」

### DNS 驗證多久會完成？

新增 DNS 紀錄後通常數分鐘到數小時（依 DNS propagation）。點「檢查」可手動觸發驗證；若 TXT 紀錄已生效即刻完成。

### 不是 DNS 驗證還有其他方式嗎？

目前 SpeakSpec 主要提供 DNS 驗證。特殊情境（如企業 registration）請透過 [聯絡表單](https://speakspec.com/contact) 詢問。

### 驗證過期了會怎樣？

過期後徽章變灰、AI 端信任層級降低，但資料仍存在。重新送驗即可。

### 驗證失敗可以重送嗎？

可以。駁回後會顯示原因（見下一段），修正後重新送審。

---

## 六、審核與駁回原因

> 以下原因與解釋來自系統內建清單。收到駁回通知時，通知信會以英文附上原因標題與說明；Dashboard 與公開頁則依你的介面語言顯示。

### 6.1 Directive 駁回原因

#### 含行銷話術（`marketing_language`）

**為什麼被駁回**：Directive 屬事實性治理指令，若含行銷宣傳詞彙（例：「業界第一」、「最優質」、「革命性」），會讓 AI 在代表你時輸出帶有偏見或不實的推銷語。

**如何修正**：改以中性、可驗證的描述。把「業界第一的 XX 服務」改為「自 2018 年提供 XX 服務」或「年處理 XX 件案件」。

#### 未經驗證的宣稱（`unverified_claim`）

**為什麼被駁回**：Directive 中包含無法驗證的數據或宣稱（例：「獲得 OOO 認證」、「市占率 60%」），但未附佐證。

**如何修正**：
- 提供可驗證的第三方來源連結（政府登記、公開報告、媒體報導）
- 或改寫為不需佐證的客觀事實
- 或於 Content 標記為「自述資料」而非 Directive

#### 佐證不足 / 連結失效（`insufficient_evidence`）

**為什麼被駁回**：Directive 附上了佐證連結，但連結失效、非公開、或內容不足以支持宣稱。

**如何修正**：
- 確認連結為公開可存取（不需登入）
- 連結內容應直接對應宣稱
- 若為圖片或 PDF，請使用穩定網址（非一次性短網址）

#### 違反平台規範（`policy_violation`）

**為什麼被駁回**：內容違反 SpeakSpec [使用規範](https://speakspec.com/acceptable-use)（例：違法內容、仇恨言論、惡意引導 AI 輸出有害內容）。

**如何修正**：請參閱使用規範並修正。若認為為誤判，請透過 [聯絡表單](https://speakspec.com/contact) 附上 directive ID 申訴。

#### 誤導性內容（`misleading_content`）

**為什麼被駁回**：Directive 可能讓 AI 對使用者產生誤導（例：暗示停業產品仍在售、故意抹除法律揭露、引導 AI 做出你不具備的承諾）。

**如何修正**：以中性描述取代，避免對比競品、避免絕對化措辭；需揭露的資訊以 Content 欄位明述。

#### 其他（`other`）

**為什麼被駁回**：不屬於上述明確類別。Admin 會在駁回通知中說明具體原因。

**如何修正**：依照具體回覆修正。若不清楚，請來信 `support@speakspec.com` 或透過 [聯絡表單](https://speakspec.com/contact) 詢問（系統通知信為**單向寄送**，無法回覆）。

### 6.2 驗證駁回原因

#### 文件模糊或無法閱讀（`document_unreadable`）

**為什麼被駁回**：上傳的登記文件因掃描品質低、拍攝角度歪斜、有反光或遮擋，系統或審核人員無法清楚辨識關鍵欄位。

**如何修正**：
- 使用掃描器而非手機翻拍
- 確保四角完整、文字清晰、無遮擋
- PDF 以 300 DPI 以上輸出；圖檔邊長至少 1600 px

#### 文件已過期（`document_expired`）

**為什麼被駁回**：登記文件的簽發日期已超過我們接受的效期（通常 12 個月內）。

**如何修正**：向原核發機關（政府、商業登記處）取得最新版本的文件再重新送審。

#### 資料與登記不符（`info_mismatch`）

**為什麼被駁回**：送審表單填寫的公司名稱、登記號碼、國家代碼等資訊，與上傳文件或官方登記資料不一致。

**如何修正**：
- 公司名稱必須與登記文件 **完全一致**（含「股份有限公司」、「Ltd.」等後綴）
- 檢查登記號碼是否多字、少字
- 國家代碼（ISO 3166-1 alpha-2，如 `TW`、`US`）需對應登記國

#### 暫不支援此國家／地區（`unsupported_jurisdiction`）

**為什麼被駁回**：該司法管轄區目前不在我們的驗證支援清單。此為平台限制，非文件問題。

**如何修正**：
- 目前支援的國家以 Dashboard 下拉選單為準
- 若你的地區未在清單，請 [聯絡客服](https://speakspec.com/contact) 登記需求；我們會評估加入
- 期間可先以未驗證狀態建立 entity，待地區支援後補驗

#### 疑似偽造文件（`suspected_forgery`）

**為什麼被駁回**：文件經比對判斷具偽造疑慮（例：浮水印錯誤、登記編號格式異常、與公開登記資料不符）。**相關 entity 與帳號會被標記停用**。

**如何修正**：若為誤判，請 [聯絡客服](https://speakspec.com/contact)並提供：
- 原始文件的 PDF 或高解析版本
- 可佐證的第三方來源（例：政府登記處查詢連結）
- 必要時我們會與核發機關協助核實

#### 非官方登記文件（`not_official`）

**為什麼被駁回**：上傳的不是政府或商業登記處核發的正式文件（例：內部公司章程、發票、合約、網站截圖）。

**如何修正**：請提供以下其中一種：
- 商業登記機關核發的登記證明
- 政府財稅單位核發的稅籍資料
- 法院登記處之公司登記摘要
- 相當於上述層級的官方文件

#### 其他（`other`）

**為什麼被駁回**：不屬上述明確類別。請見 Dashboard 駁回說明或通知信之具體內容。

**如何修正**：依具體說明修正。不明白時來信 `support@speakspec.com` 或透過 [聯絡表單](https://speakspec.com/contact)（通知信為單向寄送，請勿直接回覆）。

---

## 七、整合與串接

### 如何在我的網站加 AIDP 連結？

在 `<head>` 加入：

```html
<link rel="aidp" href="https://api.speakspec.com/public/entity/<your-aidp-id>" />
```

AI 代理讀取你的網頁時會順著這個連結取得 AIDP 文件。詳見 [開發者整合](/developer/integration)。

### MCP 是什麼？可以怎麼用？

Model Context Protocol 讓 Claude Desktop、支援 MCP 的代理直接透過 SpeakSpec MCP Server 查詢你的 entity。設定方式見 [MCP 整合](/developer/mcp-integration)。

### Public API 需要 API key 嗎？

- `/public/entity/:aidpId` 等公開讀取路由：**不需要** API key，直接呼叫
- Dashboard API（建立/修改 entity、content、directive）：需要登入或 API key，從 Dashboard → 設定 → API 金鑰建立

### 可以匯出資料或匯入現有 schema.org 嗎？

可以。Dashboard → 輸出（Output）提供四種格式：AIDP JSON、schema.org、llms.txt、OG tags。匯入格式與流程見 [匯入匯出](/developer/import-export)。

### 可以同時發佈到自己的網站和 SpeakSpec 嗎？

可以，建議同時做：SpeakSpec 托管作為權威來源，自己網站用 `<link rel="aidp">` 指回來。AI 代理會以網域驗證後的版本為準。

---

## 八、隱私與資料

### 我的資料會全部公開嗎？

只有標記為 `public` 的 entity、content、directive 會出現在公開 URL（`/public/entity/<aidp_id>`）。草稿、未發布、未通過審核的內容**不會**公開。

### 個人資料（姓名、email）會被公開嗎？

SpeakSpec 帳號本身的 email、登入紀錄不公開。`person` 類型 entity 若你選擇公開，才會出現在公開頁。公開前請確認揭露範圍。

### 刪除帳號後資料會保留多久？

依 [隱私權政策](https://speakspec.com/privacy) §5：
- 帳號個資在刪除後 **30 天內**完成清除
- 公開發布的 AIDP 資料在 **24 小時內**從 Public API 下架
- 匿名化之使用分析／存取紀錄最長保留 **24 個月**

### 隱私合規狀態為何？

SpeakSpec 為全球性平台，依照不同地區的資料保護法規運作，並在隱私權政策中提供常見的資料主體權利（存取、更正、刪除、可攜、撤回同意等，詳見 [Privacy Policy §6](https://speakspec.com/privacy)）。資料跨境傳輸採用適當保護機制（§8）。

隱私相關詢問請寄 `privacy@speakspec.com`；一般客服請用 `support@speakspec.com` 或 [聯絡表單](https://speakspec.com/contact)。

### 會用我的資料訓練 AI 嗎？

**不會**。SpeakSpec 不將你的 content 用於 AI 模型訓練。AIDP 的設計目的是讓你**對外**被 AI 正確呈現，而非成為訓練資料。

---

## 還沒找到答案？

- 技術與整合：[開發者文件](/developer/integration)
- 協議規範：[AIDP Spec](/spec/overview)
- 其他問題：[聯絡我們](https://speakspec.com/contact)
