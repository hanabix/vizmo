<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <div class="relative flex items-center">
    <span class="material-icons rotate-90 text-2xl" :class="{
      'text-green-500': value >= 75,
      'text-yellow-500': value >= 25 && value < 75,
      'text-red-500': value < 25
    }">
      {{ value >= 90 ? 'battery_full' :
         value >= 75 ? 'battery_6_bar' :
         value >= 50 ? 'battery_4_bar' :
         value >= 25 ? 'battery_2_bar' :
         'battery_1_bar' }}
    </span>
    <span class="absolute left-1/2 top-1/2 transform -translate-x-[calc(50%+1px)] -translate-y-1/2 text-[8px] font-medium text-gray-700">{{ value }}</span>
  </div>
</template>