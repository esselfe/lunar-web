<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-y-1 text-sm">
      <li
        v-for="(item, index) in trail"
        :key="item.path"
        class="flex items-center"
      >
        <NuxtLink
          v-if="!isCurrent(item)"
          :to="item.path"
          class="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-white"
        >
          <Icon
            v-if="index === 0"
            name="ph:house"
            class="h-4 w-4"
          />
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-white"
          aria-current="page"
        >
          {{ item.label }}
        </span>
        <Icon
          v-if="index < trail.length - 1"
          name="ph:caret-right"
          class="mx-2 h-4 w-4 text-gray-600"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { Crumb } from '~/utils/navigation'

/**
 * The trail after "Home", which is always first. A crumb for the page you're on is plain text;
 * the rest are links, so a trail can also stop at the parent ("Home › News" on an article).
 */
const props = defineProps<{
  items: Crumb[]
}>()

const trail = computed<Crumb[]>(() => [{ label: 'Home', path: '/' }, ...props.items])

const route = useRoute()
const isCurrent = (item: Crumb) => navCurrent(route.path, item.path) === 'page'

// The same trail for search engines
const pageUrl = usePageUrl()
useStructuredData(() => ({
  '@type': 'BreadcrumbList',
  'itemListElement': trail.value.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.label,
    'item': pageUrl(item.path)
  }))
}))
</script>
