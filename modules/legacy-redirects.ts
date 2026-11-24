// Writes a forwarding page at every old WordPress URL in docker/legacy-redirects.conf
// (`/2005/03/07/slug/index.html` → `/news/2005-03-07-slug/`), served as static files, so the old
// links keep working on hosts that can't send redirects (GitHub Pages). nginx answers the same URLs
// with real 301s before it gets to these files. See scripts/lib/legacy-redirects.ts.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { joinURL } from 'ufo'
import { legacyRedirectPage, parseLegacyRedirects } from '../scripts/lib/legacy-redirects'

export default defineNuxtModule({
  meta: { name: 'legacy-redirects' },
  setup(_options, nuxt) {
    const conf = readFileSync(join(nuxt.options.rootDir, 'docker/legacy-redirects.conf'), 'utf8')
    const baseURL = nuxt.options.app.baseURL
    // Read at build time, like the canonical links (NUXT_PUBLIC_SITE_URL overrides the default)
    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || String(nuxt.options.runtimeConfig.public.siteUrl)

    // Not in the build directory, which Nuxt empties after the modules are set up. Named after what
    // goes into the pages: the build may set this module up more than once at the same time, and
    // each run then writes the same files instead of deleting the other's.
    const key = createHash('sha256').update(JSON.stringify([conf, baseURL, siteUrl])).digest('hex').slice(0, 12)
    const dir = join(nuxt.options.rootDir, 'node_modules/.cache/legacy-redirects', key)
    for (const { from, to } of parseLegacyRedirects(conf)) {
      const file = join(dir, from, 'index.html')
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, legacyRedirectPage(joinURL(baseURL, to), joinURL(siteUrl, to)))
    }

    nuxt.options.nitro.publicAssets ||= []
    nuxt.options.nitro.publicAssets.push({ dir, maxAge: 0 })
  }
})
