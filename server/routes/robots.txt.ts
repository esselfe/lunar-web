import { joinURL } from 'ufo'

// Crawlers that collect training data for AI models. They're kept out; search engines and the AI
// assistants' search and on-demand fetchers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
// Claude-User, PerplexityBot, Perplexity-User) are welcome, so the site can still be found and cited.
// Google-Extended also decides whether Gemini may use the site to ground its answers.
const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'Bytespider']

export default defineEventHandler((event) => {
  const { siteUrl, indexable } = useRuntimeConfig(event).public

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  if (!indexable) return 'User-agent: *\nDisallow: /\n'
  return `${AI_TRAINING_BOTS.map(bot => `User-agent: ${bot}\nDisallow: /\n`).join('\n')}
User-agent: *
Allow: /

Sitemap: ${joinURL(siteUrl, 'sitemap.xml')}
`
})
