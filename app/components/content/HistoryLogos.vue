<!--
  Lunar's two faces side by side for the history page (`:::history-logos` in MDC): the December 2003
  logo, shown on a light panel the way the old white website showed it, and the 2022 logo that this
  site uses. The old one survives only as a 301×70 PNG (from the old web server), so it is shown no
  wider than that. Static: the page's one moving moment is the moonlight calendar.
-->
<template>
  <figure class="not-prose my-10">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="flex flex-col overflow-hidden rounded-2xl border border-white/10">
        <div class="flex h-36 items-center justify-center bg-gray-100 px-6">
          <img
            src="~/assets/history/lunar-logo-2003.png"
            alt="The 2003 Lunar Linux logo: a scowling penguin silhouette against the Moon, beside the words Lunar Linux"
            width="301"
            height="70"
            loading="lazy"
            class="h-auto w-full max-w-[16rem]"
          >
        </div>
        <p class="flex items-baseline justify-between gap-3 bg-gray-900 px-5 py-3 text-sm">
          <span class="font-semibold text-gray-200">2003–2022</span>
          <span class="text-gray-450">"menacing and evil"</span>
        </p>
      </div>

      <div class="flex flex-col overflow-hidden rounded-2xl border border-indigo-300/30">
        <div class="flex h-36 items-center justify-center bg-gray-950 px-6">
          <img
            src="~/assets/lunar_logo-01-full-dark.svg"
            alt="The current Lunar Linux logo, introduced in 2022"
            width="1495"
            height="560"
            loading="lazy"
            class="h-auto w-full max-w-[12rem]"
          >
        </div>
        <p class="flex items-baseline justify-between gap-3 bg-gray-900 px-5 py-3 text-sm">
          <span class="font-semibold text-indigo-200">2022–today</span>
          <span class="text-gray-450">the one up top</span>
        </p>
      </div>
    </div>
    <figcaption class="mt-3 text-center text-sm text-gray-450">
      Nearly two decades apart, same Moon.
    </figcaption>
  </figure>
</template>
