<!-- Looks like a search field; opens the docs search dialog (⌘K / Ctrl K). -->
<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-gray-950/60 px-4 py-3 text-left text-gray-400 transition-colors hover:border-white/30 hover:text-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
    @click="open"
  >
    <Icon
      name="ph:magnifying-glass"
      class="h-5 w-5 shrink-0"
    />
    <span class="flex-1">
      <slot>Search the docs</slot>
    </span>
    <kbd class="hidden rounded-sm border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-450 sm:inline-block"><ShortcutLabel /></kbd>
  </button>
</template>

<script setup lang="ts">
const { open } = useSearchDialog()
</script>
