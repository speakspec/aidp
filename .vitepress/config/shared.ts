import { defineConfig } from 'vitepress'

export const shared = defineConfig({
  title: 'AIDP',
  description: 'AI Directive Protocol - 讓你的內容在 AI 時代被正確理解、引用與呈現',

  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#2E7D32' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'AIDP Docs' }],
    ['meta', { property: 'og:image', content: 'https://speakspec.com/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://speakspec.com/og-image.png' }],
  ],

  themeConfig: {
    logo: {
      light: '/logo-fit.svg',
      dark: '/logo-fit-dark.svg',
      alt: 'SpeakSpec',
    },
    siteTitle: '| AIDP',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/speakspec/aidp' },
    ],
  },
})
