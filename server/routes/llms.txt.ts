import { queryCollection } from '@nuxt/content/server'
import { joinURL, withTrailingSlash } from 'ufo'

type Doc = { title: string, description: string, path: string, order?: number }

/**
 * A Markdown index of the site for language models and coding agents (llmstxt.org): what Lunar
 * is, then every docs page with its description, in sidebar order. Prerendered to /llms.txt.
 */
export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  const url = (path: string) => withTrailingSlash(joinURL(siteUrl, path))
  const docs: Doc[] = await queryCollection(event, 'docs').select('title', 'description', 'path', 'order').all()

  // Sidebar order (as buildDocsTree in app/composables/useDocsNavigation.ts): by `order`, then title
  const byOrderThenTitle = (a: Doc, b: Doc) =>
    (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) || a.title.localeCompare(b.title)
  const childrenOf = (parent: string) => docs
    .filter(doc => doc.path.startsWith(`${parent}/`) && !doc.path.slice(parent.length + 1).includes('/'))
    .sort(byOrderThenTitle)
  const lines = (parent: string, depth: number): string[] => childrenOf(parent).flatMap(doc => [
    `${'  '.repeat(depth)}- [${doc.title}](${url(doc.path)}): ${doc.description}`,
    ...lines(doc.path, depth + 1)
  ])

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `# Lunar Linux

> Lunar Linux is a source-based distribution: build your system exactly how you want it, with simple tools and a friendly community. Packages are built from source by the \`lin\` command, from modules in the moonbase.

## Documentation

${lines('/docs', 0).join('\n')}

## More

- [Download](${url('/download')}): installer images, older releases and the source behind them
- [Modules](${url('/modules')}): every module in the moonbase, with versions and dependencies
- [News](${url('/news')}): announcements from the Lunar Linux team ([RSS](${joinURL(siteUrl, 'rss.xml')}))
`
})
