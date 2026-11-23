<template>
  <section
    id="downloads"
    class="px-6 py-24"
    aria-labelledby="downloads-title"
  >
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="downloads-title"
            class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Get Lunar Linux
          </h2>
          <p class="mt-4 max-w-xl text-gray-400">
            From the ISO to your first compiled package in three steps.
          </p>
        </div>
        <NuxtLink
          to="/download"
          class="text-sm font-medium text-indigo-300 transition-colors hover:text-white"
        >
          All downloads
        </NuxtLink>
      </div>

      <!-- A real sequence, so the steps are numbered -->
      <ol class="mt-12 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-3 md:gap-8">
        <li class="flex flex-col">
          <span
            class="step-number"
            aria-hidden="true"
          >1</span>
          <h3 class="mt-4 text-lg font-semibold text-white">
            Download the ISO
          </h3>
          <p class="mt-2 text-gray-400">
            The {{ featured?.version }} {{ featured?.channel.toLowerCase() }}, a bootable installer for <span class="whitespace-nowrap">64-bit</span> PCs.
          </p>
          <!-- Same featured build as /download (content/download.md frontmatter) -->
          <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              :href="featured?.href"
              class="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Download ISO ({{ featured?.arch }})
            </a>
            <NuxtLink
              to="/download#verify-the-download"
              class="text-sm text-indigo-300 transition-colors hover:text-white"
            >
              Verify the checksum
            </NuxtLink>
          </div>
        </li>

        <li class="flex flex-col">
          <span
            class="step-number"
            aria-hidden="true"
          >2</span>
          <h3 class="mt-4 text-lg font-semibold text-white">
            Install
          </h3>
          <p class="mt-2 text-gray-400">
            Boot the ISO and let the installer set up disks, a kernel and a minimal base system.
          </p>
          <NuxtLink
            to="/docs/installation/installation-guide"
            class="mt-6 text-sm font-medium text-indigo-300 transition-colors hover:text-white"
          >
            Read the installation guide
          </NuxtLink>
        </li>

        <li class="flex flex-col">
          <span
            class="step-number"
            aria-hidden="true"
          >3</span>
          <h3 class="mt-4 text-lg font-semibold text-white">
            Build your first package
          </h3>
          <p class="mt-2 text-gray-400">
            lin downloads the source, resolves dependencies, compiles and installs it.
          </p>
          <p class="mt-6 w-fit rounded-lg border border-white/10 bg-gray-950/70 px-4 py-2.5 font-mono text-sm text-gray-100">
            <span
              class="text-purple-300 select-none"
              aria-hidden="true"
            >$ </span>lin nano
          </p>
          <NuxtLink
            to="/docs/package-management"
            class="mt-4 text-sm font-medium text-indigo-300 transition-colors hover:text-white"
          >
            Learn package management
          </NuxtLink>
        </li>
      </ol>

      <div class="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm">
        <span class="text-gray-450">Also available</span>
        <a
          href="https://github.com/lunar-linux"
          class="text-gray-300 transition-colors hover:text-white"
        >Source code on GitHub</a>
        <NuxtLink
          to="/download#older-releases"
          class="text-gray-300 transition-colors hover:text-white"
        >Older releases</NuxtLink>
        <!-- TODO: real bug tracker location -->
        <a
          href="#"
          class="text-gray-300 transition-colors hover:text-white"
        >Report a bug</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('download', () => queryCollection('download').first())
const featured = computed(() => data.value?.featured)
</script>

<style scoped>
.step-number {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in oklab, var(--color-indigo-300) 40%, transparent);
  color: var(--color-indigo-200);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
