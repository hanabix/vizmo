<script setup lang="ts">
import { provide, computed, inject } from 'vue'
import { complain } from '../modules/utils'
import type { Meters } from "../modules/wit-motion"
import Key from './key'

const { sequence } = defineProps<{
  sequence: ReadonlyArray<Meters>
}>()

const i = inject(Key.spike) ?? complain('failed to inject spike')
const meters = computed(() => sequence[i.value])

provide(Key.meters, meters)
</script>

<template>
  <slot></slot>
</template>