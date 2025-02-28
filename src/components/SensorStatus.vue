<script setup lang="ts">
defineProps<{
  battery: number
  firmware: string
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <div class="relative flex items-center">
      <span class="material-icons rotate-90 text-2xl" :class="{
        'text-green-500': battery >= 75,
        'text-yellow-500': battery >= 25 && battery < 75,
        'text-red-500': battery < 25
      }">
        {{ battery >= 90 ? 'battery_full' :
           battery >= 75 ? 'battery_6_bar' :
           battery >= 50 ? 'battery_4_bar' :
           battery >= 25 ? 'battery_2_bar' :
           'battery_1_bar' }}
      </span>
      <span class="absolute left-1/2 top-1/2 transform -translate-x-[calc(50%+1px)] -translate-y-1/2 text-[8px] font-medium text-gray-700">{{ battery }}</span>
    </div>
    <small class="text-xs text-gray-500">{{ firmware }}</small>
  </div>
</template>