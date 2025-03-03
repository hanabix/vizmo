<script setup lang="ts">
const { title } = defineProps<{
  title: string
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-medium text-gray-700">{{ title }}</h3>
        <slot name="subtitle"></slot>
      </div>
      <slot name="actions"></slot>
    </div>

    <slot name="content"></slot>
  </div>

</template>