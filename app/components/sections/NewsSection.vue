<template>
  <section
    id="news"
    class="px-6 py-24"
    aria-labelledby="news-title"
  >
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="news-title"
          class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Latest news
        </h2>
        <div class="flex items-center gap-6 text-sm">
          <a
            :href="withBase('/rss.xml')"
            class="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-white"
          >
            <Icon
              name="ph:rss-bold"
              class="h-4 w-4"
            />
            RSS
          </a>
          <NuxtLink
            to="/news"
            class="font-medium text-indigo-300 transition-colors hover:text-white"
          >
            All news
          </NuxtLink>
        </div>
      </div>

      <ol
        v-if="articles.length"
        class="mt-10 border-t border-white/10"
      >
        <li
          v-for="(article, index) in articles"
          :key="article.path"
          class="border-b border-white/10"
        >
          <NuxtLink
            :to="article.path"
            class="group -mx-3 grid gap-x-10 gap-y-2 rounded-md px-3 py-7 transition-colors hover:bg-white/[0.03] md:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <!-- The moon on the night it was posted, as in the news log -->
            <p class="flex items-center gap-3 self-start pt-1 text-sm">
              <MoonPhaseIcon
                :phase="moonPhaseAt(new Date(article.date))"
                class="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              <time
                :datetime="String(article.date)"
                class="text-gray-450 tabular-nums"
              >{{ formatDate(article.date) }}</time>
            </p>
            <div>
              <h3
                class="font-semibold text-white transition-colors group-hover:text-indigo-200"
                :class="index === 0 ? 'text-2xl tracking-tight sm:text-3xl' : 'text-lg'"
              >
                {{ article.title }}
              </h3>
              <p
                v-if="index === 0"
                class="mt-3 max-w-2xl text-gray-300"
              >
                {{ article.description }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ol>

      <p
        v-else
        class="mt-10 border-t border-white/10 py-8 text-gray-400"
      >
        No news yet.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { withBase } = useSiteLinks()

const { data: articles } = await useAsyncData('news-latest', () =>
  queryCollection('news').select('title', 'description', 'date', 'path').order('date', 'DESC').order('path', 'ASC').limit(3).all(),
{ default: () => [] }
)
</script>
