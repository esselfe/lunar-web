<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <Breadcrumb :items="[{ label: 'Modules', path: '/modules' }]" />

      <header class="mt-10 max-w-2xl">
        <h1 class="text-4xl font-bold tracking-[-0.035em] text-white sm:text-5xl">
          {{ section.section }}
        </h1>
        <p class="mt-4 text-lg text-gray-400">
          <template v-if="section.section === 'crater'">
            Modules whose upstream projects stopped. They're still in the moonbase and still build.
          </template>
          <template v-else-if="section.section === 'zbeta'">
            Modules still in testing.
          </template>
          {{ section.modules.length }} {{ section.modules.length === 1 ? 'module' : 'modules' }} in this section of the moonbase.
        </p>
      </header>

      <ModuleList
        class="mt-12"
        :modules="section.modules"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModuleSectionPage } from '#shared/types/moonbase-index'

const route = useRoute()
const name = computed(() => String(route.params.section))

const { data } = await useFetch<ModuleSectionPage>(() => `/api/moonbase/sections/${encodeURIComponent(name.value)}`, {
  key: `section-${name.value}`
})
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'No such section in the moonbase', fatal: true })
}
const section = computed(() => data.value!)

usePageSeo(() => ({
  title: `${section.value.section}: modules in the moonbase`,
  description: `The ${section.value.modules.length} modules in the ${section.value.section} section of the Lunar Linux moonbase.`
}))
</script>
