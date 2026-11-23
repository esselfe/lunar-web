<!-- Fenced code blocks in Markdown: the default MDC <pre> plus a copy-to-clipboard button. -->
<template>
  <div class="group relative">
    <pre :class="$props.class"><slot /></pre>
    <button
      type="button"
      class="absolute top-2 right-2 rounded-lg border border-gray-600/50 bg-gray-800/80 p-2 text-gray-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:border-gray-500 hover:bg-gray-700/90 hover:text-gray-200 focus:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
      :aria-label="copied ? 'Copied' : 'Copy code'"
      :title="copied ? 'Copied' : 'Copy code'"
      @click="copyCode"
    >
      <Icon
        :name="copied ? 'ph:check' : 'ph:copy'"
        class="h-5 w-5"
        :class="{ 'text-green-400': copied }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>(), {
  code: '',
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
  class: null
})

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<style>
pre code .line {
  display: block;
}
</style>
