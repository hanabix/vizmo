<script setup lang="ts">
import { onMounted, ref, inject, onBeforeUnmount } from 'vue'
import { complain } from '../modules/utils'
import type { Triple } from '../modules/wit-motion'
import plot from '../modules/plot'
import Key from './key'

const { data } = defineProps<{
  data: Triple[],
}>()

const container = ref<HTMLElement>()
const disposeRef = ref<() => void>(() => { })
const spike = inject(Key.spike) ?? complain('failed to inject spike')

onMounted(async () => {
  if (!container.value) return

  const { react, dispose, on } = await plot(container.value)
  disposeRef.value = dispose
  react(data)

  on('plotly_click', (data) => {
    if (data.points && data.points.length > 0) {
      spike.value = data.points[0].pointIndex
    }
  })

})

onBeforeUnmount(() => {
  disposeRef.value()
})

</script>

<template>
  <div ref="container" class="h-[60px]"></div>
</template>