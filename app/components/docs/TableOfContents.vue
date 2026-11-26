<template>
  <nav
    v-if="links.length"
    aria-label="On this page"
    class="m-4 rounded-lg border border-gray-800 bg-gray-900/80 p-4 shadow-lg backdrop-blur-xs"
  >
    <h2 class="mb-4 text-sm font-semibold text-white">
      On this page
    </h2>
    <ul class="space-y-2 text-sm">
      <li
        v-for="link in links"
        :key="link.id"
      >
        <a
          :href="`#${link.id}`"
          class="-mx-2 block rounded-sm px-2 py-1 transition-all hover:text-white"
          :class="linkClass(link.id)"
          @click.prevent="scrollToHeading(link.id)"
        >
          {{ link.text }}
        </a>
        <ul
          v-if="link.children?.length"
          class="mt-2 ml-2 space-y-2 border-l border-gray-800 pl-2"
        >
          <li
            v-for="child in link.children"
            :key="child.id"
          >
            <a
              :href="`#${child.id}`"
              class="-mx-2 block rounded-sm px-2 py-1 transition-all hover:text-white"
              :class="linkClass(child.id)"
              @click.prevent="scrollToHeading(child.id)"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
type TocLink = {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const props = defineProps<{ links: TocLink[] }>()

const activeId = ref('')
// Ignore observer updates while a click-triggered smooth scroll is running.
let isScrolling = false
let scrollTimer: ReturnType<typeof setTimeout> | undefined

const linkClass = (id: string) => activeId.value === id
  ? 'border-l-2 border-blue-400 bg-blue-600/30 font-semibold text-white'
  : 'text-gray-400'

const headingIds = computed(() =>
  props.links.flatMap(link => [link.id, ...(link.children ?? []).map(child => child.id)])
)

let observer: IntersectionObserver | undefined

const onScroll = () => {
  if (isScrolling) return
  // At the bottom of the page the last headings may never reach the top; highlight the last one.
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50
  const lastId = headingIds.value.at(-1)
  if (atBottom && lastId) activeId.value = lastId
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (isScrolling) return
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))
    if (visible[0]) activeId.value = visible[0].target.id
  }, { rootMargin: '-100px 0px -40% 0px' })

  for (const id of headingIds.value) {
    const heading = document.getElementById(id)
    if (heading) observer.observe(heading)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
  clearTimeout(scrollTimer)
})

const scrollToHeading = (id: string) => {
  const heading = document.getElementById(id)
  if (!heading) return

  heading.closest('details')?.setAttribute('open', '') // a folded FAQ question
  activeId.value = id
  isScrolling = true
  heading.scrollIntoView({ behavior: 'smooth', block: 'start' }) // offset comes from scroll-margin-top
  history.replaceState(history.state, '', `#${id}`)

  clearTimeout(scrollTimer)
  const release = () => {
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      isScrolling = false
    }, 150)
  }
  window.addEventListener('scrollend', release, { once: true })
  // Fallback for browsers without `scrollend`.
  scrollTimer = setTimeout(() => {
    isScrolling = false
  }, 1000)
}
</script>
