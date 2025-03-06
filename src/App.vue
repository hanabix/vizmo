<script setup lang="ts">
import { ref, type Component, onErrorCaptured, provide } from 'vue'
import cacheBy from './modules/cache'
import createIndicator from './modules/indicator'
import Key from './components/key'

import PWABadge from './components/PWABadge.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import type { View } from './views'
import Home from './views/Home.vue'
import Multiselect from './views/Multiselect.vue'
import Gather from './views/Gather.vue'
import Playback from './views/Playback.vue'

const views: Record<View, Component> = {
  Home,
  Multiselect,
  Gather,
  Playback
}

const current = ref<View>('Home')

onErrorCaptured((err, instance, info) => {
  console.error(err, instance, info)
  return false
})

provide(Key.indicators, cacheBy(createIndicator))
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-gray-700 flex items-center gap-1">
      <span class="material-icons text-blue-500">bluetooth_searching</span>
      Vizmo
    </h1>
  </nav>

  <main class="container mx-auto p-4 mt-20">
    <component :is="views[current]" :to="(v: View) => current = v" />
  </main>

  <PWABadge />

  <GitHubCorner />

</template>
./views