// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { joinURL, withTrailingSlash } from 'ufo'

// Path the site is served from, e.g. '/' (production) or '/lunar-www/' (GitHub Pages preview).
// Override at build time: NUXT_APP_BASE_URL=/lunar-www/ yarn generate
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

// Every markdown file under content/ becomes a page. List them all for prerendering so pages
// that are only reachable through client-side pagination or search still get generated.
const contentRoutes = (dir = 'content'): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return contentRoutes(full)
    if (!entry.name.endsWith('.md')) return []
    const route = '/' + relative('content', full).split(sep).join('/').replace(/\.md$/, '')
    return [route.replace(/\/index$/, '') || '/']
  })

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    // Forwarding pages at the old WordPress URLs (docker/legacy-redirects.conf)
    './modules/legacy-redirects'
  ],

  // Register components by file name only (`<DocCard>`, not `<UiDocCard>`).
  components: [{ path: '~/components', pathPrefix: false }],

  devtools: { enabled: true },

  app: {
    baseURL,
    head: {
      htmlAttrs: {
        lang: 'en',
        class: 'bg-gray-950'
      },
      meta: [
        // The site is dark by design: tell browsers (scrollbars, form controls) ...
        { name: 'color-scheme', content: 'dark' },
        // ... and stop the Dark Reader extension from re-theming it (it darkens the moon and light accents).
        { name: 'darkreader-lock', content: 'true' }
      ],
      link: [
        // The logo's mark without the "Lunar Linux" text. Browsers that take SVG use it; the rest use the ICO
        // (sizes="32x32" stops Chrome from preferring the ICO over the SVG).
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'icon', href: `${baseURL}favicon.ico`, sizes: '32x32' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Lunar Linux News', href: `${baseURL}rss.xml` }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: 'github-dark-default',
          langs: ['bash', 'shell', 'sh', 'ini', 'diff', 'make', 'c', 'json', 'yaml', 'typescript', 'vue']
        }
      }
    },
    renderer: {
      anchorLinks: { h2: true, h3: true, h4: true }
    },
    experimental: {
      // Node's built-in SQLite: no native module to compile (simpler Docker/CI builds).
      sqliteConnector: 'native'
    }
  },

  runtimeConfig: {
    public: {
      // Public URL of the site root, including any sub-path. Used for RSS, sitemap and canonical links.
      // Override at build time: NUXT_PUBLIC_SITE_URL=https://example.org/lunar-www/
      siteUrl: 'https://lunar-linux.org/',
      // Set NUXT_PUBLIC_INDEXABLE=false for previews: robots.txt disallows everything and pages get noindex.
      indexable: true
    }
  },

  // Keep CSS in external files in static builds.
  features: {
    inlineStyles: false
  },

  // Pages are built as `docs/index.html`, so static hosts serve them at `/docs/` and redirect `/docs`
  // there. Links use the slash form too (canonical URLs and the sitemap do the same), so no click,
  // crawl or canonical goes through a redirect.
  experimental: {
    defaults: {
      nuxtLink: { trailingSlash: 'append' }
    }
  },

  compatibilityDate: '2026-11-20',

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      // A broken internal link makes the crawler hit a 404 and fails the build.
      failOnError: true,
      // Prefixed with the base URL, and pages with a trailing slash, so they match the links the
      // crawler finds (no duplicate renders).
      routes: [
        ...['/rss.xml', '/sitemap.xml', '/robots.txt', '/search.json', '/moonbase-arrivals.json', '/modules/index.json', '/modules/search.json']
          .map(route => joinURL(baseURL, route)),
        ...['/', '/news', '/docs', '/docs/about', ...contentRoutes()]
          .map(route => withTrailingSlash(joinURL(baseURL, route)))
      ]
    }
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    }
  },

  hooks: {
    // Reading time for news articles, in minutes (about 200 words a minute). Parsed files are cached
    // by content: after changing this, delete .data/content to recompute unchanged articles locally.
    'content:file:afterParse': ({ file, content, collection }) => {
      if (collection.name !== 'news') return
      const text = file.body.replace(/^---[\s\S]*?\n---/, '')
      const words = text.split(/\s+/).filter(Boolean).length
      content.readingTime = Math.ceil(words / 200)
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700]
    },
    // The split-flap tiles (main.css) only use the regular weight
    families: [
      { name: 'IBM Plex Mono', weights: [400] }
    ]
  },

  icon: {
    // Bundle the icons the site uses into the client so it never calls the Iconify API at runtime.
    provider: 'none',
    clientBundle: {
      scan: true
    }
  }
})
