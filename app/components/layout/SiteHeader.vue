<template>
  <header class="fixed inset-x-0 top-0 z-50 w-full border-b border-indigo-500/30 bg-gray-950/95 shadow-lg shadow-indigo-900/20 backdrop-blur-md">
    <div class="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
      <!-- The logo is the way home; a small label says so on hover and keyboard focus -->
      <NuxtLink
        to="/"
        class="home-link relative rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
        aria-label="Lunar Linux home"
      >
        <img
          src="~/assets/lunar_logo-01-full-dark.svg"
          alt="Lunar Linux"
          class="h-12 w-auto"
          width="150"
          height="56"
        >
        <span
          class="home-label"
          aria-hidden="true"
        >
          <Icon
            name="ph:house"
            class="h-3.5 w-3.5"
          />
          Home
        </span>
      </NuxtLink>

      <!-- Desktop navigation -->
      <div class="hidden items-center gap-6 lg:flex">
        <nav aria-label="Main">
          <ul class="flex gap-6">
            <li
              v-for="link in navLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="nav-link"
                :class="{ 'is-current': current(link.to) }"
                :aria-current="current(link.to)"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <DocsSearch />
        <NuxtLink
          to="/download"
          class="download-button rounded-lg bg-accent/20 px-4 py-2 text-sm font-medium text-indigo-200 ring-1 ring-indigo-300/45 ring-inset transition-colors hover:bg-accent/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          :aria-current="current('/download')"
        >
          Download
        </NuxtLink>
      </div>

      <!-- Mobile: search + menu toggle -->
      <div class="flex items-center gap-3 lg:hidden">
        <DocsSearch compact />
        <button
          class="flex h-10 w-10 flex-col items-center justify-center"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span
            class="mb-1.5 block h-0.5 w-6 bg-blue-300 transition-transform"
            :class="{ 'translate-y-2 rotate-45': isMenuOpen }"
          />
          <span
            class="mb-1.5 block h-0.5 w-6 bg-blue-300 transition-opacity"
            :class="{ 'opacity-0': isMenuOpen }"
          />
          <span
            class="block h-0.5 w-6 bg-blue-300 transition-transform"
            :class="{ '-translate-y-2 -rotate-45': isMenuOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Mobile navigation menu -->
    <nav
      v-if="isMenuOpen"
      id="mobile-menu"
      aria-label="Main"
      class="container mx-auto animate-fade-in px-6 pb-6 lg:hidden"
    >
      <ul class="flex flex-col gap-2">
        <li
          v-for="link in mobileLinks"
          :key="link.to"
        >
          <NuxtLink
            :to="link.to"
            class="mobile-link flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-300 transition-all duration-300 hover:translate-x-2 hover:bg-blue-600/20 hover:text-white"
            :class="{ 'is-current': current(link.to) }"
            :aria-current="current(link.to)"
          >
            <Icon
              v-if="link.icon"
              :name="link.icon"
              class="h-5 w-5 text-indigo-300"
            />
            {{ link.label }}
          </NuxtLink>
        </li>
        <li class="mt-2">
          <NuxtLink
            to="/download"
            class="block rounded-lg bg-accent px-4 py-3 text-center font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-accent-hover"
            :aria-current="current('/download')"
          >
            Download
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
type NavLink = { label: string, to: string, icon?: string }

const route = useRoute()
const isMenuOpen = ref(false)

// Close the mobile menu after navigating (including same-page hash links).
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

// Real places only, plus the community spot on the homepage. Downloads is the button.
const navLinks: NavLink[] = [
  { label: 'Docs', to: '/docs' },
  { label: 'Modules', to: '/modules' },
  { label: 'News', to: '/news' },
  { label: 'Community', to: '/#community' }
]

// The logo's hover label doesn't exist on touch screens, so the mobile menu spells "Home" out.
// Every row gets an icon so the labels line up.
const mobileIcons: Record<string, string> = {
  '/docs': 'ph:book-open',
  '/modules': 'ph:package',
  '/news': 'ph:newspaper',
  '/#community': 'ph:chats-circle'
}
const mobileLinks: NavLink[] = [
  { label: 'Home', to: '/', icon: 'ph:house' },
  ...navLinks.map(link => ({ ...link, icon: mobileIcons[link.to] }))
]

/** 'page' on the link's own page, 'true' below it (docs pages light up "Docs"). */
const current = (to: string) => navCurrent(route.path, to)
</script>

<style scoped>
.nav-link {
  position: relative;
  padding-block: 0.5rem;
  font-weight: 500;
  color: var(--color-gray-300);
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.is-current {
  color: var(--color-white);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-blue-400), var(--color-purple-400));
  transition: width 0.3s ease-in-out;
}

.nav-link:hover::after,
.nav-link.is-current::after {
  width: 100%;
}

.mobile-link.is-current {
  background: color-mix(in oklab, var(--color-indigo-500) 15%, transparent);
  color: var(--color-white);
}

/* On /download the button is already where it leads; a ring marks it as the current page. */
.download-button[aria-current] {
  outline: 2px solid var(--color-indigo-300);
  outline-offset: 2px;
}

/*
 * "Home" label under the logo: shown on hover (mouse only) and keyboard focus.
 * Transform and opacity only, so it stays smooth on iPhone.
 */
.home-label {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid color-mix(in oklab, var(--color-indigo-400) 35%, transparent);
  border-radius: 9999px;
  background: var(--color-gray-900);
  color: var(--color-indigo-200);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, -0.25rem);
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.home-link:focus-visible .home-label {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (hover: hover) {
  .home-link:hover .home-label {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-label {
    transition: none;
  }
}
</style>
