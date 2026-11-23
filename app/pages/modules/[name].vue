<template>
  <div class="px-6 pt-10 pb-24">
    <div class="container mx-auto max-w-4xl">
      <!-- Stops at the section: the next crumb would repeat the <h1> -->
      <Breadcrumb :items="[{ label: 'Modules', path: '/modules' }, { label: module.section, path: `/modules/section/${module.section}` }]" />

      <div class="mt-10 grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1fr)_17rem] lg:grid-cols-[minmax(0,1fr)_21rem]">
        <header>
          <h1 class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-4xl font-bold tracking-[-0.035em] text-white sm:text-5xl">
            <span class="[overflow-wrap:anywhere]">{{ module.name }}</span>
            <span
              v-if="module.version"
              class="text-2xl font-semibold tracking-normal [overflow-wrap:anywhere] text-indigo-200 tabular-nums sm:text-3xl"
            >{{ module.version }}</span>
          </h1>
          <p class="mt-4 text-lg text-gray-300">
            {{ module.short ?? 'No description yet.' }}
            <ModuleBadges
              :module="module"
              class="ml-1"
            />
          </p>
          <p
            v-if="module.crater"
            class="mt-3 text-sm text-gray-400"
          >
            In the crater: upstream stopped developing it. It's still in the moonbase and still builds.
          </p>

          <!-- The command, with a copy button -->
          <div class="mt-6 flex max-w-md items-center justify-between gap-3 rounded-lg border border-white/10 bg-gray-900 py-2 pr-2 pl-4">
            <code class="truncate text-gray-100"><span
              class="text-purple-300 select-none"
              aria-hidden="true"
            >$ </span>lin {{ module.name }}</code>
            <button
              type="button"
              class="shrink-0 rounded-md px-2.5 py-1 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-300"
              @click="copy"
            >
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>

          <p class="mt-6 text-sm text-balance text-gray-400">
            {{ summary }}
          </p>
        </header>

        <figure class="mx-auto w-full max-w-72 md:max-w-none">
          <ModuleOrbit
            :name="module.name"
            :needs="orbitNeeds"
            :needed-by="orbitNeededBy"
          />
          <figcaption class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-indigo-200" />needs</span>
            <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full border-2 border-purple-300" />can use</span>
            <span>outer ring: depends on it</span>
          </figcaption>
        </figure>
      </div>

      <!-- Facts -->
      <dl class="mt-14 grid grid-cols-1 gap-x-10 gap-y-5 border-y border-white/10 py-8 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div v-if="isUrl(module.website)">
          <dt class="text-gray-450">
            Website
          </dt>
          <dd class="mt-1 truncate">
            <a
              :href="module.website"
              class="text-indigo-300 transition-colors hover:text-white"
            >{{ hostOf(module.website) }}</a>
          </dd>
        </div>
        <div v-if="isUrl(module.source)">
          <dt class="text-gray-450">
            Source
          </dt>
          <dd class="mt-1 truncate">
            <a
              :href="module.source"
              class="text-indigo-300 transition-colors hover:text-white"
            >{{ fileOf(module.source) }}</a>
          </dd>
        </div>
        <div>
          <dt class="text-gray-450">
            In the moonbase
          </dt>
          <dd class="mt-1">
            <a
              :href="folderUrl"
              class="text-indigo-300 transition-colors hover:text-white"
            >moonbase-{{ module.repo }}/{{ module.path }}</a>
          </dd>
        </div>
        <div v-if="module.entered">
          <dt class="text-gray-450">
            Joined the moonbase
          </dt>
          <dd class="mt-1 text-gray-200">
            <time :datetime="module.entered">{{ formatDate(module.entered) }}</time>
          </dd>
        </div>
        <div v-if="module.lastChange">
          <dt class="text-gray-450">
            Last change
          </dt>
          <dd class="mt-1 text-gray-200">
            <a
              :href="commitUrl(module.lastChange.commit)"
              class="text-indigo-300 transition-colors hover:text-white"
            ><time :datetime="module.lastChange.date">{{ formatDate(module.lastChange.date) }}</time></a>
            by {{ module.lastChange.author }}
          </dd>
        </div>
        <div v-if="extras.length">
          <dt class="text-gray-450">
            Also
          </dt>
          <dd class="mt-1 text-gray-200">
            {{ extras.join(', ') }}
          </dd>
        </div>
      </dl>

      <div class="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="space-y-14">
          <section
            v-if="paragraphs.length"
            aria-labelledby="about-title"
          >
            <h2
              id="about-title"
              class="text-xl font-semibold text-white"
            >
              About
            </h2>
            <p
              v-for="(paragraph, index) in paragraphs"
              :key="index"
              class="mt-3 max-w-[68ch] text-gray-300"
            >
              {{ paragraph }}
            </p>
          </section>

          <section
            v-if="questions.length"
            aria-labelledby="questions-title"
          >
            <h2
              id="questions-title"
              class="text-xl font-semibold text-white"
            >
              What lin asks
            </h2>
            <p class="mt-2 text-sm text-gray-400">
              Lin asks these before anything compiles, so you can walk away while it builds:
              which optional modules to use, and how to build it.
            </p>
            <ol class="mt-4 divide-y divide-white/5">
              <li
                v-for="(question, index) in questions"
                :key="index"
                class="flex items-baseline justify-between gap-4 py-2.5"
              >
                <span class="text-gray-300">
                  <template v-if="question.module">
                    <NuxtLink
                      v-if="related[question.module]"
                      :to="modulePath(question.module)"
                      class="font-medium text-indigo-300 hover:text-white"
                    >{{ question.module }}</NuxtLink><span
                      v-else
                      class="font-medium text-white"
                    >{{ question.module }}</span>
                    <span
                      v-if="question.text"
                      class="block text-sm text-gray-400"
                    >{{ question.text }}</span>
                  </template>
                  <template v-else>{{ question.text }}</template>
                </span>
                <span
                  v-if="question.default !== null"
                  class="shrink-0 text-xs text-gray-450"
                >default {{ question.default ? 'yes' : 'no' }}</span>
              </li>
            </ol>
          </section>

          <section
            v-if="module.history.length"
            aria-labelledby="history-title"
          >
            <h2
              id="history-title"
              class="text-xl font-semibold text-white"
            >
              Recent versions
            </h2>
            <ol class="mt-4 divide-y divide-white/5">
              <li
                v-for="change in module.history"
                :key="change.commit"
              >
                <a
                  :href="commitUrl(change.commit)"
                  class="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span class="font-semibold text-indigo-200 tabular-nums">{{ change.version }}</span>
                  <span class="truncate text-sm text-gray-400">{{ change.author }}</span>
                  <time
                    :datetime="change.date"
                    class="text-sm text-gray-450 tabular-nums"
                  >{{ formatDate(change.date) }}</time>
                </a>
              </li>
            </ol>
          </section>
        </div>

        <div class="space-y-14">
          <section aria-labelledby="needs-title">
            <h2
              id="needs-title"
              class="text-xl font-semibold text-white"
            >
              Needs
            </h2>
            <p
              v-if="!required.length"
              class="mt-3 text-gray-400"
            >
              Nothing: it builds with what every Lunar system has.
            </p>
            <ol
              v-else
              class="mt-4 divide-y divide-white/5"
            >
              <li
                v-for="dependency in required"
                :key="dependency.module"
                class="px-2 py-2.5"
              >
                <template v-if="dependency.module.startsWith('%') && !dependency.missing">
                  <span class="font-semibold text-white">{{ dependency.module }}</span>
                  <span class="text-sm text-gray-400"> one of
                    <template
                      v-for="(provider, index) in aliases[dependency.module]"
                      :key="provider"
                    ><template v-if="index">, </template><NuxtLink
                      :to="modulePath(provider)"
                      class="text-indigo-300 hover:text-white"
                    >{{ provider }}</NuxtLink></template>
                  </span>
                </template>
                <template v-else-if="dependency.missing">
                  <span class="font-semibold text-gray-300">{{ dependency.module }}</span>
                  <span class="text-sm text-gray-450"> not in the moonbase</span>
                </template>
                <NuxtLink
                  v-else
                  :to="modulePath(dependency.module)"
                  class="group block"
                >
                  <span class="block font-semibold text-white group-hover:text-indigo-200">{{ dependency.module }}</span>
                  <span
                    v-if="related[dependency.module]?.short"
                    class="block text-sm text-gray-400"
                  >{{ related[dependency.module]?.short }}</span>
                </NuxtLink>
                <span
                  v-if="dependency.conditional"
                  class="text-xs text-gray-450"
                > (only in some setups)</span>
              </li>
            </ol>
          </section>

          <section
            v-if="module.dependents.length"
            aria-labelledby="needed-by-title"
          >
            <h2
              id="needed-by-title"
              class="text-xl font-semibold text-white"
            >
              Depended on by
            </h2>
            <ModuleList
              class="mt-4"
              compact
              :modules="dependentsShown"
            />
            <details
              v-if="dependentsRest.length"
              class="mt-2"
            >
              <summary class="cursor-pointer px-2 py-2 text-sm font-medium text-indigo-300 hover:text-white">
                Show all {{ module.dependents.length }}
              </summary>
              <ModuleList
                compact
                :modules="dependentsRest"
              />
            </details>
          </section>
        </div>
      </div>

      <p class="mt-16 text-sm text-gray-450">
        From the moonbase index of {{ formatDate(generatedAt) }}.
        <a
          :href="folderUrl"
          class="text-indigo-300 transition-colors hover:text-white"
        >See the module's files on GitHub</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModulePage, ModuleSummary } from '#shared/types/moonbase-index'

const route = useRoute()
const name = computed(() => String(route.params.name))

const { data } = await useFetch<ModulePage>(() => `/api/moonbase/modules/${encodeURIComponent(name.value)}`, {
  key: `module-${name.value}`
})
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'This module is not in the moonbase', fatal: true })
}

const page = computed(() => data.value!)
const module = computed(() => page.value.module)
const related = computed(() => page.value.related)
const aliases = computed(() => page.value.aliases)
const generatedAt = computed(() => page.value.generatedAt)

usePageSeo(() => ({
  title: `${module.value.name} ${module.value.version ?? ''}`.trim(),
  description: module.value.short ?? `The ${module.value.name} module in the Lunar Linux moonbase.`
}))

const required = computed(() => module.value.depends.filter(dependency => !dependency.optional))
const optional = computed(() => module.value.depends.filter(dependency => dependency.optional))

/** Optional dependencies (as lin asks about them) and the CONFIGURE questions */
const questions = computed(() => [
  ...optional.value.map(dependency => ({
    module: dependency.module,
    text: dependency.optional!.description.replace(/\?$/, ''),
    default: dependency.optional!.default
  })),
  ...module.value.questions.map(question => ({ module: null, text: question.question, default: question.default }))
])

const DEPENDENTS_SHOWN = 12
const dependentSummaries = computed(() => module.value.dependents.map((dependent): ModuleSummary => ({
  ...(related.value[dependent.module] ?? { name: dependent.module, version: null, section: '', short: null }),
  ...(dependent.optional ? { short: `${related.value[dependent.module]?.short ?? ''} (optional)`.trim() } : {})
})))
const dependentsShown = computed(() => dependentSummaries.value.slice(0, DEPENDENTS_SHOWN))
const dependentsRest = computed(() => dependentSummaries.value.slice(DEPENDENTS_SHOWN))

const orbitNeeds = computed(() => module.value.depends.map(dependency => ({
  name: dependency.module,
  optional: !!dependency.optional,
  missing: !!dependency.missing,
  short: related.value[dependency.module]?.short ?? (dependency.module.startsWith('%')
    ? `One of ${aliases.value[dependency.module]?.join(', ') ?? ''}`
    : null),
  to: modulePath(dependency.module.startsWith('%') ? aliases.value[dependency.module]?.[0] ?? '' : dependency.module)
})))
const orbitNeededBy = computed(() => module.value.dependents.map(dependent => ({
  name: dependent.module,
  optional: !!dependent.optional,
  short: related.value[dependent.module]?.short ?? null,
  to: modulePath(dependent.module)
})))

/** "Needs 25 modules (189 counting theirs), can use 4 more. 367 modules depend on it." */
const summary = computed(() => {
  const needs = required.value.length
  const all = module.value.bringsAlong
  const dependents = module.value.dependents.length
  return [
    needs ? `Needs ${plural(needs, 'module')}` : 'Needs no other modules',
    all > needs ? ` (${all} counting theirs)` : '',
    optional.value.length ? `, can use ${optional.value.length} more` : '',
    '. ',
    dependents ? `${plural(dependents, 'module')} ${dependents === 1 ? 'depends' : 'depend'} on it.` : 'Nothing depends on it.'
  ].join('')
})

const paragraphs = computed(() => (module.value.description ?? '')
  .split(/\n\s*\n/)
  .map(paragraph => paragraph.replace(/\s*\n\s*/g, ' ').trim())
  .filter(Boolean))

const extras = computed(() => [
  module.value.systemd && 'ships systemd units',
  module.value.patches && `${plural(module.value.patches, 'patch', 'patches')}`,
  module.value.plugin && 'adds a lunar plugin'
].filter((extra): extra is string => !!extra))

const repoUrl = computed(() => `https://github.com/lunar-linux/moonbase-${module.value.repo}`)
const folderUrl = computed(() => `${repoUrl.value}/tree/master/${module.value.path}`)
const commitUrl = (commit: string) => `${repoUrl.value}/commit/${commit}`

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`
// The index only keeps real URLs; this guards the links anyway (a relative one would point into /modules)
const isUrl = (value: string | null): value is string => !!value && /^(?:https?|ftp):\/\//i.test(value)
const hostOf = (url: string) => url.replace(/^\w+:\/\/(www\.)?/, '').replace(/\/$/, '')
const fileOf = (url: string) => url.split('/').filter(Boolean).at(-1) ?? url

const copied = ref(false)
const copy = async () => {
  try {
    await navigator.clipboard.writeText(`lin ${module.value.name}`)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard not available (insecure context): the command is right there to select
  }
}
</script>
