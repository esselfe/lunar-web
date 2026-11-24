import { queryCollection } from '@nuxt/content/server'
import { joinURL, withTrailingSlash } from 'ufo'

export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  const articles = await queryCollection(event, 'news').order('date', 'DESC').all()

  const items = articles.map((article) => {
    const url = withTrailingSlash(joinURL(siteUrl, article.path))
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>
    </item>`
  })

  const lastBuildDate = articles[0] ? new Date(articles[0].date).toUTCString() : new Date().toUTCString()

  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lunar Linux News</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Latest news and updates from the Lunar Linux project</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(joinURL(siteUrl, 'rss.xml'))}" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`
})
