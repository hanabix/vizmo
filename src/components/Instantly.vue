<script setup lang="ts">
import { provide, shallowRef, shallowReadonly, onBeforeUnmount } from 'vue'
import type { Meters } from "../modules/wit-motion"
import Key from './key'

const { watch } = defineProps<{
  watch: (cb: (v: Meters) => void) => () => void,
}>()
const meters = shallowRef<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])
const cancel = watch((v) => meters.value = v)

provide(Key.meters, shallowReadonly(meters))
onBeforeUnmount(() => cancel())

</script>

<template>
  <slot></slot>
</template>