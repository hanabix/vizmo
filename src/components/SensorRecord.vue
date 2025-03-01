<script setup lang="ts">
import { ref } from 'vue'
import type { EventSource } from '../types'
import type { Meters } from '../modules/wit-motion'

const source = defineProps<EventSource<Meters>>()
const recording = ref<boolean>(false)
const recordedData = ref<Meters[]>([])

function toggleRecording() {
  if (recording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function startRecording() {
  recording.value = true
  recordedData.value = []
  source.observe((value) => {
    if (recording.value) {
      recordedData.value.push(value)
    }
  })
}

function stopRecording() {
  recording.value = false
  console.log('Recorded data:', recordedData.value)
  // TODO: 在这里添加数据导出功能
}
</script>

<template>
  <div class="flex items-center justify-center">
    <button @click="toggleRecording"
      class="p-2 rounded-full flex items-center justify-center"
      :class="recording ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'"
      :title="recording ? '停止录制' : '开始录制'">
      <span class="material-icons">{{ recording ? 'stop' : 'fiber_manual_record' }}</span>
    </button>
  </div>
</template>