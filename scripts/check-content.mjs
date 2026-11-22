#!/usr/bin/env node
// Validates the Markdown in content/ before a build:
// - required frontmatter (title, description; `date` as YYYY-MM-DD for news, matching the file name)
// - internal links point at existing content pages (anchors are checked later by check-links)
// - no relative links (`../foo`), which break depending on the URL's trailing slash

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative, sep } from 'node:path'
import process from 'node:process'

const contentDir = 'content'
const walk = dir => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name)
  return statSync(full).isDirectory() ? walk(full) : [full]
})

const routeOf = (file) => {
  const route = '/' + relative(contentDir, file).split(sep).join('/').replace(/\.md$/, '')
  return route.replace(/\/index$/, '') || '/'
}

const files = walk(contentDir).filter(file => file.endsWith('.md'))
const routes = new Set(files.map(routeOf))
// Pages that are not Markdown but exist in the built site.
const extraRoutes = new Set(['/', '/news', '/modules', '/rss.xml', '/sitemap.xml', '/robots.txt', '/search.json', '/favicon.ico'])

const errors = []

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1]
  if (!frontmatter) {
    errors.push(`${file}: missing frontmatter`)
    continue
  }

  const field = name => frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '')
  for (const name of ['title', 'description']) {
    if (!field(name)) errors.push(`${file}: missing \`${name}\``)
  }
  if (file.startsWith(join(contentDir, 'news'))) {
    const date = field('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`${file}: \`date\` must be YYYY-MM-DD (got ${date ?? 'nothing'})`)
    // News files are named YYYY-MM-DD-slug.md, so they list in date order; keep the two in step.
    else if (!basename(file).startsWith(`${date}-`)) errors.push(`${file}: file name must start with its date (${date}-)`)
  }

  // Ignore fenced code blocks when looking for links.
  const body = source.slice(frontmatter.length + 8).replace(/```[\s\S]*?```/g, '')
  for (const [, target] of body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(https?:|mailto:|irc:|ircs:|#)/.test(target)) continue
    if (!target.startsWith('/')) {
      errors.push(`${file}: relative link "${target}" — use an absolute path like /docs/...`)
      continue
    }
    const path = target.split('#')[0].replace(/\/$/, '') || '/'
    // Images and other static files live in public/
    if (existsSync(join('public', path)) && statSync(join('public', path)).isFile()) continue
    if (!routes.has(path) && !extraRoutes.has(path)) errors.push(`${file}: link to "${target}" — no page at ${path}`)
  }
}

if (errors.length) {
  for (const error of errors) console.error(`✖ ${error}`)
  console.error(`\n${errors.length} content problem(s) in ${files.length} files.`)
  process.exit(1)
}

console.log(`✔ ${files.length} content files OK.`)
