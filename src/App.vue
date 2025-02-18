<script setup lang="ts">
import PWABadge from './components/PWABadge.vue'
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-gray-600 flex items-center gap-1">
      <span class="material-icons text-blue-500">bluetooth</span>
      WitMotion
    </h1>
    <button class="p-2 hover:bg-gray-100 flex items-center">
      <span class="material-icons text-2xl text-gray-600">more_vert</span>
    </button>
  </nav>
  <PWABadge />
</template>

<style scoped>
</style>
