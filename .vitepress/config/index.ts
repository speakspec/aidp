import { defineConfig } from 'vitepress'
import { shared } from './shared'
import { zhTW } from './zh-TW'
import { en } from './en'

export default defineConfig({
  ...shared,
  locales: {
    root: {
      label: '繁體中文',
      ...zhTW,
    },
    en: {
      label: 'English',
      ...en,
    },
  },
})
