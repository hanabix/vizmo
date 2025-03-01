<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { EventSource } from '../types'
import type { Meters } from '../modules/wit-motion'

const meters = [
  { label: '加速计', unit: ' g ' },
  { label: '陀螺仪', unit: '°/s' },
  { label: '旋转角', unit: ' ° ' }
]

const axis = [
  { label: 'X(东)', color: 'red' },
  { label: 'Y(北)', color: 'green' },
  { label: 'Z(天)', color: 'blue' }
]

const source = defineProps<EventSource<Meters>>()
const data = ref<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])

onMounted(() => {
  const cancel = source.observe((v) => { data.value = v })
  onBeforeUnmount(() => { cancel() })
})

</script>

<template>
  <table class="w-full text-xs table-fixed font-mono">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-2 py-1 font-medium text-gray-500"></th>
        <th v-for="{ label, color } in axis" class="px-2 py-1 text-right font-medium"
          :class="`text-${color}-500`">
          {{ label }}</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr v-for="({ label, unit }, i) in meters">
        <td class="px-2 py-1 text-gray-700">{{ label }}<small>[{{ unit }}]</small></td>
        <td v-for="(_, j) in axis" :key="j" class="px-2 py-1 text-right text-gray-700">{{ data[i][j].toFixed(2) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>