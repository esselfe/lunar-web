import { withTrailingSlash } from 'ufo'

type PageSeo = {
  title?: string
  description?: string
  type?: 'website' | 'article'
}

/** Sets title, description, canonical URL and Open Graph tags for the current page. */
export const usePageSeo = (seo: MaybeRefOrGetter<PageSeo>) => {
  const route = useRoute()
  const { absoluteUrl } = useSiteLinks()

  // With a trailing slash: the URL static hosts serve pages at (`/docs` redirects to `/docs/`).
  const canonical = computed(() => withTrailingSlash(absoluteUrl(route.path)))
  const value = computed(() => toValue(seo))

  useSeoMeta({
    title: () => value.value.title,
    description: () => value.value.description,
    ogTitle: () => value.value.title ?? 'Lunar Linux',
    ogDescription: () => value.value.description,
    ogType: () => value.value.type ?? 'website',
    ogUrl: canonical,
    ogSiteName: 'Lunar Linux',
    twitterCard: 'summary'
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }]
  })
}
