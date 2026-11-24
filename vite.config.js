import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolveSiteUrl } from './site.config.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = resolveSiteUrl(env.VITE_SITE_URL)

  return {
    plugins: [
      react(),
      {
        // Fill %SITE_URL% in index.html (canonical, OG/Twitter, JSON-LD)
        name: 'site-url',
        transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
      },
    ],
  }
})
