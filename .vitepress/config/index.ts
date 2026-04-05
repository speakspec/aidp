import { defineConfig } from 'vitepress'
import { shared } from './shared'
import { zhTW } from './zh-TW'

export default defineConfig({
  ...shared,
  locales: {
    root: {
      label: '繁體中文',
      ...zhTW,
    },
  },
})
