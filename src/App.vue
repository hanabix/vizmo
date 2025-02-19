<script setup lang="ts">
import PWABadge from './components/PWABadge.vue'
import { ref, onMounted } from 'vue'

const devices = ref<BluetoothDevice[]>([])

async function load() {
  try {
    devices.value = await navigator.bluetooth.getDevices()
  } catch (error) {
    // chrome://flags/#enable-experimental-web-platform-features
    console.error('获取设备列表失败:', error)
  }
}

async function request() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    })

    if(devices.value.some(d => d.id === device.id))
      return

    devices.value.push(device)
  } catch (error) {
    console.error('连接设备失败:', error)
  }
}

onMounted(load)
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-gray-700 flex items-center gap-1">
      <span class="material-icons text-blue-500">bluetooth_connected</span>
      WitMotion
    </h1>
    <button class="p-2 hover:bg-gray-100 flex items-center">
      <span class="material-icons text-2xl text-gray-700">queue</span>
    </button>
  </nav>

  <main class="container mx-auto p-4 mt-20">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 已连接设备卡片 -->
      <div v-for="device in devices" :key="device.id" 
           class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div>
            <h3 class="font-medium text-gray-700">{{ device.name || device.id }}</h3>
          </div>
        </div>
        <button class="text-gray-700 hover:text-gray-900">
          <span class="material-icons">more_vert</span>
        </button>
      </div>

      <!-- 添加新设备卡片 -->
      <button @click="request" 
              class="bg-white rounded-lg shadow p-4 flex items-center justify-center gap-2 hover:bg-gray-50">
        <span class="material-icons text-blue-500">add</span>
        <span class="text-gray-700">添加设备</span>
      </button>
    </div>
  </main>

  <PWABadge />
</template>

<style scoped></style>
