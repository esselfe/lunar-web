<template>
  <DocLayout>
    <template #sidebar>
      <DocsSidebar
        :navigation="navigation"
        :current-path="path"
      />
    </template>

    <article>
      <Breadcrumb
        :items="breadcrumbs"
        class="mb-6"
      />

      <header class="mb-8 border-b border-gray-800 pb-6">
        <p
          v-if="page.archived"
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300 uppercase"
        >
          <Icon
            name="ph:archive"
            class="h-4 w-4"
          />
          Archived: historical reference only
        </p>
        <h1 class="text-4xl font-bold text-white">
          {{ page.title }}
        </h1>
        <p
          v-if="page.description"
          class="mt-2 text-lg text-gray-400"
        >
          {{ page.description }}
        </p>
        <p
          v-if="page.lastUpdated"
          class="mt-4 text-sm text-gray-450"
        >
          Last updated: {{ formatDate(page.lastUpdated) }}
        </p>
      </header>

      <ContentRenderer
        :value="page"
        class="prose max-w-none prose-invert prose-a:text-blue-400 prose-a:hover:text-blue-300 prose-pre:border prose-pre:border-gray-700 prose-pre:bg-gray-900"
      />

      <RelatedArticles :articles="relatedArticles" />

      <section
        v-if="page.seeAlso?.length"
        class="mt-8 border-t border-gray-800 pt-8"
      >
        <h2 class="text-xl font-semibold text-white">
          See also
        </h2>
        <ul class="mt-4 space-y-2">
          <li
            v-for="link in page.seeAlso"
            :key="link.path"
          >
            <NuxtLink
              :to="link.path"
              class="text-blue-400 hover:text-blue-300 hover:underline"
            >
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </section>
    </article>

    <template #toc>
      <TableOfContents
        v-if="page.body?.toc?.links?.length"
        :links="page.body.toc.links"
      />
    </template>
  </DocLayout>
</template>

<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'
import type { RelatedDoc } from '~/components/docs/RelatedArticles.vue'
import type { DocNavItem } from '~/composables/useDocsNavigation'

const route = useRoute()
const path = withoutTrailingSlash(route.path)

const { data } = await useAsyncData(`docs:${path}`, () =>
  queryCollection('docs').path(path).first()
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Documentation page not found', fatal: true })
}

const page = computed(() => data.value!)

// Lights up this page on the flight plan (/docs), in this browser only
const { markVisited } = useVisitedDocs()
onMounted(() => markVisited(path))

const { data: navigation } = await useDocsNavigation()

// Page titles by path, so intermediate crumbs show "Package Management" rather than the URL slug.
const breadcrumbs = computed(() => {
  const titles = new Map<string, string>()
  const walk = (items: DocNavItem[]) => items.forEach((item) => {
    titles.set(item.path, item.title)
    walk(item.children)
  })
  walk(navigation.value ?? [])
  return docsBreadcrumbs(path, titles, page.value.title)
})

// Up to three other pages sharing the most tags with this one.
const { data: relatedArticles } = await useAsyncData(`docs-related:${path}`, async (): Promise<RelatedDoc[]> => {
  const tags = page.value.tags ?? []
  if (!tags.length) return []

  const docs = await queryCollection('docs')
    .select('title', 'description', 'path', 'tags', 'category')
    .where('path', '<>', path)
    .all()

  return docs
    .map(doc => ({ doc, score: (doc.tags ?? []).filter(tag => tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, 3)
    .map(({ doc }) => ({ title: doc.title, description: doc.description, path: doc.path, category: doc.category }))
}, { default: () => [] })

usePageSeo({
  title: page.value.title,
  description: page.value.description,
  type: 'article'
})

const organization = useOrganization()
const pageUrl = usePageUrl()
useStructuredData(() => ({
  '@type': 'TechArticle',
  'headline': page.value.title,
  'description': page.value.description,
  'url': pageUrl(path),
  ...(page.value.lastUpdated ? { dateModified: new Date(page.value.lastUpdated).toISOString().slice(0, 10) } : {}),
  'publisher': { '@id': organization['@id'] }
}))
</script>
