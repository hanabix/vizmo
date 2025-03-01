<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import type { Meters } from '../modules/wit-motion'
import type { EventSource } from '../types'
import attach from '../modules/indicator'

const source = defineProps<EventSource<Meters>>()
const containerRef = ref<HTMLDivElement>()

onMounted(() => {
  if (!containerRef.value) throw new Error('containerRef is undefined')

  const { refresh, resize, dispose } = attach(containerRef.value)
  const cancel = source.observe(([acc, _, rot]) => {
    const [x, y, z] = rot.map(v => v * Math.PI / 180)
    const e = new THREE.Euler(y, z, x, 'YXZ')
    const v = new THREE.Vector3(...acc)
    refresh(v, e)
  })

  window.addEventListener('resize', () => resize())
  onBeforeUnmount(() => {
    cancel()
    dispose()
  })
})

</script>

<template>
  <div ref="containerRef" class="min-h-[300px] rounded-lg overflow-hidden"></div>
</template>
