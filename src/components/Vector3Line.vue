<script setup lang="ts">
import { onMounted, ref, watch, inject, onBeforeUnmount } from 'vue'
import { complain } from '../modules/utils'
import type { Meters, Triple } from '../modules/wit-motion'
import plot from '../modules/plot'
import Key from './key'

const { mask } = defineProps<{
  mask: (m: Meters) => Triple
}>()

const container = ref<HTMLElement>()
const disposeRef = ref<() => void>(() => { })
const meters = inject(Key.meters) ?? complain('failed to inject meters')
const data: Triple[] = []

onMounted(async () => {
  if (!container.value) return

  const { react, dispose } = await plot(container.value)
  disposeRef.value = dispose

  watch(meters, (m) => {
    data.push(mask(m))
    react(data)
  })

})

onBeforeUnmount(() => {
  disposeRef.value()
})

</script>

<template>
  <div ref="container" class="h-[60px]"></div>
</template>