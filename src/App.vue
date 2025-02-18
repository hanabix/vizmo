<script setup lang="ts">
import PWABadge from './components/PWABadge.vue'
import { ref, onMounted } from 'vue'

const devices = ref<BluetoothDevice[]>([])

async function loadDevices() {
  try {
    devices.value = await navigator.bluetooth.getDevices()
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

async function connectDevice() {
  try {
    await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    })
    await loadDevices()
  } catch (error) {
    console.error('连接设备失败:', error)
  }
}

onMounted(loadDevices)
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-gray-600 flex items-center gap-1">
      <span class="material-icons text-blue-500">bluetooth</span>
      WitMotion
    </h1>
    <button class="p-2 hover:bg-gray-100 flex items-center">
      <span class="material-icons text-2xl text-gray-600">more_vert</span>
    </button>
  </nav>

  <main class="container mx-auto p-4 mt-20">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 已连接设备卡片 -->
      <div v-for="device in devices" :key="device.id" 
           class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-icons text-blue-500">bluetooth_connected</span>
          <div>
            <h3 class="font-medium text-gray-800">{{ device.name || device.id }}</h3>
          </div>
        </div>
        <button class="text-gray-600 hover:text-gray-800">
          <span class="material-icons">more_horiz</span>
        </button>
      </div>

      <!-- 添加新设备卡片 -->
      <button @click="connectDevice" 
              class="bg-white rounded-lg shadow p-4 flex items-center justify-center gap-2 hover:bg-gray-50">
        <span class="material-icons text-blue-500">add</span>
        <span class="text-gray-600">连接新设备</span>
      </button>
    </div>
  </main>

  <PWABadge />
</template>

<style scoped></style>
