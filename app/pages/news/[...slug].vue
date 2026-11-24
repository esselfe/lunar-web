<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <Breadcrumb :items="[{ label: 'News', path: '/news' }]" />

      <div class="mt-10 lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-x-12">
        <!-- Reading progress: the moon waxes from new to full as you read (wide screens only) -->
        <aside
          class="hidden lg:block"
          aria-hidden="true"
        >
          <div class="sticky top-28 flex flex-col items-center gap-3 pt-2 text-center">
            <MoonPhaseIcon
              :phase="progress * 0.5"
              class="h-16 w-16"
            />
            <p class="text-xs text-gray-450">
              {{ progress >= 1 ? 'Full moon' : `${article.readingTime ?? 1} min read` }}
            </p>
          </div>
        </aside>

        <article class="min-w-0">
          <header class="max-w-[68ch]">
            <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <MoonPhaseIcon
                :phase="publishedPhase"
                class="h-5 w-5"
              />
              <time
                :datetime="String(article.date)"
                class="text-gray-400 tabular-nums"
              >{{ formatDate(article.date) }}</time>
              <span class="text-indigo-300/70">{{ moonPhaseName(publishedPhase) }}</span>
              <span
                v-if="article.author"
                class="text-gray-400"
              >by {{ article.author }}</span>
              <span
                v-if="article.readingTime"
                class="text-gray-450 lg:hidden"
              >{{ article.readingTime }} min read</span>
            </p>
            <h1 class="mt-5 text-4xl font-bold tracking-[-0.035em] text-balance wrap-break-word text-white sm:text-5xl">
              {{ article.title }}
            </h1>
            <p class="mt-6 text-xl leading-relaxed text-pretty text-gray-300">
              {{ article.description }}
            </p>
          </header>

          <div
            ref="body"
            class="mt-12 max-w-[68ch] border-t border-white/10 pt-10"
          >
            <ContentRenderer
              :value="article"
              class="prose max-w-[68ch] prose-invert sm:prose-lg
                     prose-headings:tracking-tight prose-headings:text-white
                     prose-h2:mt-12 prose-h2:text-2xl
                     prose-p:text-gray-300 prose-li:text-gray-300 prose-li:marker:text-indigo-300/60
                     prose-a:text-indigo-300 prose-a:underline-offset-4 prose-a:hover:text-white
                     prose-strong:text-white
                     prose-blockquote:border-indigo-400/50 prose-blockquote:font-normal prose-blockquote:text-gray-300 prose-blockquote:not-italic
                     prose-code:rounded prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-indigo-200
                     prose-pre:border prose-pre:border-white/10 prose-pre:bg-gray-900
                     [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
                     prose-hr:border-white/10"
            />
          </div>

          <nav
            v-if="newer || older"
            aria-label="More news"
            class="mt-16 grid max-w-[68ch] gap-6 border-t border-white/10 pt-8 sm:grid-cols-2"
          >
            <NuxtLink
              v-if="older"
              :to="older.path"
              class="group flex min-w-0 gap-4"
            >
              <MoonPhaseIcon
                :phase="moonPhaseAt(new Date(older.date))"
                class="mt-0.5 h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              <span class="min-w-0">
                <span class="block text-sm text-gray-450">Older</span>
                <span class="mt-1 block font-medium wrap-break-word text-white transition-colors group-hover:text-indigo-200">{{ older.title }}</span>
              </span>
            </NuxtLink>
            <NuxtLink
              v-if="newer"
              :to="newer.path"
              class="group flex min-w-0 gap-4 sm:col-start-2"
            >
              <MoonPhaseIcon
                :phase="moonPhaseAt(new Date(newer.date))"
                class="mt-0.5 h-8 w-8 shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              <span class="min-w-0">
                <span class="block text-sm text-gray-450">Newer</span>
                <span class="mt-1 block font-medium wrap-break-word text-white transition-colors group-hover:text-indigo-200">{{ newer.title }}</span>
              </span>
            </NuxtLink>
          </nav>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const route = useRoute()
const path = withoutTrailingSlash(route.path)

const { data } = await useAsyncData(`news:${path}`, () =>
  queryCollection('news').path(path).first()
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const article = computed(() => data.value!)
const publishedPhase = computed(() => moonPhaseAt(new Date(article.value.date)))

// Neighbouring articles by date, for the "Older" / "Newer" links
const { data: timeline } = await useAsyncData('news-timeline', () =>
  queryCollection('news').select('title', 'path', 'date').order('date', 'DESC').order('path', 'ASC').all(),
{ default: () => [] }
)
const position = computed(() => timeline.value.findIndex(item => item.path === article.value.path))
const newer = computed(() => position.value > 0 ? timeline.value[position.value - 1] : undefined)
const older = computed(() => position.value >= 0 ? timeline.value[position.value + 1] : undefined)

/*
 * Reading progress, 0–1: how much of the article body has scrolled past the middle of the screen.
 * Rounded to 2% steps so the little moon only redraws when it visibly changes.
 */
const body = useTemplateRef<HTMLElement>('body')
const progress = ref(0)
let frame = 0

const measure = () => {
  frame = 0
  if (!body.value) return
  const rect = body.value.getBoundingClientRect()
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  // A short article may never scroll far enough; the end of the page counts as read.
  const read = atPageEnd && window.scrollY > 0 ? 1 : (window.innerHeight * 0.6 - rect.top) / rect.height
  progress.value = Math.round(Math.min(1, Math.max(0, read)) * 50) / 50
}
const onScroll = () => {
  frame ||= requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

usePageSeo({
  title: article.value.title,
  description: article.value.description,
  type: 'article'
})

const organization = useOrganization()
const pageUrl = usePageUrl()
const { absoluteUrl } = useSiteLinks()
useStructuredData(() => ({
  '@type': 'BlogPosting',
  'headline': article.value.title,
  'description': article.value.description,
  'datePublished': new Date(article.value.date).toISOString().slice(0, 10),
  'url': pageUrl(article.value.path),
  'image': absoluteUrl(SHARE_IMAGE.path),
  ...(article.value.author ? { author: { '@type': 'Person', 'name': article.value.author } } : {}),
  'publisher': { '@id': organization['@id'] }
}))
</script>
