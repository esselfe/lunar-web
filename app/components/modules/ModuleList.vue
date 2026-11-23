<template>
  <ol class="divide-y divide-white/5">
    <li
      v-for="module in modules"
      :key="module.name"
    >
      <NuxtLink
        :to="modulePath(module.name)"
        class="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        :class="{ 'sm:grid-cols-[minmax(0,14rem)_8rem_minmax(0,1fr)]': !compact }"
      >
        <span class="truncate font-semibold text-white group-hover:text-indigo-200">{{ module.name }}</span>
        <span
          class="truncate text-right text-sm text-gray-450 tabular-nums"
          :class="{ 'sm:text-left': !compact }"
        >{{ module.version ?? '' }}</span>
        <span
          class="col-span-2 text-sm text-gray-400"
          :class="{ 'sm:col-span-1': !compact }"
        >
          {{ module.short ?? 'No description' }}
          <ModuleBadges
            :module="module"
            class="ml-1"
          />
        </span>
      </NuxtLink>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { ModuleSummary } from '#shared/types/moonbase-index'

/** One row per module. `compact` keeps the description under the name at every width (for narrow columns). */
defineProps<{ modules: ModuleSummary[], compact?: boolean }>()
</script>
