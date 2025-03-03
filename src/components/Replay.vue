<script setup lang="ts">
import { provide, computed, inject, type Ref } from 'vue'
import { get } from '../modules/utils'
import type { Meters } from "../modules/wit-motion"
import Key from './key'

const { sequence } = defineProps<{
  sequence: ReadonlyArray<Meters>
}>()

const i = get(inject<Ref<number>>('cursor'))
const meters = computed(() => sequence[i.value])

provide(Key.meters, meters)
</script>

<template>
  <slot></slot>
</template>