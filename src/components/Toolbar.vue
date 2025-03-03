<script setup lang="ts">
interface Button {
  icon: string
  label: string
  click: () => void
}

defineProps<{
  buttons: Button[]
}>()


</script>

<template>
  <div class="fixed bottom-4 inset-x-0">
    <div class="container mx-auto flex justify-center">
      <div class="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl px-8 py-3 flex gap-8">
        <template v-for="(button, index) in buttons" :key="index">
          <button 
            @click="button.click" 
            class="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-lg"
          >
            <span class="material-icons">{{ button.icon }}</span>
            <span>{{ button.label }}</span>
          </button>
          <div v-if="index < buttons.length - 1" class="w-px bg-gray-300"></div>
        </template>
      </div>
    </div>
  </div>
</template>