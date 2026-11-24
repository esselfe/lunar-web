<!-- The search shortcut, for the platform: ⌘K on Apple devices, Ctrl K elsewhere. An inline script in
     nuxt.config.ts sets data-platform="mac" on <html> before the first paint and main.css shows the
     matching label, so the text never swaps after load (without JavaScript it reads Ctrl K). -->
<template>
  <span class="shortcut-other">Ctrl K</span><span class="shortcut-mac">⌘K</span>
</template>
