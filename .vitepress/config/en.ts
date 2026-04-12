import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const en: LocaleSpecificConfig<DefaultTheme.Config> = {
  lang: 'en',
  description: 'AI Directive Protocol - Let AI correctly understand, cite, and present your content',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/en/guide/what-is-aidp', activeMatch: '/en/guide/' },
      { text: 'Spec', link: '/en/spec/overview', activeMatch: '/en/spec/' },
      { text: 'Developer', link: '/en/developer/integration', activeMatch: '/en/developer/' },
      { text: 'API Reference', link: '/en/api/', activeMatch: '/en/api/' },
      {
        text: 'SpeakSpec',
        items: [
          { text: 'Website', link: 'https://speakspec.com' },
          { text: 'Dashboard', link: 'https://speakspec.com/dashboard' },
        ],
      },
    ],

    sidebar: {
      '/en/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'What is AIDP', link: '/en/guide/what-is-aidp' },
            { text: 'Getting Started', link: '/en/guide/getting-started' },
            { text: 'SpeakSpec Platform Guide', link: '/en/guide/speakspec-guide' },
          ],
        },
      ],

      '/en/spec/': [
        {
          text: 'Protocol Core',
          items: [
            { text: 'Overview', link: '/en/spec/overview' },
            { text: 'Document Structure', link: '/en/spec/document-structure' },
            { text: 'Entity', link: '/en/spec/entity' },
            { text: 'Verification', link: '/en/spec/verification' },
            { text: 'Content', link: '/en/spec/content' },
            { text: 'Directives', link: '/en/spec/directives' },
            { text: 'Extensions', link: '/en/spec/extensions' },
            { text: 'Transport', link: '/en/spec/transport' },
          ],
        },
        {
          text: 'Behavior & Governance',
          items: [
            { text: 'Agent Behavior', link: '/en/spec/agent-behavior' },
            { text: 'Community Integrity', link: '/en/spec/community' },
            { text: 'Output Formats', link: '/en/spec/output-formats' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Full Example', link: '/en/spec/full-example' },
            { text: 'Versioning', link: '/en/spec/versioning' },
            { text: 'Changelog', link: '/en/spec/changelog' },
            { text: 'Roadmap', link: '/en/spec/roadmap' },
            { text: 'Appendix A: MIME Types', link: '/en/spec/appendix-mime' },
            { text: 'Appendix B: URI Schemes', link: '/en/spec/appendix-uri' },
          ],
        },
      ],

      '/en/developer/': [
        {
          text: 'Developer Guide',
          items: [
            { text: 'Integration Overview', link: '/en/developer/integration' },
            { text: 'MCP Integration', link: '/en/developer/mcp-integration' },
            { text: 'REST API Integration', link: '/en/developer/rest-api' },
            { text: 'Static File Deployment', link: '/en/developer/static-file' },
            { text: 'Import & Export Format', link: '/en/developer/import-export' },
          ],
        },
      ],

      '/en/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/en/api/' },
            { text: 'Public API', link: '/en/api/public' },
            { text: 'MCP API', link: '/en/api/mcp' },
          ],
        },
      ],
    },

    outline: {
      label: 'On this page',
      level: [2, 3],
    },

    lastUpdated: {
      text: 'Last updated',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },

    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Dark mode',

    footer: {
      message: 'AIDP spec is released under CC-BY-4.0',
      copyright: 'Copyright 2024-2026 SpeakSpec',
    },

    search: {
      provider: 'local',
    },
  },
}
