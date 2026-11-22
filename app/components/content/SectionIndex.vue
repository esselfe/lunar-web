<!--
  Lists the pages directly below the current docs page, in sidebar order, one per row with its
  description (`::section-index` in MDC). Read from the docs collection, so it can't drift from the
  sidebar. For section pages that don't already list their pages by hand.
-->
<template>
  <section
    v-if="pages.length"
    class="not-prose my-10"
    :aria-label="title"
  >
    <h2 class="text-xl font-semibold text-white">
      {{ title }}
    </h2>
    <ul class="mt-4 border-b border-gray-800">
      <li
        v-for="doc in pages"
        :key="doc.path"
        class="border-t border-gray-800"
      >
        <NuxtLink
          :to="doc.path"
          class="group block py-4"
        >
          <span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span class="font-semibold text-blue-400 group-hover:text-blue-300 group-hover:underline">
              {{ doc.title }}
            </span>
            <span
              v-if="doc.archived && !/archived/i.test(doc.title)"
              class="text-xs font-semibold tracking-wide text-gray-500 uppercase"
            >Archived</span>
          </span>
          <span
            v-if="doc.description"
            class="mt-1 block text-gray-400"
          >
            {{ doc.description }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'
import { docsChildren } from '~/composables/useDocsNavigation'

withDefaults(defineProps<{ title?: string }>(), { title: 'In this section' })

const path = withoutTrailingSlash(useRoute().path)

const { data: pages } = await useAsyncData(`docs-children:${path}`, async () => {
  const docs = await queryCollection('docs')
    .select('title', 'description', 'path', 'order', 'archived')
    .where('path', 'LIKE', `${path}/%`)
    .all()
  return docsChildren(docs, path)
}, { default: () => [] })
</script>
