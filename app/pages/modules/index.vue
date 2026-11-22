<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <Breadcrumb :items="[{ label: 'Modules', path: '/modules' }]" />

      <header class="mt-10 max-w-2xl">
        <h1 class="text-4xl font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
          The moonbase
        </h1>
        <p class="mt-4 text-lg text-gray-400">
          <template v-if="overview.total">
            {{ overview.total.toLocaleString('en-US') }} modules, every recipe Lunar can build.
          </template>
          <template v-else>
            Every recipe Lunar can build.
          </template>
          Each one compiles from source on your machine with <code class="rounded bg-white/5 px-1.5 py-0.5 text-base text-indigo-200">lin</code>.
        </p>
      </header>

      <!-- Search. Without JavaScript the form just reloads the page with the section list. -->
      <form
        role="search"
        class="mt-10 flex flex-wrap items-center gap-3"
        @submit.prevent
      >
        <label
          for="module-search"
          class="sr-only"
        >Search modules</label>
        <div class="relative min-w-0 flex-1 basis-72">
          <Icon
            name="ph:magnifying-glass"
            class="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-500"
          />
          <input
            id="module-search"
            v-model="query"
            name="q"
            type="search"
            autocomplete="off"
            spellcheck="false"
            :placeholder="overview.total ? `Search ${overview.total.toLocaleString('en-US')} modules` : 'Search modules'"
            class="w-full rounded-lg border border-white/10 bg-gray-900 py-3 pr-4 pl-11 text-white placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none"
          >
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-300"
          @click="surprise"
        >
          <Icon
            name="ph:rocket-launch"
            class="h-4 w-4"
          />
          Surprise me
        </button>
      </form>

      <!-- Results -->
      <section
        v-if="searching"
        class="mt-10"
        aria-live="polite"
      >
        <p
          v-if="loading"
          class="text-gray-400"
        >
          Loading the moonbase…
        </p>
        <p
          v-else-if="!results.length"
          class="text-gray-400"
        >
          No modules match "{{ settledQuery }}".
        </p>
        <template v-else>
          <p class="text-sm text-gray-400">
            {{ results.length === 1 ? '1 module' : `${results.length.toLocaleString('en-US')} modules` }} match "{{ settledQuery }}"
          </p>
          <ModuleList
            class="mt-4"
            :modules="results.slice(0, listLimit)"
          />
          <button
            v-if="results.length > listLimit"
            type="button"
            class="mt-4 px-2 text-sm font-medium text-indigo-300 hover:text-white"
            @click="listLimit += 100"
          >
            Show more
          </button>
        </template>
      </section>

      <!-- Sections, when not searching -->
      <section
        v-else
        class="mt-14"
        aria-labelledby="sections-title"
      >
        <h2
          id="sections-title"
          class="text-xl font-semibold text-white"
        >
          Sections
        </h2>
        <p
          v-if="!overview.sections.length"
          class="mt-3 text-gray-400"
        >
          The module index isn't available right now.
        </p>
        <ul class="mt-4 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          <li
            v-for="section in overview.sections"
            :key="section.name"
            class="break-inside-avoid"
          >
            <NuxtLink
              :to="`/modules/section/${section.name}`"
              class="group block rounded-md px-2 py-2 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-indigo-300"
            >
              <span class="flex items-baseline justify-between gap-3">
                <span class="font-semibold text-white group-hover:text-indigo-200">{{ section.name }}</span>
                <span class="text-sm text-gray-500 tabular-nums">{{ section.count }}</span>
              </span>
              <span class="block truncate text-sm text-gray-400">{{ section.highlights.join(', ') }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModuleSummary, MoonbaseOverview } from '#shared/types/moonbase-index'

usePageSeo({
  title: 'Modules',
  description: 'Every module in the Lunar Linux moonbase: versions, dependencies and what depends on them.'
})

const SEARCH_DELAY_MS = 250

const { data } = await useFetch<MoonbaseOverview>('/api/moonbase/overview', { key: 'moonbase-overview' })
const overview = computed(() => data.value ?? { generatedAt: null, total: 0, sections: [] })

// The search list (name, version, section, description) loads in the browser, once
const { withBase } = useSiteLinks()
const modules = ref<ModuleSummary[] | null>(null)
let loadingModules: Promise<ModuleSummary[]> | undefined
const loadModules = () => (loadingModules ??= $fetch<ModuleSummary[]>(withBase('/modules/search.json'))
  .then(list => (modules.value = list))
  .catch(() => (modules.value = [])))

const route = useRoute()
const router = useRouter()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
// The query the results are for: follows typing after a short pause
const settledQuery = ref(query.value)
const listLimit = ref(100)

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (value) => {
  clearTimeout(timer)
  if (value.trim()) loadModules()
  timer = setTimeout(() => {
    settledQuery.value = value.trim()
    listLimit.value = 100
    router.replace({ query: value.trim() ? { q: value.trim() } : {} })
  }, SEARCH_DELAY_MS)
})

// Arriving with ?q= while already here (the ⌘K hand-off): search for it right away
watch(() => route.query.q, (q) => {
  const value = typeof q === 'string' ? q : ''
  if (value.trim() === settledQuery.value) return
  query.value = value
  settledQuery.value = value.trim()
  if (value.trim()) loadModules()
})

const searching = computed(() => !!settledQuery.value)
const loading = computed(() => searching.value && !modules.value)
const results = computed(() => (modules.value ? searchModules(modules.value, settledQuery.value) : []))

onMounted(() => {
  if (settledQuery.value) loadModules()
})
onBeforeUnmount(() => clearTimeout(timer))

const surprise = async () => {
  const list = modules.value ?? await loadModules()
  if (!list.length) return
  await navigateTo(modulePath(list[Math.floor(Math.random() * list.length)]!.name))
}
</script>
