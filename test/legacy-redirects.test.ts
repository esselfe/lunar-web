import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { legacyRedirectPage, parseLegacyRedirects } from '../scripts/lib/legacy-redirects'

// docker/legacy-redirects.conf sends the old WordPress URLs to their new pages (nginx 301s, and the
// forwarding pages the build writes for GitHub Pages). Renaming or removing a news file would quietly
// turn its redirect into a 404, so check them all.
const conf = readFileSync('docker/legacy-redirects.conf', 'utf8')
const rules = parseLegacyRedirects(conf)
const news = rules.filter(({ from }) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(from))

describe('legacy redirects', () => {
  it('has a redirect for every imported WordPress post and /downloads/, and nothing else', () => {
    expect(news.length).toBe(56)
    expect(rules.map(rule => rule.from)).toContain('/downloads/')
    expect(rules.length).toBe(57)
    expect(conf.match(/^\s*(location|if|rewrite|return)\b/gm)?.length).toBe(57)
  })

  it.each(news.map(({ from, to }) => [from, to]))('%s → %s exists', (_, to) => {
    expect(to).toMatch(/^\/news\/\d{4}-\d{2}-\d{2}-[^/]+\/$/)
    expect(existsSync(`content${to.slice(0, -1)}.md`)).toBe(true)
  })

  it('sends /downloads/ to the download page', () => {
    expect(rules.find(({ from }) => from === '/downloads/')?.to).toBe('/download/')
  })

  it('writes a forwarding page with a canonical link and a plain link', () => {
    const html = legacyRedirectPage('/lunar/news/a-b/', 'https://example.org/lunar/news/a-b/')
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/lunar/news/a-b/">')
    expect(html).toContain('<link rel="canonical" href="https://example.org/lunar/news/a-b/">')
    expect(html).toContain('<a href="/lunar/news/a-b/">')
  })
})
