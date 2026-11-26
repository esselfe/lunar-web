<template>
  <details
    ref="details"
    class="fold-question"
  >
    <summary class="fold-question__summary">
      <slot name="question" />
      <Icon
        name="ph:caret-down"
        class="fold-question__caret"
        aria-hidden="true"
      />
    </summary>
    <div class="fold-question__answer">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
// One question on a page with `foldQuestions: true` (see app/utils/foldQuestions.ts).
// A native <details>, so it opens and closes without JavaScript. With JavaScript, it also
// opens when the URL points at its question (a search result, a shared #link).
const details = useTemplateRef<HTMLDetailsElement>('details')
const route = useRoute()

const openIfTargeted = () => {
  const el = details.value
  const id = decodeURIComponent(route.hash.slice(1))
  if (el && id && el.querySelector(`summary [id="${CSS.escape(id)}"]`)) el.open = true
}

onMounted(() => {
  // The heading's own anchor link would swallow the click; the whole row toggles instead.
  details.value?.querySelector('summary a')?.setAttribute('tabindex', '-1')
  openIfTargeted()
})
watch(() => route.hash, openIfTargeted)
</script>

<style>
/* Unscoped: the heading comes from the page's markdown, rendered inside `.prose`. */
.fold-question {
  border-bottom: 1px solid var(--color-gray-800);
}

.fold-question__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 -0.75rem;
  padding: 1rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  list-style: none;
  transition: background-color 150ms;
}

.fold-question__summary::-webkit-details-marker {
  display: none;
}

.fold-question__summary:hover {
  background-color: rgb(255 255 255 / 0.03);
}

.prose .fold-question__summary h3 {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
}

.fold-question__summary h3 a {
  pointer-events: none;
}

.fold-question__summary:hover h3,
.fold-question[open] .fold-question__summary h3 {
  color: var(--color-indigo-200);
}

.fold-question__caret {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-gray-500);
  transition: transform 200ms ease;
}

.fold-question[open] .fold-question__caret {
  transform: rotate(180deg);
}

.fold-question__answer {
  padding-bottom: 1rem;
}

.fold-question__answer > :first-child {
  margin-top: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fold-question__summary,
  .fold-question__caret {
    transition: none;
  }
}
</style>
