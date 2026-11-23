<template>
  <section
    class="hero relative isolate flex min-h-[calc(100svh-6rem)] items-center overflow-hidden"
    aria-labelledby="hero-title"
  >
    <!-- Sky layer: stars and moon, faded out towards the bottom ("horizon") into the page background -->
    <div
      class="hero-sky pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
    >
      <!-- Fixed star positions so the server and client render the same thing -->
      <svg
        class="hero-stars absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 900"
      >
        <circle
          v-for="(star, index) in stars"
          :key="index"
          :cx="star.x"
          :cy="star.y"
          :r="star.r"
          :fill-opacity="star.o"
          fill="#E0E7FF"
        />
      </svg>

      <!-- A few stars that slowly twinkle (separate elements: cheap to animate on phones) -->
      <span
        v-for="(star, index) in twinkles"
        :key="`twinkle-${index}`"
        class="twinkle absolute rounded-full bg-white"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDuration: `${star.duration}s`,
          animationDelay: `${star.delay}s`
        }"
      />

      <!-- One shooting star per session, a while after the page settles -->
      <span
        class="shooting-star absolute"
        :class="{ 'is-shooting': isShooting }"
      />

      <!-- The moon: low on the right, cropped by the viewport edge -->
      <div class="hero-moon absolute">
        <div class="hero-moon-set">
          <div
            class="hero-moon-rise"
            :class="{ 'is-playing': isMoonReady }"
          >
            <LunarMoon
              :play="isMoonReady"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="hero-copy container mx-auto px-6 py-16">
      <div class="max-w-xl">
        <h1
          id="hero-title"
          class="text-4xl leading-[1.1] font-bold tracking-[-0.035em] text-balance text-white sm:text-5xl lg:text-6xl"
        >
          Build your Linux from source.
        </h1>
        <p class="mt-6 max-w-md text-lg leading-relaxed text-gray-300">
          Lunar compiles every package on your machine, with the options you pick.
          One command, <code class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-base text-indigo-200">lin</code>, keeps it simple.
        </p>
        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            to="/download"
            class="rounded-lg bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Download Lunar
          </NuxtLink>
          <NuxtLink
            to="/docs"
            class="rounded-lg border border-white/15 px-6 py-3 font-medium text-gray-100 transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Read the docs
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/*
 * Start the moon's rise and "first light" only once the page has settled: on a cold load the
 * browser is busy fetching and starting the app, swapping in fonts and painting the moon's
 * noise texture for the first time, and the animation would stutter. Cached loads start at once.
 */
const isMoonReady = usePageSettled()
watch(isMoonReady, () => scheduleShootingStar(), { once: true })

/*
 * The twinkling stars, in % of the hero. Placed in open sky: clear of the copy and the moon (top
 * right on phones, the right half on desktop) and above the "horizon" fade (60% down), so most are
 * visible at any width. Each has its own pace, and negative delays start them out of step.
 */
const twinkles = [
  { x: 9, y: 14, size: 2.5, duration: 6.5, delay: 0 },
  { x: 47, y: 9, size: 2, duration: 8.5, delay: -2.2 },
  { x: 26, y: 19, size: 1.5, duration: 9.5, delay: -4 },
  { x: 36, y: 24, size: 2, duration: 7.5, delay: -5 },
  { x: 64, y: 10, size: 1.5, duration: 11, delay: -6 },
  { x: 88, y: 9, size: 2, duration: 7, delay: -1.5 },
  { x: 2, y: 42, size: 1.5, duration: 10, delay: -7 },
  { x: 55, y: 68, size: 2, duration: 6, delay: -2.5 },
  { x: 80, y: 64, size: 2, duration: 9, delay: -3 },
  { x: 93, y: 72, size: 2.5, duration: 8, delay: -0.8 }
]

/*
 * A single shooting star, once per browser session, ~8s after the page has settled — and only if
 * the hero is still on screen and the tab is visible. Most visitors won't see it; that's the point.
 */
const SHOOTING_STAR_KEY = 'lunar:shooting-star-seen'
const isShooting = ref(false)
let shootingTimer: ReturnType<typeof setTimeout> | undefined

const scheduleShootingStar = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try {
    if (sessionStorage.getItem(SHOOTING_STAR_KEY)) return
  } catch {
    // Storage unavailable (private mode, blocked): just allow it.
  }
  shootingTimer = setTimeout(() => {
    const heroInView = window.scrollY < window.innerHeight * 0.5
    if (!heroInView || document.visibilityState !== 'visible') return
    isShooting.value = true
    try {
      sessionStorage.setItem(SHOOTING_STAR_KEY, '1')
    } catch {
      // Ignore: worst case it can show again this session.
    }
  }, 8000)
}

onBeforeUnmount(() => clearTimeout(shootingTimer))

// Without JavaScript nothing would start the animations: show the moon as is.
useHead({
  noscript: [{ innerHTML: '<style>.hero-moon-rise,.moon-shadow{animation:none!important}</style>' }]
})

type Star = { x: number, y: number, r: number, o: number }

// Small deterministic PRNG (mulberry32) so the starfield is identical on every render.
const seededRandom = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const random = seededRandom(1969)
const stars: Star[] = Array.from({ length: 140 }, () => {
  const bright = random() > 0.92
  return {
    x: Math.round(random() * 1600),
    y: Math.round(random() * 760),
    r: bright ? 1.6 : 0.6 + random() * 0.7,
    o: bright ? 0.9 : 0.25 + random() * 0.45
  }
})
</script>

<style scoped>
.twinkle {
  box-shadow: 0 0 6px 1px color-mix(in oklab, var(--color-indigo-200) 50%, transparent);
  opacity: 0.85;
  will-change: opacity;
  animation-name: twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 0.2;
  }
}

/* A thin streak, head on the right; it travels along its own (tilted) axis. */
.shooting-star {
  left: 30%;
  top: 12%;
  width: 140px;
  height: 1.5px;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-indigo-100) 80%, transparent) 70%, #fff);
  opacity: 0;
  transform: rotate(18deg);
  transform-origin: left center;
  will-change: transform, opacity;
}

.shooting-star.is-shooting {
  animation: shooting-star 0.9s cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
}

@keyframes shooting-star {
  0% {
    opacity: 0;
    transform: rotate(18deg) translateX(0) scaleX(0.4);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(18deg) translateX(min(38vw, 520px)) scaleX(1);
  }
}

.hero-sky {
  mask-image: linear-gradient(to bottom, transparent 0, black 12%, black 60%, transparent 100%);
}

.hero-moon {
  /* Large and cropped on desktop; smaller, behind the text, on narrow screens. */
  width: min(115vw, 820px);
  aspect-ratio: 1;
  right: -32%;
  top: -6%;
}

@media (min-width: 768px) {
  .hero-moon {
    width: min(68vw, 860px);
    right: -12%;
    top: 50%;
    translate: 0 -46%;
  }
}

/*
 * On phones the moon sits behind the text: dim its light (not the whole moon, which would let the
 * stars show through the dark side).
 */
@media (max-width: 767px) {
  .hero-moon {
    --moon-light: 0.35;
  }
}

/* One orchestrated moment: the moon rises once when the page loads. */
.hero-moon-set,
.hero-moon-rise {
  width: 100%;
  height: 100%;
}

/* Held on its first frame until the page is ready (see isMoonReady), then plays once. */
.hero-moon-rise {
  animation: moonrise 1.6s cubic-bezier(0.2, 0.7, 0.2, 1) both paused;
}

.hero-moon-rise.is-playing {
  animation-play-state: running;
}

@keyframes moonrise {
  from {
    /* Not 0: an invisible layer isn't painted, and painting it is what we want done up front. */
    opacity: 0.001;
    transform: translateY(10%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Scrolling away: the moon sets, the stars fade, the copy drifts up. */
@supports (animation-timeline: view()) {
  .hero {
    view-timeline-name: --hero;
  }

  .hero-moon-set,
  .hero-stars,
  .hero-copy {
    animation-duration: auto;
    animation-fill-mode: both;
    animation-timing-function: linear;
    animation-timeline: --hero;
    animation-range: exit 0% exit 100%;
  }

  .hero-moon-set {
    animation-name: moonset;
  }

  .hero-stars {
    animation-name: stars-fade;
  }

  .hero-copy {
    animation-name: copy-drift;
  }
}

@keyframes moonset {
  to {
    transform: translateY(45%);
    opacity: 0.15;
  }
}

@keyframes stars-fade {
  to {
    transform: translateY(12%);
    opacity: 0;
  }
}

@keyframes copy-drift {
  to {
    transform: translateY(-18%);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .twinkle,
  .shooting-star {
    animation: none !important;
  }

  .hero-moon-set,
  .hero-moon-rise,
  .hero-stars,
  .hero-copy {
    animation: none !important;
  }
}
</style>
