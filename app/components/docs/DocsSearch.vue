<template>
  <div>
    <button
      type="button"
      :class="compact
        ? 'flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-900 hover:text-white'
        : 'flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-900'"
      aria-label="Search documentation"
      @click="openDialog"
    >
      <Icon
        name="ph:magnifying-glass"
        :class="compact ? 'h-5 w-5' : 'h-4 w-4'"
      />
      <template v-if="!compact">
        <span>Search docs...</span>
        <kbd class="ml-auto hidden rounded-sm border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-450 sm:inline-block">
          {{ shortcutLabel }}
        </kbd>
      </template>
    </button>

    <!-- The dialog is rendered once, by the full instance; compact instances only open it. -->
    <Teleport
      v-if="!compact"
      to="body"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 p-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          @click.self="close"
        >
          <div class="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-950 shadow-2xl">
            <div class="flex items-center gap-3 border-b border-gray-800 p-4">
              <Icon
                name="ph:magnifying-glass"
                class="h-5 w-5 text-gray-400"
              />
              <input
                ref="searchInput"
                v-model="query"
                type="search"
                role="combobox"
                placeholder="Search documentation..."
                aria-label="Search documentation"
                aria-autocomplete="list"
                :aria-expanded="results.length > 0"
                :aria-controls="listboxId"
                :aria-activedescendant="results.length ? optionId(activeIndex) : undefined"
                class="flex-1 bg-transparent text-white outline-hidden placeholder:text-gray-450 [&::-webkit-search-cancel-button]:appearance-none"
                @keydown="onInputKeydown"
              >
              <button
                type="button"
                class="text-gray-450 hover:text-gray-300"
                aria-label="Close search"
                @click="close"
              >
                <Icon
                  name="ph:x"
                  class="h-5 w-5"
                />
              </button>
            </div>

            <div class="max-h-[60vh] overflow-y-auto p-2">
              <p
                v-if="error"
                class="p-8 text-center text-red-400"
              >
                {{ error }}
              </p>
              <p
                v-else-if="isIndexing"
                class="p-8 text-center text-gray-450"
              >
                Loading search index...
              </p>
              <p
                v-else-if="!query.trim()"
                class="p-8 text-center text-gray-450"
              >
                Type to search the documentation
              </p>
              <p
                v-else-if="!results.length"
                class="p-8 text-center text-gray-450"
              >
                No results for "{{ query }}"
              </p>
              <ul
                v-else
                :id="listboxId"
                ref="listbox"
                role="listbox"
                aria-label="Search results"
                class="space-y-1"
              >
                <li
                  v-for="(result, index) in results"
                  :id="optionId(index)"
                  :key="result.path"
                  role="option"
                  :aria-selected="index === activeIndex"
                >
                  <NuxtLink
                    :to="result.path"
                    tabindex="-1"
                    class="block rounded-lg border-l-2 p-3 transition-colors"
                    :class="index === activeIndex ? 'border-blue-400 bg-gray-900' : 'border-transparent'"
                    @mousemove="activeIndex = index"
                    @click="close"
                  >
                    <span class="text-xs tracking-wide text-blue-400 uppercase">
                      {{ result.category }}<template v-if="result.pageTitle && result.pageTitle !== result.title"> · {{ result.pageTitle }}</template>
                    </span>
                    <span class="mt-1 block font-medium text-white">{{ result.title }}</span>
                    <span
                      v-if="result.excerpt"
                      class="mt-1 line-clamp-2 block text-sm text-gray-400"
                    >{{ result.excerpt }}</span>
                  </NuxtLink>
                </li>
              </ul>
              <!-- Docs only; modules have their own search, one step away -->
              <NuxtLink
                v-if="query.trim()"
                :to="{ path: '/modules', query: { q: query.trim() } }"
                class="mt-1 flex items-center justify-between gap-3 rounded-lg p-3 text-sm text-gray-400 transition-colors hover:bg-gray-900 hover:text-white"
                @click="close"
              >
                <span>Search modules for "<span class="text-white">{{ query.trim() }}</span>"</span>
                <Icon
                  name="ph:arrow-right"
                  class="h-4 w-4 shrink-0"
                />
              </NuxtLink>
            </div>

            <div
              v-if="results.length"
              class="hidden items-center gap-4 border-t border-gray-800 px-4 py-2 text-xs text-gray-450 sm:flex"
              aria-hidden="true"
            >
              <span><kbd class="search-kbd">↑</kbd> <kbd class="search-kbd">↓</kbd> to move</span>
              <span><kbd class="search-kbd">Enter</kbd> to open</span>
              <span><kbd class="search-kbd">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult } from '~/composables/useDocSearch'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { initializeSearch, search, isIndexing, error } = useDocSearch()
const route = useRoute()

const query = ref('')
const results = ref<SearchResult[]>([])
const { isOpen, open: openDialog, close: closeDialog } = useSearchDialog()
const searchInput = ref<HTMLInputElement>()
const shortcutLabel = ref('Ctrl K')
const activeIndex = ref(0)
const listbox = ref<HTMLUListElement>()

// Ids only need to be unique per dialog, but useId keeps them stable between server and client.
const uid = useId()
const listboxId = `docs-search-${uid}-results`
const optionId = (index: number) => `docs-search-${uid}-result-${index}`

const close = closeDialog

// Only the full instance owns the dialog: load the index and focus the field when it opens,
// reset when it closes (whoever opened or closed it).
if (!props.compact) {
  watch(isOpen, (open) => {
    if (open) {
      initializeSearch()
      nextTick(() => searchInput.value?.focus())
    } else {
      query.value = ''
      results.value = []
    }
  })
}

const openResult = (index: number) => {
  const result = results.value[index]
  if (result) {
    navigateTo(result.path)
    close()
  }
}

// Arrow keys move the highlight (wrapping around); Enter opens the highlighted result.
const onInputKeydown = (event: KeyboardEvent) => {
  const count = results.value.length
  if (!count) return

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + step + count) % count
  } else if (event.key === 'Enter') {
    event.preventDefault()
    openResult(activeIndex.value)
  }
}

// Keep the highlighted result visible when moving through a long list.
watch(activeIndex, (index) => {
  nextTick(() => {
    listbox.value?.querySelector(`#${CSS.escape(optionId(index))}`)?.scrollIntoView({ block: 'nearest' })
  })
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined
const runSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    results.value = search(query.value)
    activeIndex.value = 0
  }, 150)
}

watch(query, runSearch)
// Results typed before the index finished loading.
watch(isIndexing, (indexing) => {
  if (!indexing) runSearch()
})
if (!props.compact) watch(() => route.fullPath, close)

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (isOpen.value) close()
    else openDialog()
  } else if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.platform)) shortcutLabel.value = '⌘K'
  // The header also renders a compact instance for mobile; only the full one owns the shortcuts.
  if (!props.compact) window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.search-kbd {
  display: inline-block;
  min-width: 1.5em;
  padding: 0 0.35em;
  border: 1px solid var(--color-gray-700);
  border-radius: 0.25rem;
  background: var(--color-gray-800);
  color: var(--color-gray-400);
  font-family: inherit;
  text-align: center;
}
</style>
