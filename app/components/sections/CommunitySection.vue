<template>
  <section
    id="community"
    class="px-6 py-24"
    aria-labelledby="community-title"
  >
    <div class="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <div>
        <h2
          id="community-title"
          class="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Talk to us on IRC
        </h2>
        <p class="mt-4 max-w-lg text-gray-300">
          Users and developers meet in <span class="font-medium text-white">#lunar</span> on Libera.Chat.
          Ask questions, share what you've built, or help someone else get started.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href="https://web.libera.chat/#lunar"
            class="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Open web chat
          </a>
          <p class="font-mono text-sm text-gray-400">
            irc.libera.chat <span class="text-gray-200">#lunar</span>
          </p>
        </div>
      </div>

      <div>
        <h3 class="font-semibold text-white">
          Ways to help
        </h3>
        <!-- A small constellation: each way to help is a star, joined like a star chart -->
        <div
          ref="constellation"
          class="constellation relative mt-6 h-80"
          :class="`is-${drawState}`"
        >
          <svg
            class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <!--
              Each dotted line is revealed by a solid "pen stroke" mask drawn from star to star.
              The pen deliberately has no non-scaling-stroke: combined with pathLength, browsers
              then compute the dash in screen pixels and the pen repeats along the line.
            -->
            <defs>
              <mask
                v-for="(line, index) in lines"
                :id="maskId(index)"
                :key="index"
                maskUnits="userSpaceOnUse"
                x="-5"
                y="-5"
                width="110"
                height="110"
              >
                <line
                  class="pen"
                  :style="{ '--delay': `${line.delay}s` }"
                  :x1="line.x1"
                  :y1="line.y1"
                  :x2="line.x2"
                  :y2="line.y2"
                  pathLength="1"
                  stroke="white"
                  stroke-width="4"
                />
              </mask>
            </defs>
            <line
              v-for="(line, index) in lines"
              :key="index"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
              :mask="`url(#${maskId(index)})`"
              stroke="#A5B4FC"
              stroke-opacity="0.25"
              stroke-width="1"
              stroke-dasharray="2 4"
              vector-effect="non-scaling-stroke"
            />
            <circle
              v-for="(dust, index) in stardust"
              :key="`dust-${index}`"
              class="dust"
              :style="{ '--delay': `${index * 0.12}s` }"
              :cx="dust.x"
              :cy="dust.y"
              r="0.45"
              fill="#E0E7FF"
              :fill-opacity="dust.o"
            />
          </svg>

          <ul>
            <li
              v-for="(link, index) in helpLinks"
              :key="link.text"
              class="absolute"
              :style="{ 'left': `${link.x}%`, 'top': `${link.y}%`, '--delay': `${index * STEP}s` }"
            >
              <component
                :is="link.href.startsWith('/') ? NuxtLink : 'a'"
                v-bind="link.href.startsWith('/') ? { to: link.href } : { href: link.href }"
                class="star group"
              >
                <span
                  class="star-dot"
                  aria-hidden="true"
                />
                <span class="star-label">{{ link.text }}</span>
              </component>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

/** x/y are positions in the constellation box, in percent. */
type HelpLink = { text: string, href: string, x: number, y: number }

// A loose zigzag; labels sit to the right of their star and the lines are steep enough to pass
// between labels rather than under them.
// TODO: replace the '#' placeholders once the real destinations are confirmed.
const helpLinks: HelpLink[] = [
  { text: 'Contribute code on GitHub', href: 'https://github.com/lunar-linux', x: 4, y: 8 },
  { text: 'Improve the documentation', href: '/docs/contributing', x: 40, y: 36 },
  { text: 'Help others in the forums', href: '#', x: 14, y: 64 },
  { text: 'Follow Lunar on social media', href: '#', x: 46, y: 92 }
]

// Which stars are joined (indexes into helpLinks), in drawing order.
const constellationLines: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [0, 2]]

/*
 * Draw-in, once, when the constellation first scrolls into view: star 1 lights up, a line draws to
 * star 2, star 2 lights up, … and the last line closes the shape. Server-rendered and no-JS pages
 * (and reduced motion) show the finished constellation; the hidden "pending" state is client-only.
 */
const STEP = 0.45 // seconds between stars; each line takes the time between its two stars
const lines = constellationLines.map(([from, to], index) => ({
  x1: helpLinks[from]!.x,
  y1: helpLinks[from]!.y,
  x2: helpLinks[to]!.x,
  y2: helpLinks[to]!.y,
  delay: 0.1 + index * STEP
}))

const uid = useId()
const maskId = (index: number) => `constellation-${uid}-${index}`

type DrawState = 'idle' | 'pending' | 'drawing'
const drawState = ref<DrawState>('idle')
const constellation = ref<HTMLElement>()
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!constellation.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  drawState.value = 'pending'
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    observer?.disconnect()
    // Next frame, so the hidden state has been painted before the transitions start.
    requestAnimationFrame(() => {
      drawState.value = 'drawing'
    })
  }, { threshold: 0.4 })
  observer.observe(constellation.value)
})

onBeforeUnmount(() => observer?.disconnect())

// A few faint unlabeled stars to fill the sky.
const stardust = [
  { x: 70, y: 4, o: 0.45 }, { x: 92, y: 20, o: 0.3 }, { x: 84, y: 52, o: 0.4 },
  { x: 2, y: 86, o: 0.3 }, { x: 96, y: 76, o: 0.35 }, { x: 28, y: 40, o: 0.3 }
]
</script>

<style scoped>
/* Draw-in: "pending" hides everything instantly; "drawing" transitions it in, staggered by --delay. */
.constellation.is-pending .pen {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
}

.constellation.is-drawing .pen {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.45s ease-in-out var(--delay);
}

.constellation.is-pending .star {
  opacity: 0;
  scale: 0.6;
}

.constellation.is-drawing .star {
  transition:
    opacity 0.5s ease var(--delay),
    scale 0.6s cubic-bezier(0.3, 1.6, 0.5, 1) var(--delay);
}

.constellation.is-pending .dust {
  opacity: 0;
}

.constellation.is-drawing .dust {
  transition: opacity 0.8s ease var(--delay);
}

.star {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  left: 0;
  width: max-content;
  max-width: 11rem;
  border-radius: 0.5rem;
  /* Centre the dot (0.75rem) on the star's position; the label extends to the right. */
  translate: -0.375rem -50%;
}

@media (min-width: 640px) {
  .star {
    max-width: 16rem;
  }
}

.star-dot {
  flex: none;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: radial-gradient(circle, #fff 0 30%, var(--color-indigo-200) 45%, transparent 72%);
  box-shadow: 0 0 10px 2px color-mix(in oklab, var(--color-indigo-300) 35%, transparent);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.star-label {
  color: var(--color-gray-300);
  line-height: 1.3;
  transition: color 0.2s;
}

.star:hover .star-dot,
.star:focus-visible .star-dot {
  transform: scale(1.5);
  box-shadow: 0 0 18px 6px color-mix(in oklab, var(--color-indigo-300) 55%, transparent);
}

.star:hover .star-label,
.star:focus-visible .star-label {
  color: var(--color-white);
}

.star:focus-visible {
  outline: 2px solid var(--color-indigo-300);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .star-dot {
    transition: none;
  }
}
</style>
