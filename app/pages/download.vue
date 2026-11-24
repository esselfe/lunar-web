<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <Breadcrumb :items="[{ label: 'Download', path: '/download' }]" />

      <header class="mt-10 max-w-2xl">
        <h1 class="text-4xl font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
          {{ page.title }}
        </h1>
        <p class="mt-4 text-lg text-gray-400">
          {{ page.description }}
        </p>
      </header>

      <!-- The featured build, marked with the moon it was built under (real date, from frontmatter) -->
      <section
        class="mt-12 grid gap-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10 sm:p-10"
        aria-labelledby="featured-title"
      >
        <MoonPhaseIcon
          :phase="builtPhase"
          class="h-20 w-20 sm:h-28 sm:w-28"
        />
        <div>
          <p class="text-sm font-medium text-indigo-200">
            {{ featured.channel }} · {{ featured.arch }}
          </p>
          <h2
            id="featured-title"
            class="mt-2 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Lunar {{ featured.version }}
          </h2>
          <p class="mt-3 text-gray-400">
            Built <time
              :datetime="String(featured.built)"
              class="tabular-nums"
            >{{ formatDate(featured.built) }}</time>
            under a <span class="text-indigo-300/80">{{ moonPhaseName(builtPhase).toLowerCase() }}</span>.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              :href="featured.href"
              class="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Download the ISO ({{ featured.arch }})
            </a>
            <a
              href="#verify-the-download"
              class="text-sm text-indigo-300 transition-colors hover:text-white"
            >
              {{ featured.checksum }} checksum next to the ISO
            </a>
          </div>
        </div>
      </section>

      <ContentRenderer
        :value="page"
        class="mt-16 prose max-w-[68ch] prose-invert sm:prose-lg
               prose-headings:tracking-tight prose-headings:text-white
               prose-h2:mt-14 prose-h2:text-2xl
               prose-p:text-gray-300 prose-li:text-gray-300 prose-li:marker:text-indigo-300/60
               prose-a:text-indigo-300 prose-a:underline-offset-4 prose-a:hover:text-white
               prose-strong:text-white
               prose-code:rounded prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-indigo-200
               prose-pre:border prose-pre:border-white/10 prose-pre:bg-gray-900
               [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('download', () => queryCollection('download').first())

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Download page not found', fatal: true })
}

const page = computed(() => data.value!)
const featured = computed(() => page.value.featured)
const builtPhase = computed(() => moonPhaseAt(new Date(featured.value.built)))

usePageSeo({
  title: page.value.title,
  description: page.value.description
})
</script>
