<template>
  <div class="flex">
    <!-- Mobile sidebar toggle -->
    <button
      type="button"
      class="fixed bottom-4 left-4 z-40 rounded-lg bg-blue-600 p-3 text-white shadow-lg lg:hidden"
      :aria-expanded="sidebarOpen"
      aria-controls="docs-sidebar"
      aria-label="Toggle documentation navigation"
      @click="sidebarOpen = !sidebarOpen"
    >
      <Icon
        :name="sidebarOpen ? 'ph:x' : 'ph:list'"
        class="h-6 w-6"
      />
    </button>

    <!-- Mobile sidebar overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <aside
      id="docs-sidebar"
      class="fixed top-24 left-0 z-40 max-h-[calc(100vh-6rem)] w-72 shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-950 transition-transform duration-200 lg:sticky lg:z-0 lg:max-h-[calc(100vh-7rem)] lg:translate-x-0 lg:self-start"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <slot name="sidebar" />
    </aside>

    <!-- Same padding as /docs, so the breadcrumb stays put going one level down -->
    <div class="min-w-0 flex-1 px-6 pt-10 pb-24">
      <div class="mx-auto max-w-4xl">
        <slot />
      </div>
    </div>

    <!-- Table of contents (wide screens only). As wide as the sidebar once the column has room
         for its full width, so it's centred on the page and lines up with /docs -->
    <aside class="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 2xl:w-72 self-start overflow-y-auto xl:block">
      <slot name="toc" />
    </aside>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(false)

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
