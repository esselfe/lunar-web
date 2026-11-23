<template>
  <div class="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-blue-950 font-sans text-gray-100">
    <NuxtLayout>
      <!-- Fills the screen below the fixed header (main's pt-24), so the footer starts below the fold -->
      <div class="container mx-auto grid min-h-[calc(100svh-6rem)] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="order-2 md:order-1">
          <h1 class="text-4xl leading-[1.1] font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl">
            {{ isNotFound ? 'This page has drifted out of orbit.' : 'Something went wrong.' }}
          </h1>
          <p class="mt-6 max-w-md text-lg text-gray-300">
            <template v-if="isNotFound">
              The page you're looking for doesn't exist or has moved. Head back home, or search the documentation.
            </template>
            <template v-else>
              {{ error.message || 'Please try again in a moment.' }}
            </template>
          </p>
          <div class="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              class="rounded-lg bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              @click="clearError({ redirect: '/' })"
            >
              Back to the homepage
            </button>
            <button
              v-if="isNotFound"
              type="button"
              class="rounded-lg border border-white/15 px-6 py-3 font-medium text-gray-100 transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              @click="openSearch"
            >
              Search the docs
            </button>
          </div>
          <p class="mt-8 text-lg font-medium text-gray-400">
            Error {{ error.statusCode }}
          </p>
        </div>

        <!-- A small night scene: the moon, a few stars and a satellite whose orbit decays into the moon, once -->
        <div
          class="scene relative order-1 mx-auto aspect-square w-56 sm:w-72 md:order-2 md:w-96"
          aria-hidden="true"
        >
          <span
            v-for="(star, index) in stars"
            :key="index"
            class="absolute rounded-full bg-indigo-100"
            :style="{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`, opacity: star.o }"
          />
          <!-- Fills the scene (LunarMoon is relative and square), drawn over the stars -->
          <LunarMoon :play="isSettled" />
          <!-- Keyed on the path: reaching another missing page plays the crash again -->
          <div
            :key="route.path"
            class="crash"
            :class="{ 'is-playing': isSettled }"
          >
            <span class="sat-x">
              <span class="sat-y">
                <svg
                  class="satellite"
                  viewBox="0 0 40 20"
                  focusable="false"
                >
                  <g
                    stroke="#A5B4FC"
                    stroke-width="0.8"
                  >
                    <rect
                      x="1"
                      y="6"
                      width="12.5"
                      height="8"
                      fill="#4F46E5"
                    />
                    <rect
                      x="26.5"
                      y="6"
                      width="12.5"
                      height="8"
                      fill="#4F46E5"
                    />
                    <path d="M5.2 6v8M9.3 6v8M30.7 6v8M34.8 6v8M13.5 10h3M23.5 10h3M20 5V1.5" />
                  </g>
                  <rect
                    x="16"
                    y="4.5"
                    width="8"
                    height="11"
                    rx="1.5"
                    fill="#E0E7FF"
                  />
                  <circle
                    cx="20"
                    cy="1.5"
                    r="1.3"
                    fill="#D8B4FE"
                  />
                </svg>
              </span>
            </span>
            <span class="impact">
              <span class="flash" />
              <span class="shockwave" />
              <span
                v-for="(bit, index) in debris"
                :key="index"
                class="debris"
                :style="{ '--dx': `${bit.x}cqw`, '--dy': `${bit.y}cqw` }"
              />
              <!-- What's left: a fresh crater whose rim catches the sunlight at the terminator -->
              <span class="crater" />
            </span>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const isNotFound = computed(() => props.error.statusCode === 404)
const { open: openSearch } = useSearchDialog()

// Hold the moon's first light and the crash until the page has settled (smooth on iPhone, see AGENTS.md).
const isSettled = usePageSettled()

const stars = [
  { x: 6, y: 18, size: 2, o: 0.7 },
  { x: 88, y: 8, size: 1.5, o: 0.5 },
  { x: 94, y: 70, size: 2, o: 0.6 },
  { x: 4, y: 82, size: 1.5, o: 0.4 },
  { x: 48, y: 96, size: 1.5, o: 0.5 },
  { x: 70, y: 2, size: 1, o: 0.6 }
]

/** Where each fragment ends up, relative to the impact point, in % of the scene. */
const debris = [
  { x: -7, y: -6 },
  { x: -2, y: -9 },
  { x: 5, y: -8 },
  { x: 9, y: -2 },
  { x: 6, y: 5 },
  { x: -8, y: 3 }
]

useHead({
  title: () => (isNotFound.value ? 'Page not found' : 'Error'),
  meta: [{ name: 'robots', content: 'noindex' }],
  noscript: [{ innerHTML: '<style>.crash *,.moon-shadow{animation:none!important}</style>' }]
})
</script>

<style scoped>
/*
 * The crash, built from small HTML layers over the static moon, moving with transform and opacity only.
 * Sizes and positions are in cqw (% of the scene), so it scales with the scene.
 * Every element's own style is the end state (shown without JavaScript or with reduced motion);
 * the animations run once, held on their first frame until .is-playing.
 *
 * Geometry (scene %): the moon disc is centred at (50, 50) with radius 40; its shadow is centred
 * at (74.5, 47) and fully dark out to radius 40. The impact point (44, 30) lies on the night side,
 * just inside the terminator.
 */
.scene {
  container-type: inline-size;
}

.crash {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* The flight: a steady drift sideways while gravity pulls it down, so the orbit curves into the moon. */
.sat-x,
.sat-y {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.sat-x {
  transform: translateX(44cqw);
  animation: sat-x 3.4s linear 1.2s both;
}

.sat-y {
  transform: translateY(30cqw);
  animation: sat-y 3.4s cubic-bezier(0.6, 0, 0.9, 0.5) 1.2s both;
}

.satellite {
  display: block;
  width: 9cqw;
  height: 4.5cqw;
  opacity: 0;
  transform: translate(-50%, -50%) rotate(560deg) scale(0.45);
  will-change: transform, opacity;
  animation: sat-tumble 3.4s cubic-bezier(0.5, 0, 0.9, 0.6) 1.2s both;
}

@keyframes sat-x {
  from {
    transform: translateX(94cqw);
  }
}

@keyframes sat-y {
  from {
    transform: translateY(4cqw);
  }
}

/* Spinning up as it falls, and shrinking as it heads away from us, down to the surface. */
@keyframes sat-tumble {
  0% {
    opacity: 0.001;
    transform: translate(-50%, -50%) rotate(-20deg) scale(1);
  }
  10%,
  99% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Impact: a flash, a shockwave and a few fragments, all centred on the impact point */
.impact {
  position: absolute;
  top: 30cqw;
  left: 44cqw;
}

.flash,
.shockwave,
.debris,
.crater {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 9999px;
  will-change: transform, opacity;
}

.flash {
  width: 16cqw;
  height: 16cqw;
  margin: -8cqw 0 0 -8cqw;
  background: radial-gradient(circle closest-side, rgb(255 255 255 / 0.95), rgb(199 210 254 / 0.6) 35%, rgb(129 140 248 / 0.2) 65%, transparent);
  opacity: 0;
  animation: flash 0.9s ease-out 4.6s both;
}

.shockwave {
  width: 14cqw;
  height: 14cqw;
  margin: -7cqw 0 0 -7cqw;
  border: 1px solid rgb(199 210 254 / 0.7);
  opacity: 0;
  animation: shockwave 1.1s cubic-bezier(0.2, 0.6, 0.3, 1) 4.6s both;
}

.debris {
  width: 0.9cqw;
  height: 0.9cqw;
  margin: -0.45cqw 0 0 -0.45cqw;
  background: var(--color-indigo-100);
  opacity: 0;
  transform: translate(var(--dx), var(--dy));
  animation: debris 1.2s cubic-bezier(0.15, 0.7, 0.4, 1) 4.6s both;
}

.crater {
  width: 3.2cqw;
  height: 2.4cqw;
  margin: -1.2cqw 0 0 -1.6cqw;
  background: radial-gradient(closest-side, transparent 45%, rgb(199 210 254 / 0.55) 62%, transparent);
  opacity: 0.8;
  animation: crater 1.6s ease-out 4.9s both;
}

@keyframes flash {
  0% {
    opacity: 0.001;
    transform: scale(0.1);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes shockwave {
  0% {
    opacity: 0.9;
    transform: scale(0.1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes debris {
  0% {
    opacity: 1;
    transform: none;
  }
  60% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}

@keyframes crater {
  from {
    opacity: 0.001;
  }
}

/* After the rules above: their animation shorthand would otherwise reset the play state. */
.crash * {
  animation-play-state: paused;
}

.crash.is-playing * {
  animation-play-state: running;
}

@media (prefers-reduced-motion: reduce) {
  .crash * {
    animation: none;
  }
}
</style>
