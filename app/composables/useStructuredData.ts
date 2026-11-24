import { withTrailingSlash } from 'ufo'

type JsonLd = Record<string, unknown>

/**
 * Adds schema.org structured data (JSON-LD) to the page. Describe only what the page shows.
 * `<` is escaped so no value can close the script tag early.
 */
export const useStructuredData = (data: MaybeRefOrGetter<JsonLd>) => {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({ '@context': 'https://schema.org', ...toValue(data) }).replace(/</g, '\\u003c')
    }]
  })
}

/** Absolute page URL as the canonical link has it (site URL, trailing slash) */
export const usePageUrl = () => {
  const { absoluteUrl } = useSiteLinks()
  return (path: string) => withTrailingSlash(absoluteUrl(path))
}

/** The project as an organization; `@id` lets other pages refer to it */
export const useOrganization = () => {
  const { absoluteUrl } = useSiteLinks()
  const pageUrl = usePageUrl()
  return {
    '@type': 'Organization',
    '@id': `${pageUrl('/')}#organization`,
    'name': SITE_NAME,
    'url': pageUrl('/'),
    'logo': absoluteUrl(LOGO_PATH),
    'sameAs': PROFILES
  }
}
