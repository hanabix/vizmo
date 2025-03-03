<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import Key from './key'
import * as THREE from 'three'
import attach from '../modules/indicator'
import type { Meters } from '../modules/wit-motion'
import { complain } from '../modules/utils'

const containerRef = ref<HTMLDivElement>()
const data = inject(Key.meters) ?? complain('failed to inject metersRef')
const convert: (m: Meters) => [THREE.Vector3, THREE.Euler] = ([acc, _, rot]) => {
  const [x, y, z] = rot.map(v => v * Math.PI / 180)
  return [(new THREE.Vector3(...acc)), (new THREE.Euler(y, z, x, 'YXZ'))]
}

onMounted(() => {
  if (!containerRef.value) throw new Error('containerRef is undefined')

  const { refresh, resize, dispose } = attach(containerRef.value)
  const update: (m: Meters) => void = combine(convert, (b) => refresh(...b))

  update(data.value)
  watch(data, update)

  window.addEventListener('resize', () => resize())
  onBeforeUnmount(dispose)
})


function combine<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return a => g(f(a))
}

</script>

<template>
  <div ref="containerRef" class="min-h-[300px] overflow-hidden"></div>
</template>