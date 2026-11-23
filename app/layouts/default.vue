<template>
  <div class="flex min-h-screen flex-col">
    <!-- First stop for keyboard users: past the header, straight to the page -->
    <a
      href="#main"
      class="sr-only rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
    >
      Skip to content
    </a>
    <SiteHeader />
    <main
      id="main"
      tabindex="-1"
      class="flex-1 pt-24 outline-none"
    >
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
