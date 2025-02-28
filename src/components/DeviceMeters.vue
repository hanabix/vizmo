<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Meters, Sensor, Features, Settings } from "../modules/wit-motion"
import VSensor from './VSimulator.vue'

const agent = defineProps<Sensor<Features & Settings>>()

const meters = ref<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])


onMounted(() => {
  agent.watch((data) => meters.value = data)
})
</script>

<template>
  <div class="mt-4">
    <!-- <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">加速度</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ fixed(meters[0][0]) }}g</div>
          <div>Y: {{ fixed(meters[0][1]) }}g</div>
          <div>Z: {{ fixed(meters[0][2]) }}g</div>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">陀螺仪</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ fixed(meters[1][0]) }}°/s</div>
          <div>Y: {{ fixed(meters[1][1]) }}°/s</div>
          <div>Z: {{ fixed(meters[1][2]) }}°/s</div>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">旋转角</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ fixed(meters[2][0]) }}°</div>
          <div>Y: {{ fixed(meters[2][1]) }}°</div>
          <div>Z: {{ fixed(meters[2][2]) }}°</div>
        </div>
      </div>
    </div> -->

      <VSensor v-bind="agent" class="mx-0" />
  </div>

</template>