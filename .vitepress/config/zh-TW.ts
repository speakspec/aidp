import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const zhTW: LocaleSpecificConfig<DefaultTheme.Config> = {
  lang: 'zh-TW',
  description: 'AI Directive Protocol - 讓你的內容在 AI 時代被正確理解、引用與呈現',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/what-is-aidp', activeMatch: '/guide/' },
      { text: '協議規範', link: '/spec/overview', activeMatch: '/spec/' },
      { text: '開發者', link: '/developer/integration', activeMatch: '/developer/' },
      { text: 'API 參考', link: '/api/', activeMatch: '/api/' },
      {
        text: 'SpeakSpec',
        items: [
          { text: '官網', link: 'https://speakspec.com' },
          { text: '管理後台', link: 'https://speakspec.com/dashboard' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: 'AIDP 是什麼', link: '/guide/what-is-aidp' },
            { text: '快速開始', link: '/guide/getting-started' },
            { text: 'SpeakSpec 平台指南', link: '/guide/speakspec-guide' },
          ],
        },
      ],

      '/spec/': [
        {
          text: '協議核心',
          items: [
            { text: '總覽', link: '/spec/overview' },
            { text: '文件結構', link: '/spec/document-structure' },
            { text: 'Entity', link: '/spec/entity' },
            { text: 'Verification', link: '/spec/verification' },
            { text: 'Content', link: '/spec/content' },
            { text: 'Directives', link: '/spec/directives' },
            { text: 'Extensions', link: '/spec/extensions' },
            { text: 'Transport', link: '/spec/transport' },
          ],
        },
        {
          text: '行為與治理',
          items: [
            { text: 'Agent 行為指南', link: '/spec/agent-behavior' },
            { text: '社群完整性', link: '/spec/community' },
            { text: '輸出格式', link: '/spec/output-formats' },
          ],
        },
        {
          text: '參考',
          items: [
            { text: '完整範例', link: '/spec/full-example' },
            { text: '版本演進', link: '/spec/versioning' },
            { text: 'Roadmap', link: '/spec/roadmap' },
            { text: '附錄 A: MIME Types', link: '/spec/appendix-mime' },
            { text: '附錄 B: URI Schemes', link: '/spec/appendix-uri' },
          ],
        },
      ],

      '/developer/': [
        {
          text: '開發者指南',
          items: [
            { text: '整合總覽', link: '/developer/integration' },
            { text: 'MCP 整合', link: '/developer/mcp-integration' },
            { text: 'REST API 串接', link: '/developer/rest-api' },
            { text: '靜態檔案部署', link: '/developer/static-file' },
            { text: '匯入匯出格式', link: '/developer/import-export' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API 參考',
          items: [
            { text: '總覽', link: '/api/' },
            { text: 'Public API', link: '/api/public' },
            { text: 'MCP API', link: '/api/mcp' },
          ],
        },
      ],
    },

    outline: {
      label: '本頁目錄',
      level: [2, 3],
    },

    lastUpdated: {
      text: '最後更新',
    },

    docFooter: {
      prev: '上一頁',
      next: '下一頁',
    },

    returnToTopLabel: '返回頂部',
    sidebarMenuLabel: '選單',
    darkModeSwitchLabel: '深色模式',

    footer: {
      message: 'AIDP 協議以 CC-BY-4.0 授權釋出',
      copyright: 'Copyright 2024-2026 SpeakSpec',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜尋', buttonAriaLabel: '搜尋' },
          modal: {
            displayDetails: '顯示詳情',
            resetButtonTitle: '清除',
            backButtonTitle: '返回',
            noResultsText: '沒有找到結果',
            footer: { selectText: '選擇', navigateText: '切換', closeText: '關閉' },
          },
        },
      },
    },
  },
}
