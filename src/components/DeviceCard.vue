<script setup lang="ts">
import { ref, onMounted } from "vue"
import { agentOf, Rate, type Agent, type Meters, type Features, type Settings } from "../types/witmotion"
import BatteryIndicator from './BatteryIndicator.vue'

const { device, remove } = defineProps<{
  device: BluetoothDevice
  remove: () => void
}>()

const connecting = ref<boolean>(false)
const agentRef = ref<Agent<Features & Settings>>()
const battery = ref<number>(0)
const firmware = ref<string>('')
const meters = ref<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])

device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected')
  agentRef.value = undefined
})

async function connect() {
  connecting.value = true
  try {
    const agent = await agentOf(device.gatt!)
    battery.value = await agent.get('battery')
    firmware.value = await agent.get('firmware')

    
    console.log(await agent.set('rate', Rate.Hz_1).then(r => Rate[r]))
    agent.watch((data) => meters.value = data)

    agentRef.value = agent
  } catch (error) {
    console.error('连接设备失败:', error)
  } finally {
    connecting.value = false
  }
}

onMounted(connect)
</script>

<template>
  <div v-if="agentRef" class="bg-white rounded-lg shadow p-4 flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-medium text-gray-700">{{ device.name ?? device.id }}</h3>
        <BatteryIndicator :value="battery" />
      </div>
      <button @click="remove" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50" title="断开连接">
        <span class="material-icons">bluetooth_disabled</span>
      </button>
    </div>

    <div class="mt-4">
      <div class="mb-4">
        <small class="text-sm text-gray-500">ver: {{ firmware }}</small>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-50 p-3 rounded">
          <h4 class="text-sm font-medium text-gray-600 mb-2">加速度</h4>
          <div class="text-xs text-gray-500">
            <div>X: {{ meters[0][0].toFixed(2) }}g</div>
            <div>Y: {{ meters[0][1].toFixed(2) }}g</div>
            <div>Z: {{ meters[0][2].toFixed(2) }}g</div>
          </div>
        </div>

        <div class="bg-gray-50 p-3 rounded">
          <h4 class="text-sm font-medium text-gray-600 mb-2">陀螺仪</h4>
          <div class="text-xs text-gray-500">
            <div>X: {{ meters[1][0].toFixed(2) }}°/s</div>
            <div>Y: {{ meters[1][1].toFixed(2) }}°/s</div>
            <div>Z: {{ meters[1][2].toFixed(2) }}°/s</div>
          </div>
        </div>

        <div class="bg-gray-50 p-3 rounded">
          <h4 class="text-sm font-medium text-gray-600 mb-2">旋转角</h4>
          <div class="text-xs text-gray-500">
            <div>X: {{ meters[2][0].toFixed(2) }}°</div>
            <div>Y: {{ meters[2][1].toFixed(2) }}°</div>
            <div>Z: {{ meters[2][2].toFixed(2) }}°</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <button v-else @click="connect" :disabled="connecting" class="bg-white rounded-lg shadow p-4 flex flex-col w-full"
    :class="{ 'hover:bg-gray-50': !connecting }">
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-700">{{ device.name ?? device.id }}</h3>
    </div>
    <div class="mt-4 flex-1 flex items-center justify-center gap-2">
      <span class="material-icons text-blue-500" :class="{ 'animate-spin': connecting }">
        {{ connecting ? 'sync' : 'bluetooth_searching' }}
      </span>
      <span class="text-gray-700">{{ connecting ? '连接中...' : '尝试重连' }}</span>
    </div>
  </button>

</template>