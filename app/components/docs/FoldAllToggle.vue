<template>
  <button
    v-if="ready"
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-450 transition-colors hover:bg-white/[0.03] hover:text-indigo-200"
    @click="toggleAll"
  >
    {{ allOpen ? 'Close all' : 'Open all' }}
    <Icon
      name="ph:caret-down"
      class="fold-all-caret h-4 w-4"
      :class="{ 'is-open': allOpen }"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
// Opens or closes every <FoldQuestion> on the page. Rendered only once JavaScript runs, so
// there's never a button that does nothing. Printing opens every answer, then puts them back.
const ready = ref(false)
const allOpen = ref(false)

const folds = () => [...document.querySelectorAll<HTMLDetailsElement>('details.fold-question')]
const sync = () => {
  allOpen.value = folds().every(el => el.open)
}

const toggleAll = () => {
  const open = !allOpen.value
  for (const el of folds()) el.open = open
  allOpen.value = open
}

let closedBeforePrint: HTMLDetailsElement[] = []
const beforePrint = () => {
  closedBeforePrint = folds().filter(el => !el.open)
  for (const el of closedBeforePrint) el.open = true
}
const afterPrint = () => {
  for (const el of closedBeforePrint) el.open = false
  closedBeforePrint = []
}

onMounted(() => {
  // `toggle` doesn't bubble, so listen in the capture phase: catches single questions too.
  document.addEventListener('toggle', sync, true)
  window.addEventListener('beforeprint', beforePrint)
  window.addEventListener('afterprint', afterPrint)
  sync()
  ready.value = true
})

onBeforeUnmount(() => {
  document.removeEventListener('toggle', sync, true)
  window.removeEventListener('beforeprint', beforePrint)
  window.removeEventListener('afterprint', afterPrint)
})
</script>

<style scoped>
.fold-all-caret {
  transition: transform 200ms ease;
}

.fold-all-caret.is-open {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .fold-all-caret {
    transition: none;
  }
}
</style>
