<script setup lang="ts">
import { inject } from 'vue'
import Key from './key'
import { complain } from '../modules/utils'

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

const data = inject(Key.meters) ?? complain('failed to inject metersRef')

</script>

<template>
  <table class="w-full text-xs table-fixed font-mono">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-2 py-1 font-medium text-gray-500"></th>
        <th v-for="{ label, color } in axis" class="px-2 py-1 text-right font-medium" :class="`text-${color}-500`">
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
</template>./keys./key