<template>
  <!--
    A module and its neighbours as an orbit: what it needs on the inner ring (filled: required,
    hollow: optional), what needs it on the outer ring. Hovering a dot names it; clicking opens it.
    The lists below the orbit say the same in words, so the drawing is hidden from screen readers.

    Animation (AGENTS.md, iPhone rules): each ring is its own static SVG layer that rotates in with
    `transform` and `opacity` only. The server renders the final state.
  -->
  <div
    ref="root"
    class="orbit"
    :class="{ 'is-waiting': waiting, 'is-playing': playing }"
    aria-hidden="true"
  >
    <svg
      class="orbit-layer"
      viewBox="0 0 400 400"
    >
      <defs>
        <radialGradient
          id="orbit-planet"
          cx="38%"
          cy="34%"
          r="75%"
        >
          <stop
            offset="0"
            stop-color="#c7d2fe"
          />
          <stop
            offset="0.55"
            stop-color="#6366f1"
          />
          <stop
            offset="1"
            stop-color="#1e1b4b"
          />
        </radialGradient>
      </defs>
      <circle
        cx="200"
        cy="200"
        :r="INNER"
        class="orbit-track"
      />
      <circle
        cx="200"
        cy="200"
        :r="OUTER"
        class="orbit-track"
      />
      <circle
        cx="200"
        cy="200"
        r="46"
        fill="url(#orbit-planet)"
      />
      <text
        x="200"
        y="205"
        text-anchor="middle"
        class="orbit-name"
      >{{ label }}</text>
    </svg>

    <svg
      v-for="ring in rings"
      :key="ring.key"
      class="orbit-layer"
      :class="`orbit-${ring.key}`"
      viewBox="0 0 400 400"
    >
      <a
        v-for="dot in ring.dots"
        :key="dot.key"
        :href="dot.to ? withBase(dot.to) : undefined"
        tabindex="-1"
        :class="{ 'is-hovered': hovered?.key === dot.key }"
        @click="go($event, dot.to)"
        @mouseenter="hovered = dot"
        @mouseleave="hovered = null"
      >
        <!-- A larger, invisible target, so the small dots are easy to hover -->
        <circle
          :cx="dot.x"
          :cy="dot.y"
          r="11"
          class="orbit-hit"
        />
        <circle
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.r"
          class="orbit-dot"
          :class="dot.className"
        />
      </a>
      <text
        v-if="ring.more"
        x="200"
        :y="200 + ring.radius + 22"
        text-anchor="middle"
        class="orbit-more"
      >+{{ ring.more }} more</text>
    </svg>

    <!-- The hovered dot's name, beside it (outside the rotating layers) -->
    <p
      v-if="hovered"
      class="orbit-label"
      :class="hovered.x < 110 ? 'is-left' : hovered.x > 290 ? 'is-right' : ''"
      :style="{ left: `${hovered.x / 4}%`, top: `${hovered.y / 4}%` }"
    >
      <span class="block font-semibold text-white">{{ hovered.name }}</span>
      <span
        v-if="hovered.short"
        class="block text-gray-400"
      >{{ hovered.short }}</span>
      <span
        v-if="hovered.note"
        class="block text-gray-450"
      >{{ hovered.note }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
export type OrbitBody = {
  name: string
  optional?: boolean
  /** Not in the moonbase: drawn dim, not a link */
  missing?: boolean
  /** Where its dot links to */
  to?: string
  /** Its short description, shown on hover */
  short?: string | null
}

const props = defineProps<{
  name: string
  /** Inner ring: what the module needs */
  needs: OrbitBody[]
  /** Outer ring: what needs the module */
  neededBy: OrbitBody[]
}>()

const INNER = 104
const OUTER = 168
const MAX_INNER = 32
const MAX_OUTER = 72

const label = computed(() => (props.name.length > 11 ? `${props.name.slice(0, 10)}…` : props.name))

const place = (bodies: OrbitBody[], radius: number, max: number, size: number, key: string) => {
  const shown = bodies.slice(0, max)
  const dots = shown.map((body, index) => {
    const angle = -Math.PI / 2 + (index / shown.length) * Math.PI * 2
    return {
      key: `${key}-${body.name}`,
      x: Math.round((200 + Math.cos(angle) * radius) * 10) / 10,
      y: Math.round((200 + Math.sin(angle) * radius) * 10) / 10,
      r: body.optional ? size - 1 : size,
      to: body.missing ? undefined : body.to,
      name: body.name,
      short: body.short ?? null,
      note: body.missing ? 'Not in the moonbase' : body.optional ? 'Optional' : null,
      className: body.missing ? 'is-missing' : body.optional ? 'is-optional' : 'is-required'
    }
  })
  return { key, radius, dots, more: bodies.length - shown.length }
}

const rings = computed(() => [
  place(props.needs, INNER, MAX_INNER, 7, 'inner'),
  place(props.neededBy, OUTER, MAX_OUTER, 5, 'outer')
])

const { withBase } = useSiteLinks()

type Dot = ReturnType<typeof place>['dots'][number]
const hovered = ref<Dot | null>(null)

/** Dots are plain SVG links; follow them in the app unless a modifier key asks for a new tab. */
const go = (event: MouseEvent, to?: string) => {
  if (!to || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  navigateTo(to)
}

// Hold the rings until the page has settled, then let them swing into place once
const waiting = ref(false)
const playing = ref(false)
const settled = usePageSettled()

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  waiting.value = true
})

watch(settled, (isSettled) => {
  if (!isSettled || !waiting.value) return
  requestAnimationFrame(() => {
    waiting.value = false
    playing.value = true
  })
})
</script>

<style scoped>
.orbit {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
}

.orbit-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  /* The layers are stacked: only the dots take the pointer, so every ring can be hovered */
  pointer-events: none;
}

.orbit-layer a {
  pointer-events: auto;
}

.orbit-hit {
  fill: transparent;
}

.orbit-track {
  fill: none;
  stroke: rgb(165 180 252 / 0.35);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 0.5 7;
}

.orbit-name {
  fill: #fff;
  font-size: 15px;
  font-weight: 600;
}

.orbit-more {
  fill: var(--color-gray-400);
  font-size: 13px;
}

.is-required {
  fill: var(--color-indigo-200);
}

.is-optional {
  fill: var(--color-gray-950);
  stroke: var(--color-purple-300);
  stroke-width: 2;
}

.is-missing {
  fill: var(--color-gray-700);
}

/* Instant, no transition: hover feedback should never lag */
a.is-hovered .orbit-dot {
  fill: #fff;
  stroke: #fff;
}

.orbit-label {
  position: absolute;
  z-index: 10;
  width: max-content;
  max-width: 14rem;
  margin: 0;
  /* Above the dot, centred on it; near the edges it hangs inwards instead */
  transform: translate(-50%, calc(-100% - 14px));
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 0.5rem;
  background: var(--color-gray-900);
  padding: 0.4rem 0.65rem;
  font-size: 0.75rem;
  line-height: 1.4;
  pointer-events: none;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
}

.orbit-label.is-left {
  transform: translate(-12%, calc(-100% - 14px));
}

.orbit-label.is-right {
  transform: translate(-88%, calc(-100% - 14px));
}

/* Waiting for the page to settle: rings wound back and (nearly) invisible */
.is-waiting .orbit-inner,
.is-waiting .orbit-outer {
  opacity: 0.001;
  transform: rotate(-70deg) scale(0.9);
}

.orbit-inner,
.orbit-outer {
  transform-origin: 50% 50%;
  will-change: transform, opacity;
}

.is-playing .orbit-inner,
.is-playing .orbit-outer {
  transition: transform 1.6s cubic-bezier(0.16, 0.84, 0.3, 1), opacity 0.9s ease-out;
}

.is-playing .orbit-outer {
  transition-delay: 0.25s;
}
</style>
