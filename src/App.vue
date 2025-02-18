<script setup lang="ts">
import PWABadge from './components/PWABadge.vue'
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 bg-gray-600 p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-white">WitMotion BLE</h1>
    <button class="p-2 rounded-lg hover:bg-gray-800">
      <svg class="h-6 w-6 text-white" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </nav>
  <PWABadge />
</template>

<style scoped>
</style>
